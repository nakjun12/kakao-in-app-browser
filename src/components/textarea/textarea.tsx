import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef
} from "react";
import * as styles from "./textarea.module.css";
import { TextareaImperativeHandleRef, TextareaProps } from "./textarea.type";

export const Textarea = forwardRef<TextareaImperativeHandleRef, TextareaProps>(
  (
    {
      isInvalid = false,
      autoHeight = false,
      className: _className = "",
      isMinHeight46,
      initialAutoHeight,
      noBorder,
      ...props
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const className = useMemo(
      () =>
        `${
          noBorder ? styles.textarea_no_border : styles.textarea
        } ${_className} ${isInvalid ? styles.error : ""} custom-scroll-bar`,
      [isInvalid, _className]
    );

    const resizeTextareaElement = (element: HTMLTextAreaElement) => {
      let isSingleLine = false;
      if (isMinHeight46) {
        isSingleLine = !element.value.includes("\n");
      }
      element.style.height = isSingleLine
        ? element.style.minHeight ?? "46px"
        : "auto";
      element.style.height = `${element.scrollHeight}px`;
    };

    useImperativeHandle(ref, () => ({
      ...(textareaRef.current as HTMLTextAreaElement),
      focus: () => {
        if (textareaRef.current) {
          textareaRef.current?.focus?.();
        }
      },
      resizeHeight: () => {
        if (textareaRef.current) {
          resizeTextareaElement(textareaRef.current);
        }
      }
    }));

    useEffect(() => {
      if (
        textareaRef.current &&
        textareaRef.current.textContent &&
        initialAutoHeight
      ) {
        const element = textareaRef.current;
        resizeTextareaElement(element);
      }
    }, [initialAutoHeight]);

    useEffect(() => {
      const resizer = (e: Event) => {
        if (e.target) {
          const element = e.target as HTMLTextAreaElement;
          resizeTextareaElement(element);
        }
      };

      if (autoHeight) {
        textareaRef.current?.addEventListener("input", resizer);
      }

      return () => textareaRef.current?.removeEventListener("input", resizer);
    }, []);

    return <textarea ref={textareaRef} className={className} {...props} />;
  }
);
