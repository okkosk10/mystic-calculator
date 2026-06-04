import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import packageRecommendations, { DATA_UPDATED_AT } from '../data/packageRecommendations';
import { formatExpectedMedals, getPackageRecommendations } from '../utils/packageRecommendation';
import { buildShareUrl } from '../utils/shareUrl';
import '../MysticCalculator.css';

/* ── 상수 ── */
const RUN_LABELS = {
  conservative: {
    label: '폭사 루트',
    desc: '기댓값 −1σ',
    image: '/image/route_disaster.webp',
    tone: 'disaster',
  },
  average: {
    label: '평타 루트',
    desc: '기댓값 (E)',
    image: '/image/route_normal.webp',
    tone: 'normal',
  },
  lucky: {
    label: '대박 루트',
    desc: '기댓값 +1σ',
    image: '/image/route_jackpot.webp',
    tone: 'jackpot',
  },
};

/* ── 헬퍼 함수 ── */
function getVerdict(canReachPity, shortfallMedals, requiredMysticMedals, emergencyRun) {
  if (canReachPity) {
    return { label: '존버 추천', status: 'success', desc: '현재 신비갈피로 천장 도달이 가능합니다.' };
  }
  const anyRunCanReach = emergencyRun && Object.values(emergencyRun).some(v => v.canReachPityWithRun);
  if (anyRunCanReach) {
    return { label: '비상런 시 천장 가능', status: 'warning', desc: '비상런을 진행하면 천장 도달 가능성이 있습니다.' };
  }
  const ratio = requiredMysticMedals > 0 ? shortfallMedals / requiredMysticMedals : 1;
  if (ratio < 0.3) {
    return { label: '갈피 소폭 부족', status: 'warning', desc: '조금만 더 모으면 천장 도달이 가능합니다.' };
  }
  return { label: '천장 도달 불가', status: 'danger', desc: '현재 재화로는 천장 도달이 어렵습니다.' };
}

function getProbClass(prob) {
  if (prob >= 50) return 'mc-value-safe';
  if (prob >= 20) return 'mc-value-warn';
  return 'mc-value-danger';
}

function getProbBarColor(prob) {
  if (prob >= 50) return 'var(--mc-safe)';
  if (prob >= 20) return '#fbbf24';
  return 'var(--mc-danger)';
}


function getMascotImage(canReachPity, pity, emergencyRun) {
  if (pity === 0) return '/image/ezang_normal.webp';
  if (canReachPity) return '/image/ezang_happy.webp';
  if (emergencyRun?.average?.canReachPityWithRun) return '/image/ezang_normal.webp';
  if (emergencyRun?.lucky?.canReachPityWithRun) return '/image/ezang_sad.webp';
  return '/image/ezang_sad.webp';
}

function getEmergencySummary(emergencyRun) {
  if (!emergencyRun) return null;
  const entries = Object.entries(emergencyRun);
  const allCanReach = entries.every(([, v]) => v.canReachPityWithRun);
  const avgCanReach = emergencyRun.average?.canReachPityWithRun;
  const luckyCanReach = emergencyRun.lucky?.canReachPityWithRun;
  if (allCanReach) return { text: '비상런 시 천장 도달 가능성이 충분합니다', status: 'success' };
  if (avgCanReach) return { text: '평균 비상런 기준 천장권입니다', status: 'success' };
  if (luckyCanReach) return { text: '운이 좋으면 비상런으로 커버 가능합니다', status: 'warning' };
  return { text: '평균 기준으로는 비상런으로도 천장 도달이 어렵습니다', status: 'danger' };
}

/* ── ResultHeroCard: 마스코트 + 판정 + 부족갈피 + 준비도 ── */
function ResultHeroCard({ comment, canReachPity, shortfallMedals, requiredMysticMedals, emergencyRun, pity, medals }) {
  const verdict = getVerdict(canReachPity, shortfallMedals, requiredMysticMedals, emergencyRun);
  const current = Math.max(0, medals ?? 0);
  const required = Math.max(1, requiredMysticMedals ?? 1);
  const progressPct = Math.min(100, Math.round((current / required) * 100));
  const barColor = progressPct >= 80 ? 'var(--mc-safe)' : progressPct >= 40 ? '#fbbf24' : 'var(--mc-danger)';
  const mascotImg = getMascotImage(canReachPity, pity, emergencyRun);

  return (
    <div className={`mc-hero-card mc-hero-card--${verdict.status}`}>
      {/* 마스코트 + 말풍선 가로 배치 */}
      {comment && (
        <div className="mc-hero-mascot-row">
          <img src={mascotImg} alt="에장연" className="mc-hero-mascot-img" />
          <div className="mc-hero-speech-bubble">
            <p className="mc-hero-speech-text">{comment}</p>
          </div>
        </div>
      )}

      {/* 판정 뱃지 */}
      <div className={`mc-hero-verdict mc-hero-verdict--${verdict.status}`}>{verdict.label}</div>
      <p className="mc-hero-verdict-desc">{verdict.desc}</p>

      {/* 부족 갈피 강조 */}
      <div className="mc-hero-shortfall">
        <span className="mc-hero-shortfall-label">부족 신비갈피</span>
        <span className={`mc-hero-shortfall-value ${shortfallMedals > 0 ? 'mc-value-danger' : 'mc-value-safe'}`}>
          {shortfallMedals > 0 ? `${shortfallMedals.toLocaleString()}개` : '충족 ✓'}
        </span>
      </div>

      {/* 천장 준비도 */}
      <div className="mc-hero-progress">
        <div className="mc-hero-progress-header">
          <span className="mc-hero-progress-label">천장 준비도</span>
          <span className="mc-hero-progress-pct" style={{ color: barColor }}>{progressPct}%</span>
        </div>
        <div className="mc-hero-progress-sub">{current.toLocaleString()} / {required.toLocaleString()} 갈피</div>
        <div className="mc-hero-progress-track">
          <div
            className="mc-hero-progress-fill"
            style={{ '--target-width': `${progressPct}%`, background: barColor }}
          />
        </div>
      </div>
    </div>
  );
}

/* ── QuickStatsRow: 가능 뽑기 / 5성 확률 / 필요 갈피 ── */
function QuickStatsRow({ requiredMysticMedals, possiblePulls, probWithCurrentMedals }) {
  const stats = [
    { label: '가능 뽑기', value: `${(possiblePulls ?? 0).toLocaleString()}회`, cls: '' },
    {
      label: '5성 확률',
      value: possiblePulls === 0 ? '—' : `${probWithCurrentMedals ?? 0}%`,
      cls: getProbClass(probWithCurrentMedals ?? 0),
    },
    { label: '필요 갈피', value: `${(requiredMysticMedals ?? 0).toLocaleString()}개`, cls: '' },
  ];

  return (
    <div className="mc-quick-stats">
      {stats.map((s) => (
        <div key={s.label} className="mc-quick-stat">
          <span className={`mc-quick-stat-value ${s.cls}`}>{s.value}</span>
          <span className="mc-quick-stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── DiscountBadge: 할인 적용 시 절약 정보 ── */
function DiscountBadge({ useEarlyDiscount, discountedPulls, discountSavedMedals }) {
  if (!useEarlyDiscount || discountedPulls === 0) return null;
  return (
    <div className="mc-discount-badge">
      <span className="mc-discount-badge-icon">✦</span>
      <span className="mc-discount-badge-text">
        초반 {discountedPulls}회 할인 적용
        <span className="mc-discount-badge-save"> · {discountSavedMedals.toLocaleString()}개 절약</span>
      </span>
    </div>
  );
}

/* ── 확률 상세 (보조 영역) ── */
function ProbabilityDetail({ probBeforePity, probWithCurrentMedals, pity, possiblePulls }) {
  const rows = [
    {
      label: '천장 전 5성 확률',
      value: pity === 0 ? null : (probBeforePity ?? 0),
      hint: `천장(${(pity ?? 0)}회) 이내 5성 등장 확률`,
    },
    {
      label: '현재 갈피로 5성 확률',
      value: possiblePulls === 0 ? null : (probWithCurrentMedals ?? 0),
      hint: '보유 갈피로 5성 등장 확률',
    },
  ];
  return (
    <div className="mc-card mc-result-dashboard__prob-card">
      <h2 className="mc-card-title">
        확률 상세
        <span className="mc-card-subtitle">(0.625% / 뽑기)</span>
      </h2>
      <div className="mc-result-dashboard__prob-rows">
        {rows.map((row) => {
          const pct = row.value ?? 0;
          const color = getProbBarColor(pct);
          return (
            <div key={row.label} className="mc-result-dashboard__prob-row">
              <div className="mc-result-dashboard__prob-row-top">
                <span className="mc-result-dashboard__prob-row-label">{row.label}</span>
                <span className="mc-result-dashboard__prob-row-value" style={{ color }}>
                  {row.value === null ? '—' : `${pct}%`}
                </span>
              </div>
              <div className="mc-result-dashboard__prob-track">
                <div
                  className="mc-result-dashboard__prob-fill"
                  style={{ '--target-width': `${Math.min(100, pct)}%`, background: color }}
                />
              </div>
              <p className="mc-result-dashboard__prob-hint">{row.hint}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── EmergencySummary: 한 줄 결론 + 접기/펼치기 ── */
function EmergencySummary({ emergencyRun, skystones, rerolls, expectedHits, requiredMysticMedals }) {
  const [open, setOpen] = useState(false);
  if (!emergencyRun) return null;

  const summary = getEmergencySummary(emergencyRun);
  const entries = Object.entries(emergencyRun);

  return (
    <div className="mc-card mc-emergency-card">
      <div className="mc-emergency-summary-row">
        <div>
          <p className="mc-emergency-title">비상런 분석</p>
          <p className={`mc-emergency-conclusion mc-emergency-conclusion--${summary.status}`}>
            {summary.text}
          </p>
        </div>
        <button
          type="button"
          className="mc-emergency-toggle"
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
          data-capture-exclude="true"
        >
          {open ? '접기' : '자세히'}
        </button>
      </div>

      {open && (
        <div className="mc-emergency-detail" data-capture-exclude="true">
          <p className="mc-run-meta">
            하늘석 {(skystones ?? 0).toLocaleString()}개 &middot; 리롤 {(rerolls ?? 0).toLocaleString()}회 &middot; 기댓값 {expectedHits ?? 0}회
            <br />
            <span className="mc-run-prob-hint">확률 약 1.016% / 리롤 (0.1700646% × 6슬롯, 비밀상점 Lv.13)</span>
          </p>
          <div className="mc-result-dashboard__scenario-grid">
            {entries.map(([key, val], i) => {
              const meta = RUN_LABELS[key] ?? { label: key, desc: '', image: null, tone: 'normal' };
              const summaryText = val.canReachPityWithRun
                ? '천장 도달 가능해요!'
                : val.gainedMedals > 0
                ? `천장까지 ${Math.max(0, (requiredMysticMedals ?? 0) - (val.totalMedals ?? 0)).toLocaleString()}개 부족해요…`
                : '추가 공력이 거의 없어요…';
              return (
                <div
                  key={key}
                  className={`mc-result-dashboard__scenario-card mc-scenario--${meta.tone}`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="mc-scenario__img-wrap">
                    {meta.image && (
                      <img
                        src={meta.image}
                        alt={`${meta.label} 캐릭터`}
                        className="mc-scenario__img"
                      />
                    )}
                  </div>
                  <div className="mc-result-dashboard__scenario-header">
                    <span className="mc-run-label">{meta.label}</span>
                    <span className={`mc-run-badge ${val.canReachPityWithRun ? 'mc-badge-ok' : 'mc-badge-fail'}`}>
                      {val.canReachPityWithRun ? '천장 가능' : '천장 불가'}
                    </span>
                  </div>
                  <p className="mc-run-desc" style={{ margin: '2px 0 8px' }}>{meta.desc}</p>
                  <div className="mc-result-dashboard__scenario-stats">
                    <div className="mc-result-dashboard__scenario-stat">
                      <span className="mc-result-dashboard__scenario-stat-label">추가 갈피</span>
                      <span className="mc-run-gained">+{(val.gainedMedals ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="mc-result-dashboard__scenario-stat">
                      <span className="mc-result-dashboard__scenario-stat-label">추가 뽑기</span>
                      <span className="mc-run-pulls">+{(val.extraPulls ?? 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="mc-scenario__summary">{summaryText}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PackageRecommendationList({ pkgs, result }) {
  const recommendations = getPackageRecommendations(pkgs, result);

  if (recommendations.length === 0) return null;

  const knownTotalPrice = recommendations.reduce((sum, pkg) => (
    Number.isFinite(pkg.totalPriceValue) ? sum + pkg.totalPriceValue : sum
  ), 0);
  const hasUnknownPrice = recommendations.some((pkg) => !Number.isFinite(pkg.totalPriceValue));
  const totalPriceText = knownTotalPrice > 0
    ? `${knownTotalPrice.toLocaleString()}원${hasUnknownPrice ? ' + 가격 확인 필요' : ''}`
    : '가격 확인 필요';

  return (
    <div className="mc-card mc-package-card">
      <h2 className="mc-card-title">패키지 추천</h2>
      <p className="mc-package-notice">
        신비 메달 직접 지급량과 하늘석 비상런 기대값만 반영한 참고 추천입니다. 실제 구매 전 게임 내 상점을 확인하세요.
      </p>
      <ul className="mc-result-dashboard__pkg-list">
        {recommendations.map((pkg, i) => {
          const meta = [
            pkg.availabilityLabel ?? (pkg.purchaseLimit ? `구매 가능 ${pkg.purchaseLimit}회` : null),
            pkg.salePeriod,
          ].filter(Boolean).join(' · ');
          const expectedMysticText = formatExpectedMedals(pkg.effectiveMysticMedals);
          const skyText = pkg.skystones > 0
            ? `하늘석 ${pkg.skystones.toLocaleString()}개 → 기대 신비 ${formatExpectedMedals(pkg.expectedMysticMedalsFromSkystones)}개`
            : null;

          return (
            <li
              key={pkg.id}
              className={`mc-result-dashboard__pkg-item mc-result-dashboard__pkg-item--${pkg.tone}`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="mc-result-dashboard__pkg-rank">#{i + 1}</div>
              <div className="mc-package-info">
                <div className="mc-package-title-row">
                  <span className="mc-package-name">{pkg.name}</span>
                  <span className={`mc-package-fit mc-package-fit--${pkg.tone}`}>
                    {pkg.canReachPity ? '천장 가능' : `${Math.round(pkg.coverRatio * 100)}% 보충`}
                  </span>
                </div>
                <span className="mc-package-desc">{pkg.reason}</span>
                {pkg.description && <span className="mc-package-desc">{pkg.description}</span>}
                <div className="mc-package-value-grid">
                  <span>기대 신비 {expectedMysticText}개</span>
                  <span>예상 뽑기 {pkg.expectedPulls.toFixed(1)}회</span>
                  <span>남은 부족분 {Math.ceil(pkg.missingAfterPackage).toLocaleString()}개</span>
                </div>
                <span className="mc-package-desc">
                  직접 신비 {pkg.directMysticMedals.toLocaleString()}개
                  {skyText ? ` · ${skyText}` : ''}
                </span>
                {meta && <span className="mc-package-desc">{meta}</span>}
              </div>
              <div className="mc-package-price-col">
                <span className="mc-result-dashboard__price-badge">{pkg.totalPriceLabel}</span>
                {Number.isFinite(pkg.pricePerPull) && (
                  <span className="mc-package-efficiency">
                    1뽑 약 {Math.round(pkg.pricePerPull).toLocaleString()}원
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mc-package-total">
        표시된 추천 후보 합산&nbsp;
        <strong>{totalPriceText}</strong>
      </div>
      <p className="mc-package-data-date">데이터 기준: {DATA_UPDATED_AT.replace(/-/g, '.')}</p>
    </div>
  );
}

/* ── 계산 기준 카드 ── */
const CALC_BASIS_ROWS = [
  { label: '신비 1뽑 비용', value: '신비 메달 50개' },
  { label: '신비 5성 확률', value: '0.625% / 뽑기' },
  { label: '리롤 비용', value: '하늘석 3개 / 1회' },
  { label: '신비 확률 (슬롯)', value: '0.1700646% / 슬롯' },
  { label: '신비 확률 (리롤)', value: '약 1.016% / 리롤 (6슬롯)' },
  { label: '초반 30뽑 할인', value: '35개 / 회 · 최대 30회' },
];

function CalcBasisCard() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mc-card mc-calc-basis-card">
      <div className="mc-calc-basis-header">
        <h2 className="mc-card-title mc-calc-basis-title">계산 기준</h2>
        <button
          type="button"
          className="mc-calc-basis-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          data-capture-exclude="true"
        >
          {open ? '접기' : '펼치기'}
        </button>
      </div>
      {open && (
        <div className="mc-calc-basis-content" data-capture-exclude="true">
          {CALC_BASIS_ROWS.map((row) => (
            <div key={row.label} className="mc-calc-basis-row">
              <span className="mc-calc-basis-label">{row.label}</span>
              <span className="mc-calc-basis-value">{row.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── 7. 액션 버튼 ── */
function ResultActions({ onReset, onCapture, isCapturing, inputValues }) {
  const [copyState, setCopyState] = useState('idle'); // 'idle' | 'copied'

  async function handleCopyLink() {
    const url = buildShareUrl(inputValues);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // clipboard API 미지원 환경 fallback
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopyState('copied');
    setTimeout(() => setCopyState('idle'), 2000);
  }

  return (
    <div className="mc-result-dashboard__actions" data-capture-exclude="true">
      <button
        type="button"
        className="mc-result-dashboard__btn-capture"
        onClick={onCapture}
        disabled={isCapturing}
      >
        {isCapturing ? '캡쳐 중...' : '결과 캡쳐'}
      </button>
      <button
        type="button"
        className="mc-result-dashboard__btn-share"
        onClick={handleCopyLink}
      >
        {copyState === 'copied' ? '복사 완료 ✓' : '공유 링크 복사'}
      </button>
      <button type="button" className="mc-btn-calc mc-result-dashboard__btn-reset" onClick={onReset}>
        다시 계산하기
      </button>
    </div>
  );
}

/* ── 메인 컴포넌트 ── */
export default function ResultStep({ result, comment, onReset, showPackage, inputValues }) {
  const [isCapturing, setIsCapturing] = useState(false);
  const captureRef = useRef(null);

  if (!result) return null;

  const {
    requiredMysticMedals = 0,
    possiblePulls = 0,
    shortfallMedals = 0,
    canReachPity = false,
    pity = 0,
    probBeforePity = 0,
    probWithCurrentMedals = 0,
    emergencyRun = {},
    medals = 0,
    skystones = 0,
    rerolls = 0,
    expectedHits = 0,
    useEarlyDiscount = false,
    discountedPulls = 0,
    discountSavedMedals = 0,
  } = result;

  async function handleCapture() {
    if (isCapturing || !captureRef.current) return;
    setIsCapturing(true);
    try {
      await document.fonts.ready;
      const dataUrl = await toPng(captureRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#0f0c1a',
        filter: (node) => node.getAttribute?.('data-capture-exclude') !== 'true',
      });

      const isMobile = navigator.maxTouchPoints > 0;
      if (isMobile && navigator.canShare) {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], 'mystic-result.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: '신비뽑기 계산 결과' });
          setIsCapturing(false);
          return;
        }
      }

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'mystic-result.png';
      a.click();
    } catch (err) {
      console.error('캡쳐 실패:', err);
      alert('캡쳐에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsCapturing(false);
    }
  }

  return (
    <div ref={captureRef} className="mc-result-dashboard">
      <ResultHeroCard
        comment={comment}
        canReachPity={canReachPity}
        shortfallMedals={shortfallMedals}
        requiredMysticMedals={requiredMysticMedals}
        emergencyRun={emergencyRun}
        pity={pity}
        medals={medals}
      />

      <QuickStatsRow
        requiredMysticMedals={requiredMysticMedals}
        possiblePulls={possiblePulls}
        probWithCurrentMedals={probWithCurrentMedals}
      />

      <DiscountBadge
        useEarlyDiscount={useEarlyDiscount}
        discountedPulls={discountedPulls}
        discountSavedMedals={discountSavedMedals}
      />

      <EmergencySummary
        emergencyRun={emergencyRun}
        skystones={skystones}
        rerolls={rerolls}
        expectedHits={expectedHits}
        requiredMysticMedals={requiredMysticMedals}
      />

      {/* 확률 상세 (보조) */}
      <ProbabilityDetail
        probBeforePity={probBeforePity}
        probWithCurrentMedals={probWithCurrentMedals}
        pity={pity}
        possiblePulls={possiblePulls}
      />

      {/* 패키지 추천 */}
      {showPackage && <PackageRecommendationList pkgs={packageRecommendations} result={result} />}

      {/* 계산 기준 */}
      <CalcBasisCard />

      {/* 액션 버튼 */}
      <ResultActions onReset={onReset} onCapture={handleCapture} isCapturing={isCapturing} inputValues={inputValues} />
    </div>
  );
}


