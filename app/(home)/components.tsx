import { Tag } from "antd";
import TypographyText from "antd/es/typography/Text";
import dayjs from "dayjs";
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
  const color = colors[Math.floor(value) as keyof typeof colors] || "default";
  return (
    <Tag color={color} style={{ marginRight: 0 }}>
      {value}
    </Tag>
  );
}

export const MemoizedBantTag = React.memo(BantTag, (prev, next) => prev.value === next.value);

export function FollowUpDate({
  date,
  followUpIndicator,
}: {
  date: dayjs.Dayjs;
  followUpIndicator: string;
}) {
  const isOverdueOrToday = !date.isAfter(dayjs(), "day");

  return (
    <TypographyText type={isOverdueOrToday ? "danger" : undefined}>
      {date.format("D MMM YY")}
      {followUpIndicator && <span>{followUpIndicator}</span>}
    </TypographyText>
  );
}
