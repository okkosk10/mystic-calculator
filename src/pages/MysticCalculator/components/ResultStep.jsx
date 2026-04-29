import packageRecommendations from '../data/packageRecommendations';
import '../MysticCalculator.css';

/* ── 상수 ── */
const RUN_LABELS = {
  conservative: { label: '비운', desc: '기댓값 −1σ' },
  average:      { label: '평균', desc: '기댓값 (E)' },
  lucky:        { label: '행운', desc: '기댓값 +1σ' },
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

function handleCaptureResult() {
  alert('결과 캡쳐 기능은 추후 추가 예정입니다.');
}

/* ── 1+2. 마스코트 + 판정 + 천장 준비도 통합 카드 ── */
function TopSummaryCard({ comment, canReachPity, shortfallMedals, requiredMysticMedals, possiblePulls, probWithCurrentMedals, emergencyRun, pity, medals }) {
  const verdict = getVerdict(canReachPity, shortfallMedals, requiredMysticMedals, emergencyRun);
  const current = Math.max(0, medals ?? 0);
  const required = Math.max(1, requiredMysticMedals ?? 1);
  const progressPct = Math.min(100, Math.round((current / required) * 100));
  const barColor = progressPct >= 80 ? 'var(--mc-safe)' : progressPct >= 40 ? '#fbbf24' : 'var(--mc-danger)';
  return (
    <div className={`mc-result-dashboard__top-card mc-result-dashboard__decision--${verdict.status}`}>
      {/* 마스코트 멘트 */}
      {comment && (
        <div className="mc-result-dashboard__top-mascot">
          <span className="mc-mascot-avatar" aria-hidden="true">🐭</span>
          <div className="mc-mascot-bubble">
            <span className="mc-mascot-name">에장연</span>
            <p className="mc-mascot-text">{comment}</p>
          </div>
        </div>
      )}

      {/* 구분선 */}
      {comment && <div className="mc-result-dashboard__top-divider" />}

      {/* 판정 */}
      <div className="mc-result-dashboard__decision-badge">{verdict.label}</div>
      <p className="mc-result-dashboard__decision-desc">{verdict.desc}</p>

      {/* 요약 수치 */}
      <div className="mc-result-dashboard__decision-meta">
        <div className="mc-result-dashboard__decision-meta-item">
          <span className="mc-result-dashboard__decision-meta-label">부족 신비갈피</span>
          <span className={`mc-result-dashboard__decision-meta-value ${shortfallMedals > 0 ? 'mc-value-danger' : 'mc-value-safe'}`}>
            {shortfallMedals > 0 ? `${shortfallMedals.toLocaleString()}개` : '충족'}
          </span>
        </div>
        <div className="mc-result-dashboard__decision-meta-divider" />
        <div className="mc-result-dashboard__decision-meta-item">
          <span className="mc-result-dashboard__decision-meta-label">현재 가능 뽑기</span>
          <span className="mc-result-dashboard__decision-meta-value">{possiblePulls.toLocaleString()}회</span>
        </div>
        <div className="mc-result-dashboard__decision-meta-divider" />
        <div className="mc-result-dashboard__decision-meta-item">
          <span className="mc-result-dashboard__decision-meta-label">5성 확률</span>
          <span className={`mc-result-dashboard__decision-meta-value ${getProbClass(probWithCurrentMedals)}`}>
            {possiblePulls === 0 ? '—' : `${probWithCurrentMedals}%`}
          </span>
        </div>
      </div>

      {/* 천장 준비도 Progress Bar */}
      <div className="mc-result-dashboard__top-progress">
        <div className="mc-result-dashboard__progress-header">
          <span className="mc-result-dashboard__progress-title">천장 준비도</span>
          <span className="mc-result-dashboard__progress-pct">{progressPct}% 달성</span>
        </div>
        <div className="mc-result-dashboard__progress-sub">
          {current.toLocaleString()} / {required.toLocaleString()} 갈피
        </div>
        <div className="mc-result-dashboard__progress-track">
          <div
            className="mc-result-dashboard__progress-fill"
            style={{ '--target-width': `${progressPct}%`, background: barColor }}
          />
        </div>
      </div>
    </div>
  );
}

/* ── 3. 핵심 지표 카드 Grid ── */
function StatCardGrid({ requiredMysticMedals, possiblePulls, shortfallMedals, probWithCurrentMedals, pity }) {
  const cards = [
    {
      label: '천장까지 필요 갈피',
      value: `${(requiredMysticMedals ?? 0).toLocaleString()}개`,
      colorClass: '',
    },
    {
      label: '현재 가능 뽑기',
      value: `${(possiblePulls ?? 0).toLocaleString()}회`,
      colorClass: '',
    },
    {
      label: '부족 신비갈피',
      value: `${(shortfallMedals ?? 0).toLocaleString()}개`,
      colorClass: (shortfallMedals ?? 0) > 0 ? 'mc-value-danger' : 'mc-value-safe',
    },
    {
      label: '현재 갈피 5성 확률',
      value: possiblePulls === 0 ? '—' : `${probWithCurrentMedals ?? 0}%`,
      colorClass: getProbClass(probWithCurrentMedals ?? 0),
    },
  ];
  return (
    <div className="mc-result-dashboard__stat-grid">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className="mc-result-dashboard__stat-card"
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          <span className="mc-result-dashboard__stat-label">{card.label}</span>
          <span className={`mc-result-dashboard__stat-value ${card.colorClass}`}>{card.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── 4. 확률 비교 카드 ── */
function ProbabilityCompare({ probBeforePity, probWithCurrentMedals, pity, possiblePulls }) {
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
        5성 등장 확률
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

/* ── 5. 비상런 시나리오 ── */
function EmergencyScenarioList({ emergencyRun, skystones, rerolls, expectedHits }) {
  if (!emergencyRun) return null;
  const entries = Object.entries(emergencyRun);
  const allCanReach = entries.every(([, v]) => v.canReachPityWithRun);
  const anyCanReach = entries.some(([, v]) => v.canReachPityWithRun);
  const conclusion = allCanReach
    ? '비상런 시 천장 도달 가능성이 충분합니다.'
    : anyCanReach
    ? '비상런 시 운에 따라 천장 도달이 가능할 수 있습니다.'
    : '현재 하늘석으로는 비상런을 해도 천장 도달 가능성이 낮습니다.';

  return (
    <div className="mc-card">
      <h2 className="mc-card-title">
        비상런 시나리오
        <span className="mc-card-subtitle">(하늘석 {(skystones ?? 0).toLocaleString()}개 기준)</span>
      </h2>
      <p className="mc-run-meta">
        리롤 {(rerolls ?? 0).toLocaleString()}회 가능 &middot; 등장 기댓값 {expectedHits ?? 0}회
        <br />
        <span className="mc-run-prob-hint">확률 0.1700646% / 리롤 (비밀상점 Lv.13)</span>
      </p>
      <div className="mc-result-dashboard__scenario-grid">
        {entries.map(([key, val], i) => {
          const meta = RUN_LABELS[key] ?? { label: key, desc: '' };
          return (
            <div
              key={key}
              className={`mc-result-dashboard__scenario-card ${val.canReachPityWithRun ? 'mc-run-ok' : 'mc-run-fail'}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="mc-result-dashboard__scenario-header">
                <span className="mc-run-label">{meta.label}</span>
                <span className={`mc-run-badge ${val.canReachPityWithRun ? 'mc-badge-ok' : 'mc-badge-fail'}`}>
                  {val.canReachPityWithRun ? '천장 가능' : '천장 불가'}
                </span>
              </div>
              <p className="mc-run-desc" style={{ margin: 0 }}>{meta.desc}</p>
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
            </div>
          );
        })}
      </div>
      <p className="mc-result-dashboard__scenario-conclusion">
        {anyCanReach ? '✔' : '✘'} {conclusion}
      </p>
    </div>
  );
}

/* ── 6. 패키지 추천 리스트 ── */
const FITNESS_MAP = {
  1: { label: '높음', cls: 'mc-result-dashboard__fitness--high' },
  2: { label: '중간', cls: 'mc-result-dashboard__fitness--mid' },
  3: { label: '낮음',  cls: 'mc-result-dashboard__fitness--low' },
};

function PackageRecommendationList({ pkgs }) {
  return (
    <div className="mc-card mc-package-card">
      <h2 className="mc-card-title">패키지 참고 안내</h2>
      <p className="mc-package-notice">
        ⚠ 아래는 <strong>예시(Mock) 데이터</strong>입니다. 실제 구매는 게임 내 상점을 확인하세요.
      </p>
      <ul className="mc-result-dashboard__pkg-list">
        {(pkgs ?? []).map((pkg, i) => {
          const fitness = FITNESS_MAP[pkg.priority ?? 3] ?? FITNESS_MAP[3];
          return (
            <li
              key={pkg.id}
              className="mc-result-dashboard__pkg-item"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="mc-result-dashboard__pkg-rank">#{i + 1}</div>
              <div className="mc-package-info">
                <span className="mc-package-name">{pkg.name}</span>
                <span className="mc-package-desc">{pkg.description}</span>
              </div>
              <span className={`mc-result-dashboard__fitness-badge ${fitness.cls}`}>{fitness.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ── 7. 액션 버튼 ── */
function ResultActions({ onReset }) {
  return (
    <div className="mc-result-dashboard__actions">
      <button type="button" className="mc-result-dashboard__btn-capture" onClick={handleCaptureResult}>
        결과 캡쳐
      </button>
      <button type="button" className="mc-btn-calc mc-result-dashboard__btn-reset" onClick={onReset}>
        다시 계산하기
      </button>
    </div>
  );
}

/* ── 메인 컴포넌트 ── */
export default function ResultStep({ result, comment, onReset, showPackage }) {
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
  } = result;

  return (
    <div className="mc-result-dashboard">
      {/* 1+2. 마스코트 + 판정 + 천장 준비도 통합 카드 */}
      <TopSummaryCard
        comment={comment}
        canReachPity={canReachPity}
        shortfallMedals={shortfallMedals}
        requiredMysticMedals={requiredMysticMedals}
        possiblePulls={possiblePulls}
        probWithCurrentMedals={probWithCurrentMedals}
        emergencyRun={emergencyRun}
        pity={pity}
        medals={medals}
      />

      {/* 3. 핵심 지표 카드 Grid */}
      <StatCardGrid
        requiredMysticMedals={requiredMysticMedals}
        possiblePulls={possiblePulls}
        shortfallMedals={shortfallMedals}
        probWithCurrentMedals={probWithCurrentMedals}
        pity={pity}
      />

      {/* 4. 확률 비교 */}
      <ProbabilityCompare
        probBeforePity={probBeforePity}
        probWithCurrentMedals={probWithCurrentMedals}
        pity={pity}
        possiblePulls={possiblePulls}
      />

      {/* 5. 비상런 시나리오 */}
      <EmergencyScenarioList
        emergencyRun={emergencyRun}
        skystones={skystones}
        rerolls={rerolls}
        expectedHits={expectedHits}
      />

      {/* 6. 패키지 추천 */}
      {showPackage && <PackageRecommendationList pkgs={packageRecommendations} />}

      {/* 7. 액션 버튼 */}
      <ResultActions onReset={onReset} />
    </div>
  );
}


