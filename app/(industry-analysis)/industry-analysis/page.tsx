"use client";

import { getCanonicalIndustries } from "@/app/(industry-analysis)/api";
import { analyzeJobs, getAndSaveUpworkJobs } from "@/app/(industry-analysis)/industry-analysis/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { App, AutoComplete, Button, Card, Flex } from "antd";
import IndustryAnalysisTable from "./IndustryAnalysisTable";

interface CanonicalIndustry {
  id: string;
  name: string;
}

export default function IndustryAnalysis() {
  const { message } = App.useApp();

  const { data: canonicalIndustries } = useQuery<CanonicalIndustry[]>({
    queryKey: ["canonicalIndustries"],
    queryFn: getCanonicalIndustries,
  });
  const canonicalIndustriesOptions =
    canonicalIndustries?.map((industry) => ({
      label: industry.name,
      value: industry.id,
    })) || [];

  const fetchMutation = useMutation({
    mutationFn: getAndSaveUpworkJobs,
    onSuccess: () => {
      message.success("Jobs fetched and saved successfully");
    },
    onError: (error) => {
      message.error(`Failed to fetch jobs: ${error}`);
    },
  });

  const analyzeMutation = useMutation({
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
          loading={analyzeMutation.isPending}
          onClick={() => analyzeMutation.mutate()}
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
