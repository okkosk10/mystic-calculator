import '../MysticCalculator.css';

export default function LoadingStep() {
  return (
    <div className="mc-step-loading">
      <div className="mc-loading-char-wrap">
        <img
          src="/image/head_th.png"
          alt="분석 중인 에장연 캐릭터"
          className="mc-char-img thinking-mascot"
        />
      </div>
      <p className="mc-loading-text">
        땃쥐 브레인 가동중<span className="mc-loading-dots"><span>.</span><span>.</span><span>.</span></span>
      </p>
      <p className="mc-loading-sub">신비뽑기 확률을 분석하고 중...</p>
    </div>
  );
}
