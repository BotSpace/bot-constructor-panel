"use client";

import React from "react";
import dynamic from "next/dynamic";

const DynamicPythonEditor = dynamic(() => import("./mono-editor"), {
  ssr: false,
  loading: () => <p>Editorni yuklash...</p>,
});

// Aiogram uchun boshlang'ich kod
const initialCode = `await message.answer(f"Salom, {message.from_user.full_name}!")`;

type EditorControllerProps = {
  initialCode: string;
  onCodeChange: (code: string) => void;
};

export default function EditorController({
  initialCode,
  onCodeChange,
}: EditorControllerProps) {
  const defString = [
    {
      text: "async def",
      color: "text-[#518DC7]",
    },
    {
      text: " myCustomFunction",
      color: "text-white",
    },
    {
      text: "(",
      color: "text-[#ffd700]",
    },
    {
      text: "message:",
      color: "text-white",
    },
    {
      text: " types.Message",
      color: "text-[#518DC7]",
    },

    {
      text: ")",
      color: "text-[#ffd700]",
    },
  ];

  return (
    <div
      style={{
        border: "1px solid #333",
        marginTop: "20px",
        borderRadius: "8px",
        overflow: "hidden",
        background: "#1E1E1E",
      }}
    >
      <div className="pl-[75px]">
        {defString.map((item, index) => (
          <span key={index} className={`${item.color} editorText`}>
            {item.text}
          </span>
        ))}
      </div>
      <DynamicPythonEditor
        initialCode={initialCode}
        onCodeChange={onCodeChange}
      />
    </div>
  );
}
