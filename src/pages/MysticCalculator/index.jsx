import { useState, useEffect } from 'react';
import InputStep from './components/InputStep';
import LoadingStep from './components/LoadingStep';
import ResultStep from './components/ResultStep';
import { calculateMystic } from './utils/calculateMystic';
import { getMascotComment, shouldShowPackage } from './utils/recommendationRules';
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
  const [step, setStep] = useState('input');
  const [inputValues, setInputValues] = useState(DEFAULT_VALUES);
  const [result, setResult] = useState(null);
  const [comment, setComment] = useState('');
  const [showPackage, setShowPackage] = useState(false);

  function handleSubmit() {
    const parsed = parseInput(inputValues);
    const r = calculateMystic(parsed);
    setResult(r);
    setComment(getMascotComment(r));
    setShowPackage(shouldShowPackage(r));
    setStep('loading');
  }

  useEffect(() => {
    if (step !== 'loading') return;
    const timer = setTimeout(() => setStep('result'), 2000);
    return () => clearTimeout(timer);
  }, [step]);

  function handleReset() {
    setStep('input');
  }

  return (
    <div className="mc-wrapper">
      <header className="mc-header">
        <h1 className="mc-title">신비뽑기 계산기</h1>
        <p className="mc-subtitle">신비 소환 천장 계산 &amp; 비상런 예측 도구</p>
      </header>

      <main className="mc-main">
        {step === 'input' && (
          <InputStep
            values={inputValues}
            onChange={setInputValues}
            onSubmit={handleSubmit}
          />
        )}
        {step === 'loading' && <LoadingStep />}
        {step === 'result' && (
          <ResultStep
            result={result}
            comment={comment}
            showPackage={showPackage}
            onReset={handleReset}
          />
        )}
      </main>

      <footer className="mc-footer">
        <p>에픽세븐 비공식 팬 도구 · 수치는 추정값입니다</p>
      </footer>
    </div>
  );
}

