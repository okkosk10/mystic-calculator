/**
 * 패키지 추천 Mock 데이터
 * ⚠ 실제 게임 상품이 아닌 예시 데이터입니다.
 * 부족분 기준의 참고용 안내이며, 실제 구매는 게임 내 상점을 확인하세요.
 */

const packageRecommendations = [
  {
    id: 1,
    name: '소형 신비 보충 패키지',
    description: '부족분이 적을 때 고려. 소량 갈피 보충용.',
    priceLabel: '낮음',
    priority: 1,
  },
  {
    id: 2,
    name: '중형 하늘석 패키지',
    description: '비상런 추가 진행용. 하늘석 대량 확보 목적.',
    priceLabel: '중간',
    priority: 2,
  },
  {
    id: 3,
    name: '고효율 월간 패키지',
    description: '장기적으로 재화 효율을 볼 때 고려. 꾸준한 과금 유저에 적합.',
    priceLabel: '높음',
    priority: 3,
  },
];

export default packageRecommendations;
