import MascotComment from './MascotComment';
import PackageRecommendation from './PackageRecommendation';
import '../MysticCalculator.css';

const RUN_LABELS = {
  conservative: { label: '비운', desc: '기댓값 −1σ' },
  average:      { label: '평균', desc: '기댓값 (E)' },
  lucky:        { label: '행운', desc: '기댓값 +1σ' },
};

function handleCaptureResult() {
  alert('결과 캡쳐 기능은 추후 추가 예정입니다.');
}

export default function ResultStep({ result, comment, onReset, showPackage }) {
  if (!result) return null;

  const {
    requiredMysticMedals, possiblePulls, shortfallMedals,
    canReachPity, pity, probBeforePity, probWithCurrentMedals,
    emergencyRun, skystones, rerolls, expectedHits,
  } = result;

  return (
    <div className="mc-step-result">
      {/* 마스코트 코멘트 */}
      <MascotComment comment={comment} />

      {/* 계산 결과 카드 */}
      <div className="mc-card">
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
        <p className="mc-prob-title">
          5성 등장 확률 <span className="mc-prob-hint">(0.625% / 뽑기)</span>
        </p>
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

      {/* 비상런 예상 카드 */}
      <div className="mc-card">
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

      {/* 패키지 추천 (조건부) */}
      {showPackage && <PackageRecommendation />}

      {/* 액션 버튼 */}
      <div className="mc-result-actions">
        <button type="button" className="mc-btn-secondary" onClick={handleCaptureResult}>
          결과 캡쳐
        </button>
        <button type="button" className="mc-btn-calc" onClick={onReset}>
          다시 계산하기
        </button>
      </div>
    </div>
  );
}
