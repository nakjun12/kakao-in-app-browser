import { useEffect } from 'react';
import './App.css';
import { Textarea } from './components/textarea/textarea';
import { useLocalStorageStateWithGeneric } from './hooks/use-local-storage-state-with-generic';

const answerArray = Array.from({ length: 1000 });

function App() {

const [answer, setAnswer] = useLocalStorageStateWithGeneric<
  Record<string, string>
>({
  key: "answer",
  initialValue: answerArray.reduce((acc: Record<string, string>, _, index) => {
    acc[index] = "";
    return acc;
  }, {})
});
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isKakaoInApp = userAgent.includes("kakaotalk");

    console.log(userAgent);
    console.log(isKakaoInApp);
    console.log(window.location.href);
    // 카카오톡 인앱 브라우저일 경우에만 실행
    if (isKakaoInApp) {
      console.log("카카오톡 인앱 브라우저일 경우");
      // const targetUrl = `${window.location.href}/`;
      // window.location.replace(
      //   `kakaotalk://web/openExternal?url=${encodeURIComponent(targetUrl)}`
      // );
    }
  }, []);


console.log(answer);

  return (
    <>
      <hr style={{ margin: "2rem 0" }} />
      <button
        onClick={() => {
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
          gap: "8px",
          width: "100%",

        }}>
        <h2>1000 Textareas</h2>
        {Array.from({ length: 1000 }).map((_, index) => (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", maxWidth: "500px" }}>
            <div style={{ fontSize: "12px", color: "gray", height: "300px", backgroundColor: "gray" }}>{index}</div>
      
          <Textarea
            key={index} // 리스트 렌더링 시 각 요소를 구별하기 위한 고유한 key
            placeholder={`Text Area #${index + 1}`}
            value={answer[index]}
            onChange={(e) => {
              setAnswer({ ...answer, [index]: e.target.value });
            }}
          />
          </div>
        ))}
      </div>
    </>
  );
}

export default App
