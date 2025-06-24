import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState(new Array(30).fill(null));
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [scores, setScores] = useState(null);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/questions`);
      const questionsData = response.data; // 配列を直接取得
      const shuffled = shuffleArray([...questionsData]); // 30問全て
      setQuestions(questionsData);
      setShuffledQuestions(shuffled);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleOptionSelect = (option, factor) => {
    setSelectedOption({ option, factor });
  };

  const handleNext = () => {
    if (!selectedOption) return;

    const newResponse = {
      questionId: shuffledQuestions[currentQuestion].id,
      selectedOption: selectedOption.option,
      selectedFactor: selectedOption.factor
    };

    // インデックスベースで更新
    const newResponses = [...responses];
    newResponses[currentQuestion] = newResponse;
    setResponses(newResponses);
    setSelectedOption(null);

    if (currentQuestion < 29) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // nullでない回答のみでスコア計算
      const validResponses = newResponses.filter(r => r !== null);
      calculateScores(validResponses);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(null);
      // responses配列は変更しない（インデックスベース管理）
    }
  };

  // 戻った問題で前回選択していた回答を復元
  useEffect(() => {
    const previousResponse = responses[currentQuestion];
    if (previousResponse) {
      setSelectedOption({
        option: previousResponse.selectedOption,
        factor: previousResponse.selectedFactor
      });
    } else {
      setSelectedOption(null);
    }
  }, [currentQuestion, responses]);

  const calculateScores = (allResponses) => {
    const factorCounts = { C: 0, A: 0, E: 0, O: 0, N: 0, H: 0 };
    
    allResponses.forEach((response) => {
      const question = shuffledQuestions.find(q => q.id === response.questionId);
      const selectedFactor = response.selectedFactor;
      const weight = question.weight || 1;
      
      // 選択された因子: +1 (許容可能)
      factorCounts[selectedFactor] += weight;
      
      // 非選択因子（問題内のもう一方のみ）: -1 (許容不可)
      const otherFactor = question.optionA.factor === selectedFactor 
        ? question.optionB.factor 
        : question.optionA.factor;
      factorCounts[otherFactor] -= weight;
    });

    const values = Object.values(factorCounts);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const result = {
      ...factorCounts,
      stdDev: stdDev.toFixed(2)
    };

    setScores(result);
    setShowResult(true);
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setResponses(new Array(30).fill(null));
    setSelectedOption(null);
    setShowResult(false);
    setScores(null);
    const shuffled = shuffleArray([...questions]); // 30問全て
    setShuffledQuestions(shuffled);
  };

  const renderProgressDots = () => {
    return (
      <div className="progress-dots">
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={i}
            className={`dot ${i === currentQuestion ? 'current' : ''} ${i < currentQuestion ? 'completed' : ''}`}
          />
        ))}
      </div>
    );
  };

  const renderQuestion = () => {
    if (shuffledQuestions.length === 0) return <div>Loading...</div>;

    const question = shuffledQuestions[currentQuestion];
    const options = [question.optionA, question.optionB];
    const shuffledOptions = Math.random() > 0.5 ? options : [options[1], options[0]];

    return (
      <div className="question-container">
        <div className="question-header">
          <div className="question-counter">{currentQuestion + 1}/30</div>
          {renderProgressDots()}
        </div>
        
        <h2 className="question-title">以下のどちらなら許容できる？</h2>
        
        <div className="options-container">
          {shuffledOptions.map((option, index) => (
            <button
              key={index}
              className={`option-button ${selectedOption?.option === (index === 0 ? 'A' : 'B') ? 'selected' : ''}`}
              onClick={() => handleOptionSelect(
                shuffledOptions === options ? (index === 0 ? 'A' : 'B') : (index === 0 ? 'B' : 'A'),
                option.factor
              )}
            >
              {option.text}
            </button>
          ))}
        </div>

        <div className="navigation-buttons">
          {currentQuestion > 0 && (
            <button className="nav-button back" onClick={handleBack}>
              戻る
            </button>
          )}
          <button 
            className={`nav-button next ${!selectedOption ? 'disabled' : ''}`}
            onClick={handleNext}
            disabled={!selectedOption}
          >
            次へ
          </button>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    if (!scores) return null;

    const prompt = `You are an expert in personality evaluation. The following scores are based on Big Five + HEXACO factors, from negative-question responses. These scores show what kind of traits the person minimally requires in a partner, and what traits they want to avoid.

Factor meanings:
- C: Conscientiousness (planning, responsibility, rule-following)
- A: Agreeableness (kindness, harmony, avoiding conflict)
- E: Extraversion (sociability, assertiveness, center of attention)
- O: Openness (curiosity, flexible ideas, trying new things)
- N: Neuroticism (emotional stability; lower is more stable)
- H: Honesty-Humility (fairness, sincerity, no abuse of power)

Scores:
C: ${scores.C}
A: ${scores.A}
E: ${scores.E}
O: ${scores.O}
N: ${scores.N}
H: ${scores.H}

StdDev: ${scores.stdDev}

Please generate a natural Japanese text (around 300 characters) as if advising a user. The text must:
1. Use "あなた" as the subject instead of "私".
2. Focus on the partner's minimum requirements (highest factor) and unacceptable traits (lowest factor).
3. Mention only the highest and lowest factors (use and condition if tied).
4. If StdDev < 1.5, include a phrase like 「あなたは特定の気質ではなく全体のバランスが大事だと考えています」. Otherwise, do not mention standard deviation or strength of preference.
5. Ensure the whole text is consistent and natural. Revise wording if necessary to avoid contradictions.`;

    return (
      <div className="result-container">
        <h2>診断結果</h2>
        <div className="scores-display">
          <h3>各因子スコア:</h3>
          <div className="score-grid">
            <div>誠実性 (C): {scores.C}</div>
            <div>協調性 (A): {scores.A}</div>
            <div>外向性 (E): {scores.E}</div>
            <div>開放性 (O): {scores.O}</div>
            <div>神経症傾向 (N): {scores.N}</div>
            <div>正直性 (H): {scores.H}</div>
            <div>標準偏差: {scores.stdDev}</div>
          </div>
        </div>
        
        <div className="prompt-display">
          <h3>分析用プロンプト:</h3>
          <textarea 
            value={prompt}
            readOnly
            rows={20}
            className="prompt-textarea"
          />
        </div>

        <button className="restart-button" onClick={handleRestart}>
          もう一度
        </button>
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>人材適性診断</h1>
      </header>
      <main>
        {showResult ? renderResult() : renderQuestion()}
      </main>
    </div>
  );
};

export default App;