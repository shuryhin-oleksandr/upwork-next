"use client";

import { analyzeJobs, getAndSaveUpworkJobs } from "@/app/(industry-analysis)/industry-analysis/api";
import IndustryAnalysisTable from "./IndustryAnalysisTable";
import { App, Button, Card, Flex } from "antd";
import { useMutation } from "@tanstack/react-query";

export default function IndustryAnalysis() {
  const { message } = App.useApp();

  const fetchMutation = useMutation({
    mutationFn: getAndSaveUpworkJobs,
    onSuccess: () => {
      message.success("Jobs fetched and saved successfully");
    },
    onError: (error) => {
      message.error(`Failed to fetch jobs: ${error}`);
    },
  });

  const aynalyzeMutation = useMutation({
    mutationFn: analyzeJobs,
    onSuccess: () => {
      message.success("Jobs analyzed successfully");
    },
    onError: (error) => {
      message.error(`Failed to analyze jobs: ${error}`);
    },
  });

  return (
    <>
      <Flex gap={16}>
        <Button
          type="primary"
          loading={fetchMutation.isPending}
          onClick={() => fetchMutation.mutate()}
        >
          Fetch jobs
        </Button>
        <Button
          type="primary"
          loading={aynalyzeMutation.isPending}
          onClick={() => aynalyzeMutation.mutate()}
        >
          Analyze jobs
        </Button>
      </Flex>
      <Card style={{ marginTop: 16 }}>
        <IndustryAnalysisTable />
      </Card>
    </>
  );
}
