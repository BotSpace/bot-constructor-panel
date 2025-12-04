"use client";

import React from "react";
import Countdown from "react-countdown";

type Props = {
  completed_component: React.ReactNode;
  onComplete: () => void;
  date: Date;
};

function CoundDownButton({ completed_component, date, onComplete }: Props) {
  // Renderer callback with condition
  const renderer = ({
    hours,
    minutes,
    seconds,
    completed,
  }: {
    hours: number;
    minutes: number;
    seconds: number;
    completed: boolean;
  }) => {
    if (completed) {
      // Render a completed state
      return completed_component;
    } else {
      // Render a countdown
      return (
        <>
          {hours}:{minutes}:{seconds}
        </>
      );
    }
  };

  return (
    <>
      <Countdown onComplete={onComplete} date={date} renderer={renderer} />
    </>
  );
}

export default CoundDownButton;
