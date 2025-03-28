import { Tag } from "antd";
import React from "react";

export function BantTag({ value }: { value: number }) {
  if (!value) return null;
  const colors = {
    5: "success",
    4: "processing",
    3: "warning",
    2: "error",
    1: "error",
  };
  const color = colors[Math.floor(value) as keyof typeof colors] || 'default';
  return <Tag color={color}>{value}</Tag>;
}

export const MemoizedBantTag = React.memo(BantTag, (prev, next) => prev.value === next.value);
