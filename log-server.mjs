// FAYL: log-server.mjs

import { WebSocketServer } from "ws";

const WSS_PORT = 8080;
const wss = new WebSocketServer({ port: WSS_PORT });

// Barcha ulangan frontend klientlarini saqlash uchun
const clients = new Set();

console.log(`[Log Server] WebSocket serveri ${WSS_PORT}-portda ishga tushdi.`);

wss.on("connection", (ws) => {
  console.log("[Log Server] Yangi klient ulandi.");
  clients.add(ws);

  ws.on("message", (message) => {
    // Backenddan kelgan log xabarini barcha ulangan klientlarga yuboramiz
    clients.forEach((client) => {
      if (client.readyState === ws.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on("close", () => {
    console.log("[Log Server] Klient uzildi.");
    clients.delete(ws);
  });

  ws.on("error", (error) => {
    console.error("[Log Server] Xatolik:", error);
    clients.delete(ws);
  });
});
