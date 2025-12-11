import React from "react";
import TextareaAutosize from "react-textarea-autosize";

type Props = {
  onChange: (value: string) => void;
  defaultValue?: string;
  placeholder?: string;
};

function TextArea({ onChange, defaultValue, placeholder }: Props) {
  return (
    <TextareaAutosize
      className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      placeholder={placeholder}
      value={defaultValue || ""}
      onChange={(e) => onChange(e.target.value)}
      maxLength={1024}
    />
  );
}

export default TextArea;
