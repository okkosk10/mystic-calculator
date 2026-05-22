/**
 * URL 쿼리 파라미터로 입력값 공유
 *
 * 파라미터 형태: ?pity=120&medals=3000&skystones=9000&discount=1
 */

/**
 * URLSearchParams 문자열에서 inputValues를 파싱한다.
 * 관련 파라미터가 하나도 없으면 null을 반환한다.
 * 잘못된 값은 0 또는 범위 내 값으로 보정한다.
 *
 * @param {string} search - window.location.search
 * @returns {{ currentMysticMedals: string, currentSkystones: string, remainingPityCount: string, useEarlyDiscount: boolean } | null}
 */
export function parseShareParams(search) {
  const params = new URLSearchParams(search);

  const rawPity = params.get('pity');
  const rawMedals = params.get('medals');
  const rawSkystones = params.get('skystones');
  const rawDiscount = params.get('discount');

  // 관련 파라미터가 하나도 없으면 null
  if (rawPity === null && rawMedals === null && rawSkystones === null && rawDiscount === null) {
    return null;
  }

  return {
    remainingPityCount:   String(Math.min(200, Math.max(0, Math.floor(Number(rawPity)      || 0)))),
    currentMysticMedals:  String(Math.max(0,               Math.floor(Number(rawMedals)    || 0))),
    currentSkystones:     String(Math.max(0,               Math.floor(Number(rawSkystones) || 0))),
    useEarlyDiscount:     rawDiscount === '1' || rawDiscount === 'true',
  };
}

/**
 * inputValues를 공유 URL 문자열로 직렬화한다.
 *
 * @param {{ currentMysticMedals: string, currentSkystones: string, remainingPityCount: string, useEarlyDiscount: boolean }} inputValues
 * @returns {string} 공유 URL
 */
export function buildShareUrl(inputValues) {
  const params = new URLSearchParams({
    pity:     inputValues.remainingPityCount  || '0',
    medals:   inputValues.currentMysticMedals || '0',
    skystones: inputValues.currentSkystones   || '0',
    discount: inputValues.useEarlyDiscount ? '1' : '0',
  });
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}
