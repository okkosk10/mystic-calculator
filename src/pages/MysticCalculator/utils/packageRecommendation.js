import {
  MEDAL_APPEAR_PROB,
  MEDALS_PER_HIT,
  MEDALS_PER_PULL,
  SKYSTONES_PER_REROLL,
} from './calculateMystic.js';

const DEFAULT_MAX_RECOMMENDATIONS = 5;

function normalizeName(name) {
  return String(name ?? '').replace(/\s/g, '');
}

function isMysticMedalItem(item) {
  const name = normalizeName(item.name);
  return name.includes('신비의메달') || name.includes('신비메달') || name.includes('신비갈피');
}

function isMysticTicketItem(item) {
  const name = normalizeName(item.name);
  return name.includes('신비') && name.includes('소환권');
}

function isSkystoneItem(item) {
  return normalizeName(item.name).includes('하늘석');
}

function getRecommendedCopies(pkg) {
  if (Number.isFinite(pkg.purchaseLimit) && pkg.purchaseLimit > 0) {
    return pkg.purchaseLimit;
  }
  return 1;
}

function toExpectedMysticMedalsFromSkystones(skystones) {
  const rerolls = Math.floor(Math.max(0, skystones) / SKYSTONES_PER_REROLL);
  return rerolls * MEDAL_APPEAR_PROB * MEDALS_PER_HIT;
}

function extractPackageValue(pkg) {
  return (pkg.items ?? []).reduce(
    (acc, item) => {
      const amount = Math.max(0, Number(item.amount) || 0);
      if (isMysticMedalItem(item)) {
        acc.directMysticMedals += amount;
      } else if (isMysticTicketItem(item)) {
        acc.directMysticMedals += amount * MEDALS_PER_PULL;
      } else if (isSkystoneItem(item)) {
        acc.skystones += amount;
      }
      return acc;
    },
    { directMysticMedals: 0, skystones: 0 },
  );
}

function buildReason({ directMysticMedals, skystones, canReachPity, coverRatio }) {
  if (canReachPity) return '이 패키지 기준으로 천장권 진입 가능';
  if (directMysticMedals > 0 && skystones > 0) return '신비 메달과 비상런 재화를 같이 보충';
  if (directMysticMedals > 0) return '신비 메달 직접 보충 효율 우선';
  if (coverRatio >= 0.2) return '하늘석 비상런 기대값 기준 보충';
  return '하늘석 보충용 참고 후보';
}

function getPackageTone(canReachPity, coverRatio) {
  if (canReachPity) return 'best';
  if (coverRatio >= 0.5) return 'good';
  if (coverRatio >= 0.2) return 'mid';
  return 'low';
}

function evaluatePackage(pkg, result) {
  const copies = getRecommendedCopies(pkg);
  const baseValue = extractPackageValue(pkg);
  const directMysticMedals = baseValue.directMysticMedals * copies;
  const skystones = baseValue.skystones * copies;
  const expectedMysticMedalsFromSkystones = toExpectedMysticMedalsFromSkystones(skystones);
  const effectiveMysticMedals = directMysticMedals + expectedMysticMedalsFromSkystones;

  if (effectiveMysticMedals <= 0) return null;

  const priceValue = Math.max(0, Number(pkg.priceValue) || 0) * copies;
  const shortfall = Math.max(0, Number(result.shortfallMedals) || 0);
  const missingAfterPackage = Math.max(0, shortfall - effectiveMysticMedals);
  const coverRatio = shortfall > 0 ? Math.min(1, effectiveMysticMedals / shortfall) : 0;
  const canReachPity = shortfall > 0 && missingAfterPackage <= 0;
  const expectedPulls = effectiveMysticMedals / MEDALS_PER_PULL;
  const pricePerPull = expectedPulls > 0 && priceValue > 0 ? priceValue / expectedPulls : Infinity;
  const pricePerMedal = effectiveMysticMedals > 0 && priceValue > 0 ? priceValue / effectiveMysticMedals : Infinity;
  const directRatio = effectiveMysticMedals > 0 ? directMysticMedals / effectiveMysticMedals : 0;

  return {
    ...pkg,
    copies,
    totalPriceValue: priceValue,
    totalPriceLabel: copies > 1 ? `${pkg.priceLabel} × ${copies}` : pkg.priceLabel,
    directMysticMedals,
    skystones,
    expectedMysticMedalsFromSkystones,
    effectiveMysticMedals,
    expectedPulls,
    missingAfterPackage,
    coverRatio,
    canReachPity,
    pricePerPull,
    pricePerMedal,
    directRatio,
    tone: getPackageTone(canReachPity, coverRatio),
    reason: buildReason({ directMysticMedals, skystones, canReachPity, coverRatio }),
  };
}

function comparePackages(a, b) {
  if (a.canReachPity !== b.canReachPity) return a.canReachPity ? -1 : 1;
  if (Math.abs(b.coverRatio - a.coverRatio) > 0.001) return b.coverRatio - a.coverRatio;
  if (Math.abs(a.pricePerPull - b.pricePerPull) > 1) return a.pricePerPull - b.pricePerPull;
  if (Math.abs(b.directRatio - a.directRatio) > 0.001) return b.directRatio - a.directRatio;
  return (a.priority ?? 999) - (b.priority ?? 999);
}

export function getPackageRecommendations(packages, result, options = {}) {
  if (!result || result.canReachPity || result.shortfallMedals <= 0) return [];

  const limit = options.limit ?? DEFAULT_MAX_RECOMMENDATIONS;
  return (packages ?? [])
    .map((pkg) => evaluatePackage(pkg, result))
    .filter(Boolean)
    .sort(comparePackages)
    .slice(0, limit);
}

export function formatExpectedMedals(value) {
  if (value >= 100) return Math.round(value).toLocaleString();
  if (value >= 10) return value.toFixed(1);
  return value.toFixed(2);
}
