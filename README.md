# WingMatch 💘

> 친구가 대신 스와이프해서 소개시켜주는 새로운 방식의 매칭 앱

**WingMatch**는 본인이 직접 스와이프하는 대신, 친구(Wingman)가 대신 스와이프해서 소개를 연결해주는 소셜 데이팅 앱입니다.  
Next.js 15 App Router + Supabase + PWA 기반으로 구축된 풀스택 프로젝트입니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 🔐 인증 | 이메일/비밀번호 + Google OAuth (Supabase Auth) |
| 👤 온보딩 | 인스타그램 ID, 나이, 성별, 지역, 자기소개 등록 |
| 🃏 스와이프 | Tinder 스타일 카드 스와이프 (framer-motion 물리 애니메이션) |
| 💘 매칭 | 서로 Like 시 자동 매칭 + 실시간 배너 알림 |
| 📋 매칭 리스트 | 매칭된 상대방 인스타그램 바로가기 + 상세 모달 |
| 🚩 신고/차단 | 부적절한 사용자 신고 및 차단 (차단 시 매칭 자동 해제) |
| 📲 PWA | 모바일 홈 화면 설치 가능, 오프라인 지원, iOS safe area |
| ⚡ Realtime | Supabase Realtime으로 매칭 즉시 알림 |

---

## 기술 스택

```
Frontend   Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
Animation  framer-motion (스와이프 물리, 매칭 배너)
Backend    Supabase (PostgreSQL + Auth + Storage + Realtime)
PWA        Web App Manifest + Service Worker (Cache First / Network First)
Deploy     Vercel (자동 배포)
```

---

## 로컬 개발 환경 설정

### 1. 사전 요구사항

- **Node.js** 20.x 이상 ([다운로드](https://nodejs.org))
- **npm** 10.x 이상 (Node.js에 포함)
- **Supabase 계정** ([supabase.com](https://supabase.com))

### 2. 저장소 클론

```bash
git clone https://github.com/your-username/wingmatch.git
cd wingmatch
```

### 3. 의존성 설치

```bash
npm install
```

### 4. 환경변수 설정

```bash
cp .env.example .env.local
```

`.env.local`을 열어 Supabase 값으로 교체합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Supabase 값 확인: **Supabase Dashboard → 프로젝트 선택 → Settings → API**

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## Supabase 데이터베이스 설정

### 테이블 생성

`supabase/migrations/` 폴더의 SQL 파일을 순서대로 실행합니다.

**Supabase Dashboard → SQL Editor**에서 아래 순서로 실행:

#### 1단계: 기본 테이블 (Week 1–2)

```sql
-- profiles, card_photos, swipes, matches 테이블
-- (migrations/001_initial_schema.sql 내용 붙여넣기)
```

#### 2단계: Realtime 활성화

```sql
-- matches 테이블 Realtime 활성화 (Week 3)
ALTER TABLE matches REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
```

#### 3단계: 신고/차단 테이블 (Week 4)

```sql
-- (migrations/003_reports_blocked_users.sql 내용 붙여넣기)
```

### Storage 버킷 생성

**Supabase Dashboard → Storage → New bucket**

| 버킷 이름 | 공개 여부 | 용도 |
|-----------|-----------|------|
| `card-photos` | Public | 프로필 카드 사진 |

Storage 정책 추가 (SQL Editor):

```sql
-- 인증된 사용자만 업로드 가능
CREATE POLICY "auth users can upload"
ON storage.objects FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 공개 읽기
CREATE POLICY "public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'card-photos');
```

### Google OAuth 설정 (선택)

1. [Google Cloud Console](https://console.cloud.google.com) → **사용자 인증 정보 → OAuth 2.0 클라이언트 ID 생성**
2. 승인된 리디렉션 URI:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
3. **Supabase Dashboard → Authentication → Providers → Google** 에서 Client ID / Secret 입력

---

## PWA 아이콘 생성

`public/icons/icon.svg`를 PNG로 변환해야 합니다.

```bash
# sharp 설치 후 변환 스크립트 실행
npm install sharp --save-dev

node -e "
const sharp = require('sharp');
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
sizes.forEach(size => {
  sharp('public/icons/icon.svg')
    .resize(size, size)
    .png()
    .toFile(\`public/icons/icon-\${size}.png\`);
});
[192, 512].forEach(size => {
  const pad = Math.floor(size * 0.1);
  sharp('public/icons/icon.svg')
    .resize(size - pad*2, size - pad*2)
    .extend({ top: pad, bottom: pad, left: pad, right: pad,
               background: '#f43f5e' })
    .png()
    .toFile(\`public/icons/icon-\${size}-maskable.png\`);
});
sharp('public/icons/icon.svg').resize(180, 180).png()
  .toFile('public/icons/apple-touch-icon.png');
"
```

또는 [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)를 사용해 `icon.svg` 업로드 후 자동 생성.

---

## Vercel 배포

### 방법 1: Vercel CLI (권장)

```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 배포 (프로젝트 루트에서 실행)
vercel

# 프로덕션 배포
vercel --prod
```

### 방법 2: GitHub 연동 (자동 배포)

1. GitHub에 코드 푸시
2. [vercel.com](https://vercel.com) → **New Project → Import Git Repository**
3. 저장소 선택 → **Import**
4. **Environment Variables** 탭에서 아래 값 입력:

   | 키 | 값 |
   |----|----|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key |
   | `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

5. **Deploy** 클릭

> `main` 브랜치에 푸시할 때마다 자동으로 프로덕션 배포됩니다.

### 배포 후 Supabase URL 업데이트

배포 완료 후 Supabase Dashboard에서 허용 URL을 추가합니다.

**Authentication → URL Configuration**:

```
Site URL:
  https://your-app.vercel.app

Redirect URLs:
  https://your-app.vercel.app/auth/callback
  http://localhost:3000/auth/callback
```

---

## 빌드 & 타입 체크

```bash
# 타입 에러 확인
npm run type-check

# 린트 검사
npm run lint

# 프로덕션 빌드 (로컬 테스트)
npm run build
npm run start
```

---

## 프로젝트 구조

```
wingmatch/
├── app/                          # Next.js App Router
│   ├── (main)/layout.tsx         # 인증 후 공통 레이아웃 (route group)
│   ├── auth/callback/route.ts    # OAuth 콜백 핸들러
│   ├── home/                     # 홈 대시보드
│   ├── wingman/                  # 스와이프 화면
│   │   ├── page.tsx              # 서버 컴포넌트 (초기 카드 fetch)
│   │   ├── WingmanClient.tsx     # 클라이언트 (스와이프 + Realtime)
│   │   ├── actions.ts            # Server Actions (recordSwipe, getWingmanCards)
│   │   └── loading.tsx           # 로딩 스켈레톤
│   ├── matches/                  # 매칭 리스트
│   ├── profile/setup/            # 온보딩 폼
│   ├── login/                    # 로그인
│   ├── signup/                   # 회원가입
│   ├── actions/report.ts         # 신고/차단 Server Actions
│   ├── error.tsx                 # 전역 에러 바운더리
│   ├── not-found.tsx             # 404 페이지
│   ├── layout.tsx                # Root Layout (PWA 메타, fonts)
│   ├── manifest.ts               # PWA Manifest
│   └── globals.css               # Tailwind + shadcn CSS 변수
│
├── components/
│   ├── layout/BottomNav.tsx      # 모바일 하단 탭 네비게이션
│   ├── match/
│   │   ├── MatchBanner.tsx       # 매칭 성공 애니메이션 오버레이
│   │   └── MatchCard.tsx         # 매칭 리스트 카드
│   ├── swipe/
│   │   ├── SwipeCard.tsx         # 단일 스와이프 카드 (신고/차단 메뉴 포함)
│   │   └── SwipeStack.tsx        # 카드 스택 매니저
│   ├── pwa/ServiceWorkerRegister.tsx
│   └── ui/                       # shadcn/ui 컴포넌트
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # 브라우저 클라이언트
│   │   ├── server.ts             # 서버 클라이언트 (async cookies)
│   │   └── middleware.ts         # 세션 갱신 + 라우트 가드
│   ├── types/
│   │   ├── database.types.ts     # Supabase DB 타입 정의
│   │   └── swipe.types.ts        # 스와이프 관련 타입
│   └── utils.ts                  # cn() 유틸리티
│
├── public/
│   ├── icons/                    # PWA 아이콘
│   └── sw.js                     # Service Worker
│
├── supabase/migrations/          # DB 마이그레이션 SQL
├── middleware.ts                 # Next.js 미들웨어 (인증 가드)
├── next.config.ts                # Next.js 설정
├── tailwind.config.ts            # Tailwind 설정
├── tsconfig.json                 # TypeScript 설정
├── vercel.json                   # Vercel 배포 설정
└── .env.example                  # 환경변수 템플릿
```

---

## 개발 로드맵

- [x] **Week 1** — 인증 (이메일 + Google OAuth), 온보딩 프로필 등록
- [x] **Week 2** — 스와이프 카드 UI (framer-motion), DB 연동
- [x] **Week 3** — 매칭 시스템 (checkAndCreateMatch), Realtime 알림
- [x] **Week 4** — PWA 설정, 매칭 리스트 페이지, 신고/차단, Vercel 배포
- [ ] **Week 5** — 채팅 시스템, 푸시 알림, 관리자 대시보드

---

## 알려진 제한사항 (MVP)

| 항목 | 현황 | 해결 방법 |
|------|------|-----------|
| `checkAndCreateMatch` | anon key로 상대방 swipe 조회 불가 (RLS 제한) | DB 트리거 또는 Service Role 사용 |
| 프로필 사진 업로드 | Supabase Storage 직접 연동 필요 | 별도 업로드 페이지 구현 필요 |
| 채팅 | 미구현 (인스타 DM으로 유도) | Week 5에서 구현 예정 |
| Rate Limiting | 미구현 | Vercel Edge Middleware 또는 Upstash Redis 활용 |

---

## 기여 / 라이선스

개인 프로젝트입니다. 문의는 인스타그램 DM으로 연락해주세요. 🙏
