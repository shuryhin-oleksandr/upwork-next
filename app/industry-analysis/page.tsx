"use client";

import { analyzeJobs, getAndSaveUpworkJobs } from "@/app/industry-analysis/api";
import IndustryAnalysisTable from "./IndustryAnalysisTable";
import { App, Button, Card, Flex } from "antd";
import { useMutation } from "@tanstack/react-query";

export default function IndustryAnalysis() {
  const { message } = App.useApp();

  const fetchJobsMutation = useMutation({
    mutationFn: getAndSaveUpworkJobs,
    onSuccess: () => {
      message.success("Jobs fetched and saved successfully");
    },
    onError: (error) => {
      message.error(`Failed to fetch jobs: ${error}`);
    },
  });
  return (
    <>
      <Flex gap={16}>
        <Button
          type="primary"
          loading={fetchJobsMutation.isPending}
          onClick={() => fetchJobsMutation.mutate()}
        >
          Fetch jobs
        </Button>
        <Button
          type="primary"
          onClick={async () => {
            await analyzeJobs();
            message.success("Jobs analyzed successfully");
          }}
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
