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
    return '현재 갈피만으로 천장 달성 가능하다 찍찍! 바로 소환하러 가면 된다!';
  }

  // 천장 불가 케이스
  const avgRun = emergencyRun.average;
  const luckyRun = emergencyRun.lucky;

  if (luckyRun.canReachPityWithRun) {
    return `지금은 갈피가 ${shortfallMedals}개 부족하다 찍찍. 하늘석을 운좋게 굴리면 천장 가능하니 비상런을 노려볼 만하다!`;
  }

  if (avgRun.canReachPityWithRun) {
    return `갈피가 ${shortfallMedals}개 부족하다 찍찍. 평균 비상런이면 천장 가능! 하늘석을 아껴왔다면 도전해보자.`;
  }

  return `갈피가 ${shortfallMedals}개 부족하다 찍찍. 비상런을 더 돌리거나 존버가 필요하다. 포기하지 마라 찍!`;
}
