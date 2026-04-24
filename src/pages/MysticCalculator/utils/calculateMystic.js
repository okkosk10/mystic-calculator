/**
 * 신비뽑기 계산 유틸
 * 신비뽑기 1회 = 신비갈피 50개
 */

const MEDALS_PER_PULL = 50;

// 비밀상점 비상런 기준 (비밀상점 Lv.13 공식 확률표)
const SKYSTONES_PER_REROLL = 3;          // 리롤 1회 비용
const MEDAL_APPEAR_PROB = 0.001700646;   // 0.1700646% per 리롤
const MEDALS_PER_HIT = 3;               // 등장 시 구매 가능 수량

// 신비뽑기 5성 확률
const FIVE_STAR_PROB = 0.00625;          // 0.625% per 뽑기

/**
 * @param {object} input
 * @param {number} input.currentMysticMedals - 현재 보유 신비갈피
 * @param {number} input.currentSkystones - 현재 보유 하늘석
 * @param {number} input.remainingPityCount - 천장까지 남은 뽑기 횟수
 * @returns {object} 계산 결과
 */
export function calculateMystic({ currentMysticMedals, currentSkystones, remainingPityCount }) {
  const medals = Math.max(0, Math.floor(Number(currentMysticMedals) || 0));
  const skystones = Math.max(0, Math.floor(Number(currentSkystones) || 0));
  const pity = Math.min(200, Math.max(0, Math.floor(Number(remainingPityCount) || 0)));

  const requiredMysticMedals = pity * MEDALS_PER_PULL;
  const possiblePulls = Math.floor(medals / MEDALS_PER_PULL);
  const shortfallMedals = Math.max(requiredMysticMedals - medals, 0);
  const canReachPity = medals >= requiredMysticMedals;

  // 5성 확률: P = 1 - (1 - p)^n
  // 천장 전에 5성이 뜰 확률 (남은 pity 횟수 기준)
  const probBeforePity = pity > 0
    ? Math.round((1 - Math.pow(1 - FIVE_STAR_PROB, pity)) * 10000) / 100
    : 0;
  // 현재 갈피로 뽑는 동안 5성이 뜰 확률
  const probWithCurrentMedals = possiblePulls > 0
    ? Math.round((1 - Math.pow(1 - FIVE_STAR_PROB, possiblePulls)) * 10000) / 100
    : 0;

  // 비상런 확률 기반 계산 (이항분포)
  // E[갈피] = rerolls × p × medals_per_hit
  // σ       = sqrt(rerolls × p × (1-p)) × medals_per_hit
  const rerolls = Math.floor(skystones / SKYSTONES_PER_REROLL);
  const expectedHits = rerolls * MEDAL_APPEAR_PROB;
  const expectedMedals = expectedHits * MEDALS_PER_HIT;
  const stdDevMedals =
    Math.sqrt(rerolls * MEDAL_APPEAR_PROB * (1 - MEDAL_APPEAR_PROB)) * MEDALS_PER_HIT;

  const emergencyRun = {
    conservative: buildRunEntry(medals, Math.max(0, expectedMedals - stdDevMedals), requiredMysticMedals),
    average:      buildRunEntry(medals, expectedMedals, requiredMysticMedals),
    lucky:        buildRunEntry(medals, expectedMedals + stdDevMedals, requiredMysticMedals),
  };

  return {
    requiredMysticMedals,
    possiblePulls,
    shortfallMedals,
    canReachPity,
    emergencyRun,
    medals,
    skystones,
    pity,
    rerolls,
    expectedHits: Math.round(expectedHits * 10) / 10,
    probBeforePity,
    probWithCurrentMedals,
  };
}

function buildRunEntry(currentMedals, gainedFloat, requiredMedals) {
  const gainedMedals = Math.max(0, Math.round(gainedFloat));
  const totalMedals = currentMedals + gainedMedals;
  return {
    gainedMedals,
    extraPulls: Math.floor(gainedMedals / MEDALS_PER_PULL),
    totalMedals,
    canReachPityWithRun: totalMedals >= requiredMedals,
  };
}
