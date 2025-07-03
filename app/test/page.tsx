import { ButtonGenerator } from "@/constructor/components/ButtonGenerator/ButtonGenerator";
import React from "react";

type Props = {};

export default function Page({}: Props) {
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <ButtonGenerator />
    </div>
  );
}
