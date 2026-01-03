const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "GET",
  headers: {
    Authorization: `Bearer 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`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful assistant" },
      { role: "user", content: "Salom, ChatGPT API qanday ishlaydi?" },
    ],
  }),
});

const data = await response.json();
console.log(data);
console.log(data.choices[0].message.content);
