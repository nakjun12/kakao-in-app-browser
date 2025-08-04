import { TextareaHTMLAttributes } from "react";

export const Textarea = ({
  value,
  onChange,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  return (
    <textarea
      className="input-field"
      rows={3.5}
      value={value}
      onChange={onChange}
      {...props}
    />
  );
};
