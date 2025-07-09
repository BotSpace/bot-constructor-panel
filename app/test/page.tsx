"use client";

import React from "react";
import ReactFlow, { MiniMap, Controls, Background } from "reactflow";

// CSS faylini ulashni unutmang
import "reactflow/dist/style.css";

// 1. Tugunlarni (Bloklarni) aniqlash
const initialNodes = [
  {
    id: "1",
    data: { label: "Process (Yuqoridagi)" },
    position: { x: 100, y: 50 },
    style: {
      background: "#90caf9",
      color: "#000",
      borderRadius: "15px",
      width: 200,
      height: 100,
    },
  },
  {
    id: "2",
    data: { label: "Process (Pastdagi)" },
    position: { x: 100, y: 250 },
    style: {
      background: "#90caf9",
      color: "#000",
      borderRadius: "15px",
      width: 200,
      height: 100,
    },
  },
];

// 2. Chiziqni (Strelkani) aniqlash
const initialEdges = [
  {
    id: "e2-1",
    source: "2", // Pastdagi blokdan (id: '2')
    target: "1", // Yuqoridagi blokka (id: '1')

    // MUHIM: Chiziq turini belgilash
    type: "smoothstep", // yoki 'step' ni sinab ko'ring

    // MUHIM: Strelka uchini qo'shish
    markerEnd: {
      type: "arrowclosed",
    },

    // Chiziq qayerdan chiqib, qayerga kirishini aniqlash (ixtiyoriy, lekin aylanma yo'l uchun kerak)
    sourceHandle: "top", // 2-blokning yuqorisidan chiqsin
    targetHandle: "top", // 1-blokning yuqorisiga kirsin
  },
];

function FlowDiagram() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow nodes={initialNodes} edges={initialEdges} fitView>
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default FlowDiagram;
