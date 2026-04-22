# PWA 아이콘 생성 가이드

`icon.svg`를 기반으로 PNG 아이콘을 생성해야 합니다.

## 방법 1: 온라인 도구 (가장 빠름)

1. https://www.pwabuilder.com/imageGenerator 접속
2. `icon.svg` 업로드
3. 모든 크기 자동 생성 후 다운로드
4. 이 폴더(`public/icons/`)에 파일 배치

## 방법 2: sharp (Node.js)

프로젝트 루트에서 실행:

```bash
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
// maskable (패딩 20% 추가)
[192, 512].forEach(size => {
  const pad = Math.floor(size * 0.1);
  sharp('public/icons/icon.svg')
    .resize(size - pad*2, size - pad*2)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: '#f43f5e' })
    .png()
    .toFile(\`public/icons/icon-\${size}-maskable.png\`);
});
// Apple touch icon
sharp('public/icons/icon.svg').resize(180, 180).png().toFile('public/icons/apple-touch-icon.png');
"
```

## 방법 3: Squoosh CLI

```bash
npx @squoosh/cli --resize '{"width":192}' --output-dir public/icons icon.svg
```

## 필요한 파일 목록

| 파일명 | 크기 | 용도 |
|--------|------|------|
| icon-72.png | 72×72 | Android 레거시 |
| icon-96.png | 96×96 | Android |
| icon-128.png | 128×128 | Chrome 웹스토어 |
| icon-144.png | 144×144 | Windows 타일 |
| icon-152.png | 152×152 | iPad |
| icon-192.png | 192×192 | Android Chrome (필수) |
| icon-192-maskable.png | 192×192 | Android 적응형 아이콘 |
| icon-384.png | 384×384 | Android |
| icon-512.png | 512×512 | PWA 설치 프롬프트 (필수) |
| icon-512-maskable.png | 512×512 | Android 적응형 아이콘 |
| apple-touch-icon.png | 180×180 | iOS 홈 화면 |

## Splash Screen (선택사항, iOS)

| 파일명 | 크기 | 기기 |
|--------|------|------|
| splash-1290x2796.png | 1290×2796 | iPhone 14 Pro Max |
| splash-1170x2532.png | 1170×2532 | iPhone 14/13/12 |
