import '../MysticCalculator.css';

export default function MascotComment({ comment }) {
  if (!comment) return null;

  return (
    <div className="mc-card mc-mascot-card">
      <div className="mc-mascot-row">
        <span className="mc-mascot-avatar" aria-hidden="true">🐭</span>
        <div className="mc-mascot-bubble">
          <span className="mc-mascot-name">에장연</span>
          <p className="mc-mascot-text">{comment}</p>
        </div>
      </div>
    </div>
  );
}
