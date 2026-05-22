/**
 * 신비뽑기 계산 유틸
 * 신비뽑기 1회 = 신비 메달(갈피) 50개
 */

// ── 신비뽑기 단위 ──
export const MEDALS_PER_PULL = 50; // 1회 뽑기 = 신비 메달 50개

// ── 비밀상점 비상런 기준 (비밀상점 Lv.13 공식 확률표) ──
export const SKYSTONES_PER_REROLL = 3;              // 리롤 1회 비용 (하늘석)
export const SECRET_SHOP_SLOT_COUNT = 6;            // 리롤 1회에 노출되는 상품 슬롯 수
export const MEDAL_APPEAR_PROB_PER_SLOT = 0.001700646; // 0.1700646% per 슬롯
export const MEDAL_APPEAR_PROB =
  1 - Math.pow(1 - MEDAL_APPEAR_PROB_PER_SLOT, SECRET_SHOP_SLOT_COUNT); // 약 1.016% per 리롤
export const MEDALS_PER_HIT = 50;                  // 등장 시 구매 가능 신비 메달 수량 (= MEDALS_PER_PULL)

// ── 초반 30뽑 30% 할인 관련 상수 ──
export const EARLY_DISCOUNT_MAX_PULLS = 30;   // 할인 적용 최대 횟수
export const DISCOUNTED_MEDALS_PER_PULL = 35; // ceil(50 × 0.7) = 35 (할인 1회 비용)
// 절약액: MEDALS_PER_PULL - DISCOUNTED_MEDALS_PER_PULL = 15 개/회

// 신비뽑기 5성 확률
const FIVE_STAR_PROB = 0.00625; // 0.625% per 뽑기

/**
 * 주어진 신비 메달로 몇 번 뽑을 수 있는지 계산 (할인 옵션 반영)
 * - 할인 ON: 먼저 (EARLY_DISCOUNT_MAX_PULLS - alreadyUsedDiscount)회까지 35개/회, 나머지 50개/회
 * - 할인 OFF: 전부 50개/회
 * @param {number} availableMedals  - 사용 가능한 신비 메달
 * @param {number} remainingPity    - 남은 천장 횟수 (clamp 상한)
 * @param {number} alreadyUsedDiscount - 이미 소진한 할인 횟수
 * @param {boolean} useEarlyDiscount
 * @returns {number} 가능한 뽑기 횟수
 */
function computePulls(availableMedals, remainingPity, alreadyUsedDiscount, useEarlyDiscount) {
  if (remainingPity <= 0 || availableMedals <= 0) return 0;
  if (!useEarlyDiscount) {
    return Math.min(remainingPity, Math.floor(availableMedals / MEDALS_PER_PULL));
  }
  // 아직 남은 할인 횟수 (천장 범위 내로 clamp)
  const discountLeft = Math.max(0, EARLY_DISCOUNT_MAX_PULLS - alreadyUsedDiscount);
  const discountAvail = Math.min(discountLeft, remainingPity);
  const discountCost = discountAvail * DISCOUNTED_MEDALS_PER_PULL;

  if (availableMedals < discountCost) {
    // 할인 구간 안에서만 뽑기 가능
    return Math.floor(availableMedals / DISCOUNTED_MEDALS_PER_PULL);
  }
  // 할인 구간을 모두 소진 → 나머지는 일반 비용
  const remaining = availableMedals - discountCost;
  const regularPulls = Math.min(remainingPity - discountAvail, Math.floor(remaining / MEDALS_PER_PULL));
  return discountAvail + regularPulls;
}

/**
 * @param {object} input
 * @param {number} input.currentMysticMedals   - 현재 보유 신비 메달(갈피)
 * @param {number} input.currentSkystones      - 현재 보유 하늘석
 * @param {number} input.remainingPityCount    - 천장까지 남은 뽑기 횟수
 * @param {boolean} [input.useEarlyDiscount=false] - 초반 30뽑 30% 할인 옵션
 * @returns {object} 계산 결과
 */
export function calculateMystic({
  currentMysticMedals,
  currentSkystones,
  remainingPityCount,
  useEarlyDiscount = false,
}) {
  const medals = Math.max(0, Math.floor(Number(currentMysticMedals) || 0));
  const skystones = Math.max(0, Math.floor(Number(currentSkystones) || 0));
  const pity = Math.min(200, Math.max(0, Math.floor(Number(remainingPityCount) || 0)));

  // ── 필요 신비 메달 계산 ──
  // 할인 ON:  앞 30회 × 35개 + 나머지 × 50개
  // 할인 OFF: 전 회 × 50개
  const discountedPulls = useEarlyDiscount ? Math.min(EARLY_DISCOUNT_MAX_PULLS, pity) : 0;
  const regularPulls = useEarlyDiscount ? Math.max(0, pity - EARLY_DISCOUNT_MAX_PULLS) : pity;
  // 절약 = 할인 횟수 × (50 - 35) = × 15
  const discountSavedMedals = discountedPulls * (MEDALS_PER_PULL - DISCOUNTED_MEDALS_PER_PULL);
  const requiredMysticMedals =
    discountedPulls * DISCOUNTED_MEDALS_PER_PULL + regularPulls * MEDALS_PER_PULL;

  // ── 가능 뽑기 수 (할인 반영) ──
  const possiblePulls = computePulls(medals, pity, 0, useEarlyDiscount);

  const shortfallMedals = Math.max(requiredMysticMedals - medals, 0);
  const canReachPity = medals >= requiredMysticMedals;

  // ── 5성 확률: P = 1 - (1 - p)^n ──
  // probBeforePity: 남은 pity 횟수 기준 (할인 여부 무관)
  const probBeforePity = pity > 0
    ? Math.round((1 - Math.pow(1 - FIVE_STAR_PROB, pity)) * 10000) / 100
    : 0;
  // probWithCurrentMedals: 할인 반영된 possiblePulls 기준
  const probWithCurrentMedals = possiblePulls > 0
    ? Math.round((1 - Math.pow(1 - FIVE_STAR_PROB, possiblePulls)) * 10000) / 100
    : 0;

  // ── 비상런 확률 기반 계산 (이항분포) ──
  // E[메달] = rerolls × p × medals_per_hit  (단위: 신비 메달)
  // σ       = sqrt(rerolls × p × (1-p)) × medals_per_hit
  const rerolls = Math.floor(skystones / SKYSTONES_PER_REROLL);
  const expectedHits = rerolls * MEDAL_APPEAR_PROB;
  const expectedMedals = expectedHits * MEDALS_PER_HIT;
  const stdDevMedals =
    Math.sqrt(rerolls * MEDAL_APPEAR_PROB * (1 - MEDAL_APPEAR_PROB)) * MEDALS_PER_HIT;

  // possiblePulls 뽑은 뒤 남은 할인 횟수 및 남은 pity
  const alreadyUsedDiscount = Math.min(possiblePulls, EARLY_DISCOUNT_MAX_PULLS);
  const remainingPityAfterCurrent = Math.max(0, pity - possiblePulls);

  const emergencyRun = {
    conservative: buildRunEntry(
      medals,
      Math.max(0, expectedMedals - stdDevMedals),
      requiredMysticMedals,
      remainingPityAfterCurrent,
      alreadyUsedDiscount,
      useEarlyDiscount,
    ),
    average: buildRunEntry(
      medals,
      expectedMedals,
      requiredMysticMedals,
      remainingPityAfterCurrent,
      alreadyUsedDiscount,
      useEarlyDiscount,
    ),
    lucky: buildRunEntry(
      medals,
      expectedMedals + stdDevMedals,
      requiredMysticMedals,
      remainingPityAfterCurrent,
      alreadyUsedDiscount,
      useEarlyDiscount,
    ),
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
    // 할인 관련
    useEarlyDiscount,
    discountedPulls,
    regularPulls,
    discountSavedMedals,
  };
}

/**
 * 비상런 시나리오 단일 항목 계산
 * @param {number} currentMedals           - 현재 보유 신비 메달
 * @param {number} gainedFloat             - 비상런으로 획득 기대 메달 (실수)
 * @param {number} requiredMedals          - 천장에 필요한 신비 메달
 * @param {number} remainingPityAfterCurrent - 현재 possiblePulls 이후 남은 pity
 * @param {number} alreadyUsedDiscount     - 이미 소진한 할인 횟수
 * @param {boolean} useEarlyDiscount
 */
function buildRunEntry(
  currentMedals,
  gainedFloat,
  requiredMedals,
  remainingPityAfterCurrent,
  alreadyUsedDiscount,
  useEarlyDiscount,
) {
  const gainedMedals = Math.max(0, Math.round(gainedFloat));
  const totalMedals = currentMedals + gainedMedals;
  // 추가 획득 메달로 가능한 뽑기 수 (할인 잔여 구간 고려)
  const extraPulls = computePulls(
    gainedMedals,
    remainingPityAfterCurrent,
    alreadyUsedDiscount,
    useEarlyDiscount,
  );
  return {
    gainedMedals,
    extraPulls,
    totalMedals,
    canReachPityWithRun: totalMedals >= requiredMedals,
  };
}
