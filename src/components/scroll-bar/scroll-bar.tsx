import React, {
    HTMLAttributes,
    PropsWithChildren,
    forwardRef,
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";
import * as styles from "./scroll-bar.module.css";

export const Track = forwardRef<
  HTMLDivElement,
  PropsWithChildren<HTMLAttributes<HTMLDivElement>>
>(({ children, ...props }, ref) => {
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});


export const Thumb = forwardRef<
  HTMLSpanElement,
  HTMLAttributes<HTMLSpanElement>
>(({ ...props }, ref) => {
  return <span ref={ref} {...props} />;
});

export type ScrollDirection = "down" | "up" | "left" | "right";

/* scroll behavior
 * - track click 시 위아래로 동작 (thumb 영역 클릭시 동작 X)
 * - thumb drag시 scroll이벤트 모방 동작
 * - track 영역 hover 시 track SHOW
 * - scroll 이벤트 시 SHOW, 종료시 HIDE
 */

export const requestAnimationFrame =
  window.requestAnimationFrame || window.setTimeout;

const regex = /\d+?(\.\d+)|\d+/g;
const MIN_SIZE = 10;

export interface ScrollBarProps extends HTMLAttributes<HTMLDivElement> {
  contentMaxHeight?: string;
  // isReverse?: boolean;
  // scrollId?: string;
  testId?: string;
}

export const ScrollBar = forwardRef<
  HTMLDivElement,
  PropsWithChildren<ScrollBarProps>
>(({ children, contentMaxHeight, className = "", testId, ...props }, ref) => {
  const [scrollStartPosition, setScrollStartPosition] = useState<number | null>(
    null
  );
  const [initialScrollPosition, setInitialScrollPosition] = useState<number>(0);

  const [isYDragging, setIsYDragging] = useState<boolean>(false);
  const [isXDragging, setIsXDragging] = useState<boolean>(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const trackYRef = useRef<HTMLDivElement | null>(null);
  const thumbYRef = useRef<HTMLSpanElement | null>(null);
  const scrollYTimeout = useRef<ReturnType<typeof setTimeout>>();

  const trackXRef = useRef<HTMLDivElement | null>(null);
  const thumbXRef = useRef<HTMLSpanElement | null>(null);
  const scrollXTimeout = useRef<ReturnType<typeof setTimeout>>();

  const scrollValueRef: { y: number; x: number }[] = [{ y: 0, x: 0 }];
  const contentHeightRef = useRef<number>(0);
  const thumbHeightRef = useRef<number>(0);
  const thumbWidthRef = useRef<number>(0);

  const clearScrollYTimeOut = useCallback(() => {
    if (scrollYTimeout.current) {
      clearTimeout(scrollYTimeout.current);
    }
  }, []);

  const clearScrollXTimeOut = useCallback(() => {
    if (scrollXTimeout.current) {
      clearTimeout(scrollXTimeout.current);
    }
  }, []);

  const getWrapperHeight = useCallback(() => {
    if (!wrapperRef.current) return 0;

    const { clientHeight } = wrapperRef.current;
    const marginBottom = parseInt(
      wrapperRef.current.style.marginBottom.replace("px", "")
    );

    if (marginBottom < 0) return clientHeight + marginBottom;

    return clientHeight;
  }, []);

  const getWrapperWidth = useCallback(() => {
    if (!wrapperRef.current) return 0;

    const { clientWidth } = wrapperRef.current;
    const marginRight = parseInt(
      wrapperRef.current.style.marginRight.replace("px", "")
    );

    if (marginRight < 0) return clientWidth + marginRight;

    return clientWidth;
  }, []);

  const checkIsXScrollable = useCallback(() => {
    if (!contentRef.current || !wrapperRef.current) return false;
    if (contentRef.current.scrollWidth > getWrapperWidth()) return true;

    return false;
  }, [getWrapperWidth]);

  const checkIsYScrollable = useCallback(() => {
    if (!contentRef.current || !wrapperRef.current) return false;
    if (contentRef.current.scrollHeight > getWrapperHeight()) return true;

    return false;
  }, [getWrapperHeight]);

  const setTrackHeight = useCallback(() => {
    if (!trackYRef.current) return;

    trackYRef.current.style.setProperty("height", `${getWrapperHeight()}px`);
  }, [trackYRef, getWrapperHeight]);

  const setTrackWidth = useCallback(() => {
    if (!trackXRef.current) return;

    trackXRef.current.style.setProperty("width", `${getWrapperWidth()}px`);
  }, [trackXRef, getWrapperWidth]);

  const setThumbHeight = useCallback(() => {
    if (!thumbYRef.current || !contentRef.current) return;

    const contentHeight = getWrapperHeight();
    const thumbHeight =
      contentHeight / (contentRef.current.scrollHeight / contentHeight);
    const correctedHeight = thumbHeight < MIN_SIZE ? MIN_SIZE : thumbHeight;

    thumbHeightRef.current = thumbHeight;
    thumbYRef.current.style.height = `${correctedHeight}px`;
  }, [getWrapperHeight, thumbHeightRef]);

  const setThumbWidth = useCallback(() => {
    if (!thumbXRef.current || !contentRef.current) return;

    const contentWidth = getWrapperWidth();
    const thumbWidth =
      contentWidth / (contentRef.current.scrollWidth / contentWidth);
    const correctedWidth = thumbWidth < MIN_SIZE ? MIN_SIZE : thumbWidth;

    thumbWidthRef.current = thumbWidth;
    thumbXRef.current.style.width = `${correctedWidth}px`;
  }, [getWrapperWidth]);

  const handleThumbPositionY = useCallback(() => {
    if (!contentRef.current || !thumbYRef.current || !trackYRef.current) return;
    clearScrollYTimeOut();

    const { scrollTop: scrolledHeight, scrollHeight } = contentRef.current;
    const correctedPos =
      thumbHeightRef.current <= MIN_SIZE
        ? (scrolledHeight / scrollHeight) *
          (trackYRef.current.clientHeight - (MIN_SIZE - thumbHeightRef.current))
        : (scrolledHeight / scrollHeight) * trackYRef.current.clientHeight;

    thumbYRef.current.style.transform = `translateY(${correctedPos}px)`;

    hideYTrack(1000);
  }, []);

  const handleThumbPositionX = useCallback(() => {
    if (!contentRef.current || !thumbXRef.current || !trackXRef.current) return;

    clearScrollXTimeOut();

    const { scrollLeft: scrolledWidth, scrollWidth } = contentRef.current;
    const correctedPos =
      thumbWidthRef.current <= MIN_SIZE
        ? (scrolledWidth / scrollWidth) *
          (trackXRef.current.clientWidth - (MIN_SIZE - thumbWidthRef.current))
        : (scrolledWidth / scrollWidth) * trackXRef.current.clientWidth;

    thumbXRef.current.style.transform = `translateX(${correctedPos}px)`;

    hideXTrack(1000);
  }, []);

  const hideYTrack = (sec: number) => {
    if (!trackYRef.current) return;
    const track = trackYRef.current;

    clearScrollYTimeOut();

    scrollYTimeout.current = setTimeout(() => {
      track.style.setProperty("transition", "all 0.2s ease");
      track.style.setProperty("opacity", "0");
      track.style.setProperty("z-index", "-1");
    }, sec);
  };

  const hideXTrack = (sec: number) => {
    if (!trackXRef.current) return;

    const track = trackXRef.current;

    clearScrollXTimeOut();

    scrollXTimeout.current = setTimeout(() => {
      track.style.setProperty("transition", "all 0.2s ease");
      track.style.setProperty("opacity", "0");
      track.style.setProperty("z-index", "-1");
    }, sec);
  };

  const showTrack = useCallback(() => {
    if (!trackYRef.current || isXDragging) return;

    trackYRef.current.style.setProperty("transition", "none");
    trackYRef.current.style.setProperty("z-index", "0");
    trackYRef.current.style.setProperty("opacity", "0.7");
  }, [isXDragging]);

  const showXTrack = useCallback(() => {
    if (!trackXRef.current || isYDragging) return;

    trackXRef.current.style.setProperty("transition", "none");
    trackXRef.current.style.setProperty("z-index", "0");
    trackXRef.current.style.setProperty("opacity", "0.7");
  }, [isYDragging]);

  const setTrack = () => {
    requestAnimationFrame(() => {
      setTrackHeight();
      setTrackWidth();
      setThumbHeight();
      handleThumbPositionY();
      setThumbWidth();
      handleThumbPositionX();
    });
  };

  const checkScrollDirection = () => {
    if (!contentRef.current) return { y: false, x: false };

    const content = contentRef.current;

    const beforeScroll = scrollValueRef.pop() || { y: 0, x: 0 };
    const { scrollTop: currentYScroll, scrollLeft: currentXScroll } = content;

    const isYScrollable = checkIsYScrollable();
    const isXScrollable = checkIsXScrollable();

    const yDirection = (() => {
      if (!isYScrollable || beforeScroll.y === currentYScroll) {
        return false;
      }
      if (beforeScroll.y < currentYScroll) return "down";
      return "up";
    })();

    const xDirection = (() => {
      if (!isXScrollable && beforeScroll.x === currentXScroll) {
        return false;
      }
      if (beforeScroll.x < currentXScroll) return "right";
      return "left";
    })();

    scrollValueRef.push({ y: currentYScroll, x: currentXScroll });

    return { y: yDirection, x: xDirection };
  };

  const onScroll = () => {
    requestAnimationFrame(() => {
      if (!contentRef.current) return;

      const scrollDirection = checkScrollDirection();
      const currentContentHeight = contentRef.current.scrollHeight;

      if (currentContentHeight !== contentHeightRef.current) setTrack();

      contentHeightRef.current = currentContentHeight;

      if (scrollDirection.y) {
        handleThumbPositionY();
        showTrack();

        hideYTrack(1000);
      }

      if (scrollDirection.x) {
        handleThumbPositionX();
        showXTrack();

        hideXTrack(1000);
      }
    });
  };

  const onThumbMousemove = useCallback(
    (e: MouseEvent) => {
      requestAnimationFrame(() => {
        if (
          !contentRef.current ||
          !scrollStartPosition ||
          !thumbYRef.current ||
          !thumbXRef.current
        )
          return;

        if (isYDragging) {
          const { scrollHeight } = contentRef.current;
          const scrollRatio =
            scrollHeight / (trackYRef.current?.clientHeight ?? 1);

          contentRef.current.scrollTop =
            initialScrollPosition +
            scrollRatio * (e.clientY - scrollStartPosition);
        }

        if (isXDragging) {
          const { scrollWidth } = contentRef.current;
          const scrollRatio =
            scrollWidth / (trackXRef.current?.clientWidth ?? 1);

          contentRef.current.scrollLeft =
            initialScrollPosition +
            scrollRatio * (e.clientX - scrollStartPosition);
        }
      });
    },
    [isYDragging, isXDragging, initialScrollPosition, scrollStartPosition]
  );

  const onThumbMouseup = useCallback(() => {
    if (isYDragging) setIsYDragging(false);
  }, [isYDragging, setIsYDragging]);

  const onThumbYMousedown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setScrollStartPosition(e.clientY);

    if (contentRef.current)
      setInitialScrollPosition(contentRef.current.scrollTop);

    setIsYDragging(true);
  };

  const onThumbXMousedown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setScrollStartPosition(e.clientX);

    if (contentRef.current)
      setInitialScrollPosition(contentRef.current.scrollLeft);

    setIsXDragging(true);
  };

  const onYTrackClick = (e: React.MouseEvent) => {
    if (!thumbYRef.current || !trackYRef.current || isYDragging || isXDragging)
      return false;

    const currentThumbPos = parseInt(
      thumbYRef.current.style.transform.match(regex)?.[0] || "0"
    );
    const { offsetY, target } = e.nativeEvent;

    if (target !== trackYRef.current) return;

    if (offsetY < currentThumbPos) return handleTrackClick("up");
    if (offsetY > +currentThumbPos + thumbHeightRef.current)
      return handleTrackClick("down");
  };

  const onXTrackClick = (e: React.MouseEvent) => {
    if (!thumbXRef.current || !trackYRef.current || isYDragging || isXDragging)
      return false;

    const currentThumbPos = parseInt(
      thumbXRef.current.style.transform.match(regex)?.[0] || "0"
    );
    const { offsetX, target } = e.nativeEvent;

    if (target !== trackXRef.current) return;

    if (offsetX < currentThumbPos) return handleTrackClick("right");
    if (offsetX > +currentThumbPos + thumbWidthRef.current)
      return handleTrackClick("left");
  };

  const handleTrackClick = (direction: ScrollDirection) => {
    if (!contentRef.current) return;

    const screenHeight = contentRef.current.clientHeight * 0.9;
    const screenWidth = contentRef.current.clientWidth * 0.9;

    const scrollValue: { top: number; left: number } = (() => {
      switch (direction) {
        case "down":
          return { top: screenHeight, left: 0 };
        case "up":
          return { top: -screenHeight, left: 0 };
        case "left":
          return { top: 0, left: screenWidth };
        case "right":
          return { top: 0, left: -screenWidth };
        default:
          return { top: 0, left: 0 };
      }
    })();

    contentRef.current.scrollBy({
      top: scrollValue.top,
      left: scrollValue.left
    });
  };

  const hideAllTrack = () => {
    if (!isYDragging) hideYTrack(100);
    if (!isXDragging) hideXTrack(100);
  };

  const onWrapperMousemove = useCallback(
    (e: MouseEvent) => {
      if (isYDragging || isXDragging) return onThumbMousemove(e);

      onThumbMouseup();
    },
    [isYDragging, isXDragging, onThumbMousemove, onThumbMouseup]
  );

  const onWrapperMouseup = useCallback(() => {
    setIsYDragging(false);
    setIsXDragging(false);
  }, []);

  const onContentMousemove = (e: React.MouseEvent) => {
    const { currentTarget } = e;

    if (currentTarget instanceof HTMLElement) {
      const isYScrollable = checkIsYScrollable();
      const isXScrollable = checkIsXScrollable();

      if (isYScrollable) {
        clearScrollYTimeOut();
        showTrack();

        hideYTrack(2000);
      }

      if (isXScrollable) {
        clearScrollXTimeOut();
        showXTrack();

        hideXTrack(2000);
      }
    }
  };

  const resizeObserver = new ResizeObserver(() => {
    requestAnimationFrame(() => {
      if (!checkIsXScrollable()) hideXTrack(300);
      if (!checkIsYScrollable()) hideYTrack(300);

      setTrack();
    });
  });

  useEffect(() => {
    handleThumbPositionY();
  }, [thumbHeightRef.current]);

  useEffect(() => {
    handleThumbPositionX();
  }, [thumbWidthRef.current]);

  useEffect(() => {
    if (!contentRef.current) return;

    const target =
      contentRef.current.childElementCount > 1
        ? contentRef.current
        : contentRef.current.children[0];

    if (target) resizeObserver.observe(target);

    return () => {
      resizeObserver.disconnect();
    };
  }, [contentRef]);

  useEffect(() => {
    setTrack();

    window.addEventListener("resize", setTrack);

    window.addEventListener("mousemove", onWrapperMousemove);
    window.addEventListener("mouseup", onWrapperMouseup);

    return () => {
      window.removeEventListener("resize", setTrack);

      window.removeEventListener("mousemove", onWrapperMousemove);
      window.removeEventListener("mouseup", onWrapperMouseup);
    };
  }, [setTrack, onWrapperMousemove, onWrapperMouseup]);

  const trackTestId = testId ? `${testId}-track-y` : undefined;
  const thumbTestId = testId ? `${testId}-thumb-y` : undefined;

  const trackXTestId = testId ? `${testId}-track-x` : undefined;
  const thumbXTestId = testId ? `${testId}-thumb-x` : undefined;
  const wrapperTestId = testId ? `${testId}-wrapper` : undefined;
  const contentTestId = testId ? `${testId}-content` : undefined;

  return (
    <div
      ref={wrapperRef}
      className={`${styles.container} ${className}`}
      onMouseMove={onContentMousemove}
      onMouseLeave={hideAllTrack}
      data-testid={wrapperTestId}
      {...props}>
      <div
        ref={(el) => {
          contentRef.current = el;
          if (!ref) return;
          if (typeof ref !== "function") return (ref.current = el);
          ref(el);
        }}
        className={`${styles.content}`}
        data-testid={contentTestId}
        onScroll={onScroll}
        style={{ maxHeight: contentMaxHeight }}>
        {children}
      </div>

      <Track
        ref={trackYRef}
        role="scrollbar"
        aria-orientation="vertical"
        aria-label="세로 스크롤바"
        className={styles.trackY}
        onClick={onYTrackClick}
        data-testid={trackTestId}>
        <Thumb
          ref={thumbYRef}
          role="slider"
          aria-label="세로 스크롤 핸들"
          onMouseDown={onThumbYMousedown}
          data-testid={thumbTestId}
        />
      </Track>
      <Track
        ref={trackXRef}
        role="scrollbar"
        aria-orientation="horizontal"
        aria-label="가로 스크롤바"
        className={styles.trackX}
        onClick={onXTrackClick}
        data-testid={trackXTestId}>
        <Thumb
          ref={thumbXRef}
          role="slider"
          aria-label="가로 스크롤 핸들"
          onMouseDown={onThumbXMousedown}
          data-testid={thumbXTestId}
        />
      </Track>
    </div>
  );
});
