import '../MysticCalculator.css';

export default function MysticInputForm({ values, onChange, onCalculate }) {
  function handleChange(e) {
    const { name, value } = e.target;
    if (value === '') {
      onChange({ ...values, [name]: '' });
      return;
    }
    let num = Math.max(0, Number(value));
    if (name === 'remainingPityCount') num = Math.min(200, num);
    onChange({ ...values, [name]: String(Math.floor(num)) });
  }

  return (
    <div className="mc-card mc-input-card">
      <h2 className="mc-card-title">자원 입력</h2>
      <div className="mc-field">
        <label htmlFor="currentMysticMedals" className="mc-label">
          현재 보유 신비갈피
        </label>
        <input
          id="currentMysticMedals"
          name="currentMysticMedals"
          type="number"
          min="0"
          className="mc-input"
          value={values.currentMysticMedals}
          onChange={handleChange}
          placeholder="예) 500"
        />
      </div>
      <div className="mc-field">
        <label htmlFor="currentSkystones" className="mc-label">
          보유 하늘석
        </label>
        <input
          id="currentSkystones"
          name="currentSkystones"
          type="number"
          min="0"
          className="mc-input"
          value={values.currentSkystones}
          onChange={handleChange}
          placeholder="예) 3000"
        />
      </div>
      <div className="mc-field">
        <label htmlFor="remainingPityCount" className="mc-label">
          천장까지 남은 뽑기 횟수
        </label>
        <input
          id="remainingPityCount"
          name="remainingPityCount"
          type="number"
          min="0"
          max="200"
          className="mc-input"
          value={values.remainingPityCount}
          onChange={handleChange}
          placeholder="예) 200"
        />
      </div>
      <button type="button" className="mc-btn-calc" onClick={onCalculate}>
        계산하기
      </button>
    </div>
  );
}
