import packageRecommendations from '../data/packageRecommendations';
import '../MysticCalculator.css';

const PRICE_COLOR = {
  낮음: 'mc-price-low',
  중간: 'mc-price-mid',
  높음: 'mc-price-high',
};

export default function PackageRecommendation() {
  return (
    <div className="mc-card mc-package-card">
      <h2 className="mc-card-title">패키지 참고 안내</h2>
      <p className="mc-package-notice">
        ⚠ 아래는 <strong>예시(Mock) 데이터</strong>입니다.<br />
        부족분 기준의 참고용이며, 실제 구매는 게임 내 상점을 확인하세요.
      </p>
      <ul className="mc-package-list">
        {packageRecommendations.map((pkg) => (
          <li key={pkg.id} className="mc-package-item">
            <div className="mc-package-info">
              <span className="mc-package-name">{pkg.name}</span>
              <span className="mc-package-desc">{pkg.description}</span>
            </div>
            <span className={`mc-package-price ${PRICE_COLOR[pkg.priceLabel] ?? ''}`}>
              {pkg.priceLabel}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
