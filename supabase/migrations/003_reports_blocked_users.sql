-- =============================================================
-- Migration 003: reports & blocked_users 테이블
-- =============================================================
-- Supabase SQL Editor 또는 supabase db push로 실행
-- 실행 순서: 001_profiles → 002_matches → 003_reports_blocked_users
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. ENUM: 신고 사유
-- ─────────────────────────────────────────────────────────────

CREATE TYPE report_reason AS ENUM (
  'fake_profile',       -- 가짜/허위 프로필
  'inappropriate_photo',-- 부적절한 사진
  'harassment',         -- 괴롭힘/스팸 DM
  'underage',           -- 미성년자 의심
  'scam',               -- 사기/스캠
  'other'               -- 기타
);

-- ─────────────────────────────────────────────────────────────
-- 2. reports 테이블
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reports (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_id  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  reason       report_reason NOT NULL,
  details      TEXT,             -- 사용자가 직접 입력한 상세 내용 (선택)

  status       TEXT        NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),

  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 같은 유저를 동일 사유로 중복 신고 방지
  -- (사유가 다르면 다시 신고 가능)
  CONSTRAINT reports_unique_per_reason
    UNIQUE (reporter_id, reported_id, reason),

  -- 자기 자신 신고 방지
  CONSTRAINT reports_no_self_report
    CHECK (reporter_id <> reported_id)
);

COMMENT ON TABLE  reports                IS '사용자 신고 기록';
COMMENT ON COLUMN reports.reporter_id   IS '신고한 사람';
COMMENT ON COLUMN reports.reported_id   IS '신고당한 사람';
COMMENT ON COLUMN reports.reason        IS '신고 사유 (ENUM)';
COMMENT ON COLUMN reports.details       IS '사용자 추가 설명 (선택)';
COMMENT ON COLUMN reports.status        IS 'pending(접수) | reviewed(검토중) | resolved(처리완료) | dismissed(기각)';

-- ─────────────────────────────────────────────────────────────
-- 3. blocked_users 테이블
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS blocked_users (
  blocker_id   UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id   UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 복합 PK → 중복 차단 자동 방지
  PRIMARY KEY (blocker_id, blocked_id),

  -- 자기 자신 차단 방지
  CONSTRAINT blocked_users_no_self_block
    CHECK (blocker_id <> blocked_id)
);

COMMENT ON TABLE  blocked_users             IS '사용자 차단 목록';
COMMENT ON COLUMN blocked_users.blocker_id  IS '차단한 사람';
COMMENT ON COLUMN blocked_users.blocked_id  IS '차단당한 사람';

-- ─────────────────────────────────────────────────────────────
-- 4. 인덱스
-- ─────────────────────────────────────────────────────────────

-- reports: 내가 신고한 목록 조회
CREATE INDEX IF NOT EXISTS idx_reports_reporter
  ON reports (reporter_id, created_at DESC);

-- reports: 특정 유저가 신고받은 목록 (관리자용)
CREATE INDEX IF NOT EXISTS idx_reports_reported
  ON reports (reported_id, created_at DESC);

-- blocked_users: 내가 차단한 목록 빠른 조회
-- (getWingmanCards에서 NOT IN 필터에 사용)
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker
  ON blocked_users (blocker_id);

-- blocked_users: 나를 차단한 사람 조회 (역방향 차단 확인)
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked
  ON blocked_users (blocked_id);

-- ─────────────────────────────────────────────────────────────
-- 5. Row Level Security (RLS)
-- ─────────────────────────────────────────────────────────────

-- ── reports RLS ───────────────────────────────────────────────

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 신고 생성: 본인만 (reporter_id = auth.uid())
CREATE POLICY "reports_insert_own"
  ON reports FOR INSERT
  WITH CHECK (reporter_id = auth.uid());

-- 신고 조회: 본인이 신고한 것만 (관리자 기능은 서비스 롤 사용)
CREATE POLICY "reports_select_own"
  ON reports FOR SELECT
  USING (reporter_id = auth.uid());

-- 신고 수정/삭제: 허용 안 함 (관리자만 서비스 롤로 처리)

-- ── blocked_users RLS ─────────────────────────────────────────

ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- 차단 생성: 본인만 (blocker_id = auth.uid())
CREATE POLICY "blocked_users_insert_own"
  ON blocked_users FOR INSERT
  WITH CHECK (blocker_id = auth.uid());

-- 차단 조회: 본인이 차단한 목록만
CREATE POLICY "blocked_users_select_own"
  ON blocked_users FOR SELECT
  USING (blocker_id = auth.uid());

-- 차단 해제: 본인만 (DELETE)
CREATE POLICY "blocked_users_delete_own"
  ON blocked_users FOR DELETE
  USING (blocker_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- 6. getWingmanCards 연동용 helper view (선택사항)
-- ─────────────────────────────────────────────────────────────

/**
 * v_my_blocked_ids
 *
 * 현재 유저가 차단한 사람 ID 목록 뷰
 * getWingmanCards() 서버 액션에서 직접 쿼리로도 처리 가능하므로
 * 이 뷰는 선택사항 (필요 시 활성화)
 *
 * CREATE OR REPLACE VIEW v_my_blocked_ids AS
 * SELECT blocked_id AS id
 * FROM blocked_users
 * WHERE blocker_id = auth.uid();
 *
 * → RLS와 함께 사용 시 auth.uid()가 뷰에 정상 적용됨
 */

-- ─────────────────────────────────────────────────────────────
-- 7. 차단 시 매칭 자동 unmatched 처리 트리거 (권장)
-- ─────────────────────────────────────────────────────────────

/**
 * 차단이 발생하면 기존 매칭을 unmatched로 변경
 *
 * 이 트리거는 서비스 정책에 따라 선택 적용:
 *   - 차단 즉시 매칭 해제를 원하면 활성화
 *   - 차단해도 기존 매칭 유지를 원하면 비활성화
 */

CREATE OR REPLACE FUNCTION fn_block_unmatch()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER  -- RLS 우회 (트리거는 시스템 권한으로 실행)
AS $$
BEGIN
  -- 두 유저 사이의 활성 매칭을 unmatched로 변경
  UPDATE matches
  SET    status = 'unmatched'
  WHERE  status = 'active'
    AND  (
      (user1_id = NEW.blocker_id AND user2_id = NEW.blocked_id)
      OR
      (user1_id = NEW.blocked_id AND user2_id = NEW.blocker_id)
    );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_block_unmatch
  AFTER INSERT ON blocked_users
  FOR EACH ROW
  EXECUTE FUNCTION fn_block_unmatch();

-- ─────────────────────────────────────────────────────────────
-- 8. 확인 쿼리 (실행 후 검증)
-- ─────────────────────────────────────────────────────────────

-- SELECT table_name, row_security
-- FROM information_schema.tables
-- WHERE table_name IN ('reports', 'blocked_users');
