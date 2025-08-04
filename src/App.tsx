import { useEffect } from 'react';
import './App.css';

function App() {

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isKakaoInApp = userAgent.includes("kakaotalk");

    console.log(userAgent);
    console.log(isKakaoInApp);
    console.log(window.location.href);
    // 카카오톡 인앱 브라우저일 경우에만 실행
    if (isKakaoInApp) {
      console.log("카카오톡 인앱 브라우저일 경우");
      const targetUrl = `${window.location.href}/`;
      window.location.replace(
        `kakaotalk://web/openExternal?url=${encodeURIComponent(targetUrl)}`
      );
    }
  }, []);
  return (
    <>

      <hr style={{ margin: "2rem 0" }} />
      <button onClick={() => {
        window.location.href = "kakaoweb://closeBrowser";
      }}>
        closeBrowser
      </button>
      <button onClick={() => {
        window.location.href = "kakaotalk://inappbrowser/close";
      }}>
        closeInAppBrowser
      </button>
      {/* 50개의 Textarea를 세로로 나열하는 부분 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px"
        }}>
        <h2>1000 Textareas</h2>
        {Array.from({ length: 1000 }).map((_, index) => (
          <textarea
            key={index} // 리스트 렌더링 시 각 요소를 구별하기 위한 고유한 key
            rows={2}
            placeholder={`Text Area #${index + 1}`}
            style={{ width: "80%", maxWidth: "400px" }}
          />
        ))}
      </div>
    </>
  );
}

export default App
