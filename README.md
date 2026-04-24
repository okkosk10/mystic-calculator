신비뽑기 계산기 (Mystic Calculator)

에픽세븐 신비뽑기 천장 계산, 비상런 예측, 과금 효율 분석을 위한 웹 애플리케이션입니다.

프로젝트 소개

신비뽑기에서 가장 중요한 요소인 천장까지의 거리, 현재 자원으로 가능한 뽑기 횟수,
그리고 비상런 및 과금 효율을 한 번에 계산할 수 있는 도구입니다.

단순 계산기를 넘어,
확률 기반 분석과 사용자 행동 가이드를 제공하는 것을 목표로 합니다.

주요 기능
✅ 신비뽑기 천장 계산
✅ 현재 보유 자원 기반 뽑기 가능 횟수 계산
✅ 비상런(상점 갱신) 예상 획득량 계산
✅ 과금 효율 분석 및 추천
✅ 상황별 추천 액션 제공 (존버 / 진행 / 과금)
핵심 로직
입력값:
- 신비갈피
- 하늘석
- 천장까지 남은 횟수

계산:
- 필요 신비갈피 = 남은 뽑기 횟수 × 50
- 현재 가능 뽑기 수 = 보유 신비갈피 / 50
- 부족분 계산
- 비상런 기대값 (보수 / 평균 / 운좋음 시나리오)

출력:
- 천장 가능 여부
- 부족 자원
- 추천 액션

기술 스택
Frontend: React + Vite
Styling: TailwindCSS v3
State Management: Zustand
Chart: (추후 적용 예정)
Storage: LocalStorage
Deployment: Vercel

프로젝트 구조
src/
  pages/
    MysticCalculator/
      index.jsx
      components/
        MysticInputForm.jsx
        MysticResultCard.jsx
        MysticRunEstimate.jsx
        RecommendationPanel.jsx
      utils/
        calculateMystic.js
        recommendationRules.js
      store/
        useMysticStore.js

기획 의도

기존에는 신비뽑기를 진행할 때
"지금 뽑아도 되는지", "천장까지 가능한지"를 감으로 판단하는 경우가 많았습니다.

이 프로젝트는 이를 해결하기 위해:

정량적인 계산 제공
확률 기반 분석
명확한 의사결정 가이드

를 목표로 제작되었습니다.

향후 확장 계획
성약뽑기 계산기 추가
장비 강화 확률 계산 기능
사용자 데이터 저장 (로그 기반 분석)
통계 및 시각화 기능 추가
모바일 앱(PWA / Flutter) 확장

실행 방법
yarn install
yarn dev

배포

Vercel을 통해 배포 예정
