import '../MysticCalculator.css';

const RUN_LABELS = {
  conservative: { label: '비운', desc: '기댓값 −1σ' },
  average:      { label: '평균', desc: '기댓값 (E)' },
  lucky:        { label: '행운', desc: '기댓값 +1σ' },
};

export default function MysticRunEstimate({ result }) {
  if (!result) return null;

  const { emergencyRun, skystones, rerolls, expectedHits } = result;

  return (
    <div className="mc-card mc-run-card">
      <h2 className="mc-card-title">
        비상런 예상
        <span className="mc-card-subtitle">(보유 하늘석 {skystones.toLocaleString()}개 기준)</span>
      </h2>
      <p className="mc-run-meta">
        리롤 {rerolls.toLocaleString()}회 가능 &middot; 등장 기댓값 {expectedHits}회
        <br />
        <span className="mc-run-prob-hint">확률 0.1700646% / 리롤 (비밀상점 Lv.13)</span>
      </p>
      <div className="mc-run-grid">
        {Object.entries(emergencyRun).map(([key, val]) => {
          const meta = RUN_LABELS[key];
          return (
            <div key={key} className={`mc-run-item ${val.canReachPityWithRun ? 'mc-run-ok' : 'mc-run-fail'}`}>
              <div className="mc-run-label">{meta.label}</div>
              <div className="mc-run-desc">{meta.desc}</div>
              <div className="mc-run-gained">+{val.gainedMedals.toLocaleString()} 갈피</div>
              <div className="mc-run-pulls">+{val.extraPulls.toLocaleString()} 회</div>
              <div className={`mc-run-badge ${val.canReachPityWithRun ? 'mc-badge-ok' : 'mc-badge-fail'}`}>
                {val.canReachPityWithRun ? '천장 가능' : '천장 불가'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
