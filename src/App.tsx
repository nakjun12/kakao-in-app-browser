import { useRef, useState } from "react";

type Answer = {
  id: number;
  value: string;
  selectedOption: string | null;
};

const App = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(
    Array.from(
      { length: 5 },
      (_, i): Answer => ({
        id: i,
        value: "",
        selectedOption: null
      })
    )
  );
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // useEffect(() => {
  //   // viewport 높이 설정 (iOS Safari 대응)
  //   const setViewportHeight = () => {
  //     const vh = window.innerHeight * 0.01;
  //     document.documentElement.style.setProperty("--vh", `${vh}px`);
  //   };

  //   setViewportHeight();
  //   window.addEventListener("resize", setViewportHeight);

  //   return () => window.removeEventListener("resize", setViewportHeight);
  // }, []);

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) =>
      prev.map((answer, index) =>
        index === currentQuestionIndex ? { ...answer, value } : answer
      )
    );
  };

  const handleOptionSelect = (option: string) => {
    setAnswers((prev) =>
      prev.map((answer, index) =>
        index === currentQuestionIndex
          ? { ...answer, selectedOption: option }
          : answer
      )
    );
  };

  const handleNext = () => {
    if (currentQuestionIndex < answers.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const progressPercentage =
    ((currentQuestionIndex + 1) / answers.length) * 100;
  const currentAnswer = answers[currentQuestionIndex];

  return (
    <div className="app-container">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        /* iOS Safari 대응 스타일 */
        html, body {
          height: 100%;
          overflow: hidden;
          position: fixed;
          width: 100%;
          -webkit-overflow-scrolling: touch;
        }
        
        .app-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          height: 100vh;
          height: calc(var(--vh, 1vh) * 100);
          display: flex;
          flex-direction: column;
          background-color: white;
        }
        
        .header {
          position: relative;
          height: 56px;
          background: white;
          display: flex;
          align-items: center;
          padding: 8px 4px;
          flex-shrink: 0;
        }
        
        .back-button {
          width: 40px;
          height: 40px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1a1a1a;
        }
        
        .back-button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        
        .progress-bar {
          height: 3px;
          background: #e0e0e0;
          position: relative;
          flex-shrink: 0;
        }
        
        .progress-fill {
          height: 100%;
          background: #2196f3;
          transition: width 0.3s ease;
          transform-origin: left;
        }
        
        /* 메인 콘텐츠 영역 - flex-1로 남은 공간 차지 */
        .content-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          padding: 20px 20px 20px 20px;
        }
        
        .content-inner {
          flex: 1;
          display: flex;
          flex-direction: column;
          max-width: 770px;
          width: 100%;
          margin: 0 auto;
        }
        
        .question-header {
          margin-bottom: 20px;
        }
        
        .question-title {
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 8px;
        }
        
        .question-subtitle {
          font-size: 14px;
          color: #666;
        }
        
        .options-container {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        
        .option-button {
          width: 100%;
          padding: 16px;
          background: white;
          border: none;
          border-bottom: 1px solid #e0e0e0;
          text-align: left;
          cursor: pointer;
          transition: background 0.2s;
          font-size: 16px;
        }
        
        .option-button:last-child {
          border-bottom: none;
        }
        
        .option-button:hover {
          background: #f5f5f5;
        }
        
        .option-button.selected {
          background: #e3f2fd;
          color: #2196f3;
          font-weight: 600;
        }
        
        /* iOS textarea 포커스 문제 재현을 위한 스타일 */
        .textarea-wrapper {
          position: relative;
          width: 100%;
          margin-top: 12px;
        }
        
        textarea {
          width: 100%;
          min-height: 120px;
          padding: 12px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px; /* iOS 자동 줌 방지 */
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          resize: none;
          background: white;
          transition: all 0.2s;
          
          /* iOS 특정 스타일 */
          -webkit-appearance: none;
          -webkit-border-radius: 8px;
        }
        
        textarea:focus {
          outline: none;
          border-color: #8EBBFF;
          border-width: 1.5px;
          box-shadow: 0 0 3px #E2EEFF;
        }
        
        textarea::placeholder {
          color: #9e9e9e;
          font-size: 14px;
          line-height: 1.5;
        }
        
        /* iOS에서 포커스 시 화면 이동 문제 재현 */
        @supports (-webkit-touch-callout: none) {
          textarea:focus {
            position: relative;
            transform: translateZ(0);
          }
        }
        
        /* 하단 버튼 영역 */
        .bottom-container {
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          flex-shrink: 0;
        }
        
        .submit-button {
          width: 100%;
          max-width: 400px;
          padding: 16px;
          background: #2196f3;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .submit-button:hover:not(:disabled) {
          background: #1976d2;
        }
        
        .submit-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        /* 디버그 정보 표시 */
        .debug-info {
          position: fixed;
          top: 70px;
          right: 10px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 8px;
          border-radius: 4px;
          font-size: 11px;
          z-index: 1000;
          pointer-events: none;
        }
        
        .question-indicator {
          position: absolute;
          top: 16px;
          right: 20px;
          font-size: 14px;
          color: #666;
        }
      `}</style>

      {/* 헤더 */}
      <div className="header">
        <button
          className="back-button"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}>
          ←
        </button>
        <span className="question-indicator">
          {currentQuestionIndex + 1} / {answers.length}
        </span>
      </div>

      {/* 프로그레스 바 */}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* 디버그 정보 */}
      <div className="debug-info">
        <div>
          Device: {navigator.userAgent.includes("iPhone") ? "iPhone" : "Other"}
        </div>
        <div>Height: {window.innerHeight}px</div>
        <div>Question: {currentQuestionIndex + 1}</div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="content-container">
        <div className="content-inner">
          {/* 질문 헤더 */}
          <div className="question-header">
            <h2 className="question-title">
              팀 협업 만족도 조사 - 질문 {currentQuestionIndex + 1}
            </h2>
            <p className="question-subtitle">
              최근 프로젝트에서의 경험을 바탕으로 답변해 주세요.
            </p>
          </div>

          {/* 옵션 버튼들 */}
          <div className="options-container">
            {["매우 만족", "만족", "보통", "불만족", "매우 불만족"].map(
              (option) => (
                <button
                  key={option}
                  className={`option-button ${
                    currentAnswer.selectedOption === option ? "selected" : ""
                  }`}
                  onClick={() => handleOptionSelect(option)}>
                  {option}
                </button>
              )
            )}
          </div>

          {/* Textarea */}
          <div className="textarea-wrapper">
            <textarea
              ref={textareaRef}
              placeholder="만족스러운 점이나 개선되어야 할 점이 있다면 구체적으로 입력해 주세요."
              value={currentAnswer.value}
              onChange={(e) => handleAnswerChange(e.target.value)}
              rows={4}
              onFocus={() => {
                setIsFocused(true);
                console.log(
                  `Textarea for question ${currentQuestionIndex + 1} focused`
                );
                // // iOS에서 포커스 문제 재현
                // if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
                //   setTimeout(() => {
                //     e.target.scrollIntoView({
                //       behavior: "smooth",
                //       block: "center"
                //     });
                //   }, 300);
                // }
              }}
              onClick={() => textareaRef.current?.focus()}
              onBlur={() => {
                setIsFocused(false);
                console.log(
                  `Textarea for question ${currentQuestionIndex + 1} blurred`
                );
              }}
            />
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      {!isFocused && (
        <div className="bottom-container">
          <button
            className="submit-button"
            onClick={handleNext}
            disabled={!currentAnswer.selectedOption}>
            {currentQuestionIndex === answers.length - 1 ? "제출" : "다음"}
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
