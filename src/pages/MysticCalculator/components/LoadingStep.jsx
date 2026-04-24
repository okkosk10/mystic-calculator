import '../MysticCalculator.css';

export default function LoadingStep() {
  return (
    <div className="mc-step-loading">
      <div className="mc-loading-char-wrap">
        <img
          src="/image/head_big.png"
          alt="에장연 캐릭터"
          className="mc-char-img mc-char-pulse"
        />
        <div className="mc-loading-ring" aria-hidden="true" />
      </div>
      <p className="mc-loading-text">
        땃쥐 브레인 가동중<span className="mc-loading-dots"><span>.</span><span>.</span><span>.</span></span>
      </p>
    </div>
  );
}
