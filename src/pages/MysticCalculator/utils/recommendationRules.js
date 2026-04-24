/**
 * 계산 결과에 따른 에장연 코멘트 규칙
 */

/**
 * @param {object} result - calculateMystic 반환값
 * @returns {string} 에장연 코멘트
 */
export function getMascotComment(result) {
  const { canReachPity, shortfallMedals, pity, emergencyRun, medals } = result;

  if (pity === 0) {
    return '천장까지 남은 횟수가 0이다 찍찍. 이미 천장을 달성했거나 새로 시작하는 거라면 횟수를 입력해보자!';
  }

  if (canReachPity) {
    if (medals >= result.requiredMysticMedals * 1.5) {
      return '갈피가 넘치고 있다 찍찍! 지금 당장 천장 가능! 여유 갈피까지 있으니 다음 천장도 노려볼 수 있다!';
    }
    return '지금 가진 재화로 천장 가능하다 찍찍.';
  }

  const avgRun = emergencyRun.average;
  const luckyRun = emergencyRun.lucky;

  if (avgRun.canReachPityWithRun) {
    return '비상런 평균 기준으로는 천장권에 들어온다 찍찍.';
  }

  if (luckyRun.canReachPityWithRun) {
    return `갈피가 ${shortfallMedals}개 부족하다 찍찍. 운이 좋으면 비상런으로 커버 가능하니 도전해볼 만하다!`;
  }

  return `부족하다 찍찍... 갈피가 ${shortfallMedals}개 모자란다. 현질 또는 존버 판단이 필요하다.`;
}

/**
 * 패키지 추천 영역 노출 여부 판단
 * 비상런 평균 기준으로도 천장 불가일 때만 노출
 * @param {object} result - calculateMystic 반환값
 * @returns {boolean}
 */
export function shouldShowPackage(result) {
  if (result.canReachPity) return false;
  return !result.emergencyRun.average.canReachPityWithRun;
}

