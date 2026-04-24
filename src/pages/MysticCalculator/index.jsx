import { useState } from 'react';
import MysticInputForm from './components/MysticInputForm';
import MysticResultCard from './components/MysticResultCard';
import MysticRunEstimate from './components/MysticRunEstimate';
import MascotComment from './components/MascotComment';
import { calculateMystic } from './utils/calculateMystic';
import { getMascotComment } from './utils/recommendationRules';
import './MysticCalculator.css';

const DEFAULT_VALUES = {
  currentMysticMedals: '500',
  currentSkystones: '3000',
  remainingPityCount: '200',
};

function parseInput(values) {
  return {
    currentMysticMedals: values.currentMysticMedals === '' ? 0 : Number(values.currentMysticMedals),
    currentSkystones: values.currentSkystones === '' ? 0 : Number(values.currentSkystones),
    remainingPityCount: values.remainingPityCount === '' ? 0 : Number(values.remainingPityCount),
  };
}

export default function MysticCalculator() {
  const [inputValues, setInputValues] = useState(DEFAULT_VALUES);
  const [result, setResult] = useState(() => calculateMystic(parseInput(DEFAULT_VALUES)));
  const [comment, setComment] = useState(() => {
    const r = calculateMystic(parseInput(DEFAULT_VALUES));
    return getMascotComment(r);
  });

  function handleCalculate() {
    const parsed = parseInput(inputValues);
    const r = calculateMystic(parsed);
    setResult(r);
    setComment(getMascotComment(r));
  }

  return (
    <div className="mc-wrapper">
      <header className="mc-header">
        <h1 className="mc-title">신비뽑기 계산기</h1>
        <p className="mc-subtitle">신비 소환 천장 계산 &amp; 비상런 예측 도구</p>
      </header>

      <main className="mc-main">
        <MysticInputForm
          values={inputValues}
          onChange={setInputValues}
          onCalculate={handleCalculate}
        />
        <MysticResultCard result={result} />
        <MysticRunEstimate result={result} />
        <MascotComment comment={comment} />
      </main>

      <footer className="mc-footer">
        <p>에픽세븐 비공식 팬 도구 · 수치는 추정값입니다</p>
      </footer>
    </div>
  );
}
