import { TextareaHTMLAttributes } from "react";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  isInvalid?: boolean;
  autoHeight?: boolean;
  /**
   * textarea 의 height: auto 의 최소 높이가 46 이 되기 때문에
   * minHeight 가 46 이하라면 해당 옵션을 사용해야 합니다.
   */
  isMinHeight46?: boolean;

  /**
   * 초기 렌더링시 textArea 의 높이를 자동으로 조절합니다.
   */
  initialAutoHeight?: boolean;

  /**
   * border 와 outline 을 없애기 위해 사용합니다.
   */
  noBorder?: boolean;
}

export type TextareaImperativeHandleRef = HTMLTextAreaElement & {
  resizeHeight: () => void;
};
