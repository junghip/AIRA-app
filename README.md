# AIRA — 모바일 인터랙션 프로토타입

공항 픽업 모빌리티 서비스 **AIRA**의 모바일 화면 프로토타입입니다. 피그마 디자인(UX졸업전시)을 그대로 옮기고 인터랙션 모션을 더했습니다.

**흐름:** HOME → 탑승권 업로드·스캔 → 도착 시간·인원 예약 → 잠금화면 알림 → 지도 → 엔딩

**의자 디스플레이** (`/display`, 2388×834 가로 화면): 웰컴 → 탑승권 스캔 → 홈 / 미디어 / 공항 콘텐츠. 주소: https://junghip.github.io/AIRA-app/display — `R` 키로 처음부터 다시, 아래 시계를 더블클릭해도 처음으로.

**차량 창문** (`/window`, 1920×1080 가로 화면): 웰컴 → 탑승 대기 → 모두 탑승 → 출발(진행선) → 대시보드(MENU: AIRA Route / OUR FLIGHT) → AIRA Route → Eden 추천 → 경로에 Dunkin 추가 → 카페 도착 → 게이트 변경 16→47 → 바뀐 경로 → OUR FLIGHT(베를린) → See you. 주소: https://junghip.github.io/AIRA-app/window — 장면이 저절로 순서대로 넘어가고 끝나면 처음부터 반복 (`P` 멈춤/재생). 화면 터치·→·스페이스로 바로 다음, ← 이전, `R` 처음부터, Esc 메뉴 닫기. 배경은 영상 합성용 검정 — 주소에 `?photo`를 붙이면 창밖 사진이 보임. 영상 파일을 화면에 끌어다 놓으면 배경으로 깔려 유리 흐림까지 그대로 보임 (내 컴퓨터에서만 재생, `R`로 영상도 처음부터, `V`로 다시 검정).

**포토부스** (`/booth`, 아이패드 세로): 시작 → 배경 고르기(기본 · 공항 · AIRA 차량 · 배경 그대로) → 3·2·1 카운트다운으로 네 컷 → 한 장으로 합쳐 QR 표시. 주소: https://junghip.github.io/AIRA-app/booth — 90초 뒤 자동으로 처음 화면, 로고를 두 번 누르면 바로 처음으로. 사람만 오려내는 건 MediaPipe(브라우저 안에서 처리, 사진이 다른 곳으로 가지 않음). 배경 추가는 `src/booth/backgrounds.ts`에 한 줄.

**사진 받기 · 방명록** (`/photo/:id`, 모바일): QR로 열면 네 컷 저장(아이폰은 공유 시트 → 이미지 저장), 이름 바꾸기, 방명록(글 + 사진 첨부, 내 글 삭제).

### 포토부스 저장소 설정 (Supabase, 무료)

1. https://supabase.com 에서 새 프로젝트 만들기
2. SQL Editor에 `supabase/booth.sql` 내용을 붙여넣고 Run
3. `.env.example`을 `.env.local`로 복사하고 Project Settings → API의 URL과 anon key 입력
4. `npm run deploy`

`.env.local`이 없으면 테스트 모드 — 이 브라우저에만 저장돼서 같은 컴퓨터의 다른 탭에서만 열려요.

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
- `src/booth/` — 포토부스(아이패드) + 사진 받기·방명록(모바일)
- `src/window/` — 차량 창문 (피그마 "창문 디벨롭할게요" 섹션 532:3176)
- `src/motion/transitions.ts` — 공통 모션 값
