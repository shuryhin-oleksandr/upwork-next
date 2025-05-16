"use client";

import { getBidStatistics } from "@/app/bid-analysis/api";
import { useQuery } from "@tanstack/react-query";

export default function BidAnalysis() {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ["bid-statistics"],
    queryFn: getBidStatistics,
  });

  return <div>{JSON.stringify(jobs)}</div>;
}
