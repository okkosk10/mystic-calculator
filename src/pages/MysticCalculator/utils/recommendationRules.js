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
    return '천장까지 남은 횟수 0읾... 이미 찍엇거나 새로 시잒하는 거면 횟수 다시 입력해보라';
  }

  if (canReachPity) {
    if (medals >= result.requiredMysticMedals * 1.5) {
      return '갈피가 넘쳐난닮 지금 바로 천장 가능읾 여유까지 잇어서 다음 천장도 노려볼 만핢';
    }
    return '지금 가진 재화로 천장 가능읾';
  }

  const avgRun = emergencyRun.average;
  const luckyRun = emergencyRun.lucky;

  if (avgRun.canReachPityWithRun) {
    return '비상런 평균 기준이면 천장권 들어온닮 이건 무난하게 간닮';
  }

  if (luckyRun.canReachPityWithRun) {
    return `갈피가 ${shortfallMedals}개 부죡핢 운 좋으면 비상런으로 커버 가능하니 도전해볼 만핢`;
  }

  return `부죡핢 갈피가 ${shortfallMedals}개 모자랆 현질이냐 존버냐 판닪해야 하는 구간읾`;
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

