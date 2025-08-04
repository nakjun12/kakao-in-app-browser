import { useEffect } from "react";

export const useHandleScreenSize = () => {
  // init screen size
  const setScreenSize = () => {
    const vh = window.innerHeight * 0.01;

    document.documentElement.style.position = "relative";
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };

  // 모바일에서 키보드 유무에 따른 화면 사이즈 조절
  const handleScreenResize = (event: Event) => {
    const target = event.target;

    if (target instanceof VisualViewport) {
      document.documentElement.style.maxHeight = `${target.height}px`;
    }
  };

  useEffect(() => {
    const viewport = window.visualViewport;

    setScreenSize();
    viewport?.addEventListener("resize", handleScreenResize);

    return () => {
      viewport?.removeEventListener("resize", handleScreenResize);
    };
  }, []);
};
