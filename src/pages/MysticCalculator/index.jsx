import { useState, useEffect } from 'react';
import InputStep from './components/InputStep';
import LoadingStep from './components/LoadingStep';
import ResultStep from './components/ResultStep';
import { calculateMystic } from './utils/calculateMystic';
import { getMascotComment, shouldShowPackage } from './utils/recommendationRules';
import { parseShareParams } from './utils/shareUrl';
import './MysticCalculator.css';

const STORAGE_KEY = 'mystic-calc-input-v1';

const DEFAULT_VALUES = {
  currentMysticMedals: '500',
  currentSkystones: '3000',
  remainingPityCount: '200',
  useEarlyDiscount: false,
};

function loadSavedInput() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_VALUES;
    const saved = JSON.parse(raw);
    return {
      currentMysticMedals: String(Math.max(0, Math.floor(Number(saved.currentMysticMedals) || 0))),
      currentSkystones: String(Math.max(0, Math.floor(Number(saved.currentSkystones) || 0))),
      remainingPityCount: String(Math.min(200, Math.max(0, Math.floor(Number(saved.remainingPityCount) || 0)))),
      useEarlyDiscount: !!saved.useEarlyDiscount,
    };
  } catch {
    return DEFAULT_VALUES;
  }
}

/**
 * URL 쿼리 > localStorage > DEFAULT_VALUES 순서로 초기값을 결정한다.
 * URL 쿼리로 진입하면 자동 계산 후 결과 화면으로 바로 이동한다.
 */
function buildInitialState() {
  const fromUrl = parseShareParams(window.location.search);
  if (fromUrl) {
    history.replaceState(null, '', window.location.pathname);
    const parsed = parseInput(fromUrl);
    const r = calculateMystic(parsed);
    return {
      values: fromUrl,
      step: 'loading',
      result: r,
      comment: getMascotComment(r),
      showPackage: shouldShowPackage(r),
    };
  }
  return {
    values: loadSavedInput(),
    step: 'input',
    result: null,
    comment: '',
    showPackage: false,
  };
}

function parseInput(values) {
  return {
    currentMysticMedals: values.currentMysticMedals === '' ? 0 : Number(values.currentMysticMedals),
    currentSkystones: values.currentSkystones === '' ? 0 : Number(values.currentSkystones),
    remainingPityCount: values.remainingPityCount === '' ? 0 : Number(values.remainingPityCount),
    useEarlyDiscount: !!values.useEarlyDiscount,
  };
}

export default function MysticCalculator() {
  const [init] = useState(() => buildInitialState());

  const [step, setStep] = useState(init.step);
  const [inputValues, setInputValues] = useState(init.values);
  const [result, setResult] = useState(init.result);
  const [comment, setComment] = useState(init.comment);
  const [showPackage, setShowPackage] = useState(init.showPackage);

  // inputValues 변경 시 localStorage 저장
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inputValues));
    } catch {
      // storage 사용 불가 환경 무시
    }
  }, [inputValues]);

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

  // 다시 계산하기: 입력값 유지, step만 초기화
  function handleReset() {
    setStep('input');
  }

  // 입력 초기화: DEFAULT_VALUES로 되돌리기
  function handleInputReset() {
    setInputValues(DEFAULT_VALUES);
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
            onReset={handleInputReset}
          />
        )}
        {step === 'loading' && <LoadingStep />}
        {step === 'result' && (
          <ResultStep
            result={result}
            comment={comment}
            showPackage={showPackage}
            onReset={handleReset}
            inputValues={inputValues}
          />
        )}
      </main>

      <footer className="mc-footer">
        <p>에픽세븐 비공식 팬 도구 · 수치는 추정값입니다</p>
      </footer>
    </div>
  );
}

