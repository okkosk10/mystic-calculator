import '../MysticCalculator.css';

const FIELDS = [
  { name: 'remainingPityCount',  label: '천장까지 남은 횟수',  placeholder: '예) 200', max: 200 },
  { name: 'currentMysticMedals', label: '현재 보유 신비갈피', placeholder: '예) 500', max: undefined },
  { name: 'currentSkystones',    label: '보유 하늘석',         placeholder: '예) 3000', max: undefined },
];

export default function InputStep({ values, onChange, onSubmit }) {
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

  function handleDiscountToggle(e) {
    onChange({ ...values, useEarlyDiscount: e.target.checked });
  }

  return (
    <div className="mc-step-input">
      {/* 말풍선 입력 카드 */}
      <div className="mc-input-bubble-wrap">
        <div className="mc-input-bubble">
          {FIELDS.map(({ name, label, placeholder, max }) => (
            <div className="mc-field" key={name}>
              <label htmlFor={name} className="mc-label">{label}</label>
              <input
                id={name}
                name={name}
                type="number"
                min="0"
                max={max}
                className="mc-input"
                value={values[name]}
                onChange={handleChange}
                placeholder={placeholder}
                inputMode="numeric"
              />
            </div>
          ))}

          {/* 초반 30뽑 30% 할인 토글 */}
          <label className="mc-discount-toggle">
            <input
              type="checkbox"
              className="mc-discount-checkbox"
              checked={!!values.useEarlyDiscount}
              onChange={handleDiscountToggle}
            />
            <span className="mc-discount-toggle-box" aria-hidden="true" />
            <span className="mc-discount-toggle-text">
              초반 30뽑 30% 할인 적용
              <span className="mc-discount-toggle-hint">처음 30회는 1회당 신비 메달 35개로 계산</span>
            </span>
          </label>
        </div>
        {/* 말풍선 꼬리 */}
        <div className="mc-bubble-tail" aria-hidden="true" />
      </div>

      {/* 캐릭터 이미지 */}
      <div className="mc-char-stage">
        <img
          src="/image/head_big.webp"
          alt="에장연 캐릭터"
          className="mc-char-img mc-char-float mc-char-input"
        />
      </div>

      {/* 버튼 */}
      <button type="button" className="mc-btn-calc mc-btn-main" onClick={onSubmit}>
        땃지 브레인 발동
      </button>
    </div>
  );
}
