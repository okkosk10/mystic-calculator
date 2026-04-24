import '../MysticCalculator.css';

export default function MysticResultCard({ result }) {
  if (!result) return null;

  const {
    requiredMysticMedals, possiblePulls, shortfallMedals,
    canReachPity, pity, probBeforePity, probWithCurrentMedals,
  } = result;

  return (
    <div className="mc-card mc-result-card">
      <h2 className="mc-card-title">계산 결과</h2>
      <ul className="mc-result-list">
        <li className="mc-result-item">
          <span className="mc-result-label">천장까지 필요 신비갈피</span>
          <span className="mc-result-value">{requiredMysticMedals.toLocaleString()}개</span>
        </li>
        <li className="mc-result-item">
          <span className="mc-result-label">현재 가능 뽑기 수</span>
          <span className="mc-result-value">{possiblePulls.toLocaleString()}회</span>
        </li>
        <li className="mc-result-item">
          <span className="mc-result-label">부족 신비갈피</span>
          <span className={`mc-result-value ${shortfallMedals > 0 ? 'mc-value-danger' : 'mc-value-safe'}`}>
            {shortfallMedals.toLocaleString()}개
          </span>
        </li>
        <li className="mc-result-item">
          <span className="mc-result-label">천장 가능 여부</span>
          <span className={`mc-result-badge ${canReachPity ? 'mc-badge-ok' : 'mc-badge-fail'}`}>
            {pity === 0 ? '—' : canReachPity ? '✔ 가능' : '✘ 불가'}
          </span>
        </li>
      </ul>

      <div className="mc-prob-divider" />
      <p className="mc-prob-title">5성 등장 확률 <span className="mc-prob-hint">(0.625% / 뽑기)</span></p>
      <ul className="mc-result-list">
        <li className="mc-result-item">
          <span className="mc-result-label">천장 전 5성 확률</span>
          <span className={`mc-result-value ${probBeforePity >= 50 ? 'mc-value-safe' : probBeforePity >= 20 ? 'mc-value-warn' : 'mc-value-danger'}`}>
            {pity === 0 ? '—' : `${probBeforePity}%`}
          </span>
        </li>
        <li className="mc-result-item">
          <span className="mc-result-label">현재 갈피로 5성 확률</span>
          <span className={`mc-result-value ${probWithCurrentMedals >= 50 ? 'mc-value-safe' : probWithCurrentMedals >= 20 ? 'mc-value-warn' : 'mc-value-danger'}`}>
            {possiblePulls === 0 ? '—' : `${probWithCurrentMedals}%`}
          </span>
        </li>
      </ul>
    </div>
  );
}
