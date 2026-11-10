# AIRA — 모바일 인터랙션 프로토타입

공항 픽업 모빌리티 서비스 **AIRA**의 모바일 화면 프로토타입입니다. 피그마 디자인(UX졸업전시)을 그대로 옮기고 인터랙션 모션을 더했습니다.

**흐름:** HOME → 탑승권 업로드·스캔 → 도착 시간·인원 예약 → 잠금화면 알림 → 지도 → 엔딩

**의자 디스플레이** (`/display`, 2388×834 가로 화면): 웰컴 → 탑승권 스캔 → 홈 / 미디어 / 공항 콘텐츠. 주소: https://junghip.github.io/AIRA-app/display — `R` 키로 처음부터 다시, 아래 시계를 더블클릭해도 처음으로.

**차량 창문** (`/window`, 1920×1080 가로 화면): 웰컴 → 좌석 안내 → 탑승 대기 → 출발 → 대시보드(MENU: AIRA Route / OUR FLIGHT / PHOTO) → Haeun 추천 → 경로에 Lounge Coffee 추가 → 카페 도착 → 게이트 변경 16→47 → 바뀐 경로 → Gate 47 도착 → See you. 주소: https://junghip.github.io/AIRA-app/window — 화면 클릭·→·스페이스로 다음, ← 이전, `R` 처음부터, Esc 메뉴 닫기.

## 실행

```bash
npm install
npm run dev
```

## 배포 (GitHub Pages)

```bash
npm run deploy
```

빌드 결과를 `gh-pages` 브랜치로 올립니다. 주소: https://junghip.github.io/AIRA-app/

## 구성

- Vite + React + TypeScript
- [Motion](https://motion.dev) — 화면 전환, 스프링, 드래그 인터랙션
- `src/screens/` — 화면별 코드 (home, pass, reserve, aira)
- `src/display/` — 의자 디스플레이 (피그마 Section 8)
- `src/window/` — 차량 창문 (피그마 Section 10, 메뉴는 Section 9)
- `src/motion/transitions.ts` — 공통 모션 값
