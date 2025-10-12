import React from "react";
import { GoogleGenAI } from "@google/genai";

type Props = {};

function Page({}: Props) {
  async function main() {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    const tools = [
      {
        googleSearch: {},
      },
    ];
    const config = {
      thinkingConfig: {
        thinkingBudget: -1,
      },
      tools,
      responseMimeType: "text/plain",
    };
    const model = "gemini-2.5-pro";
    const contents = [
      {
        role: "user",
        parts: [
          {
            text: `Ob havoni topib beradigan telegram bot yozib ber`,
          },
        ],
      },
    ];

    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });
    let fileIndex = 0;
    for await (const chunk of response) {
      console.log(chunk.text);
    }
  }

  return <div>Page</div>;
}

export default Page;
