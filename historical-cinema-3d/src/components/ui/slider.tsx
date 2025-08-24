import * as React from "react";

type Props = {
  value: [number];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (v: [number]) => void;
  className?: string;
};

export function Slider({ value, min = 0, max = 100, step = 1, onValueChange, className = "" }: Props) {
  return (
    <input
      type="range"
      className={`w-full cursor-pointer accent-white ${className}`}
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={(e) => onValueChange?.([Number(e.target.value)])}
    />
  );
}
