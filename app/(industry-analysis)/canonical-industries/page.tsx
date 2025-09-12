"use client";

import { getCanonicalIndustries } from "@/app/(industry-analysis)/api";
import { useQuery } from "@tanstack/react-query";
import { Card } from "antd";
import Link from "next/link";

interface CanonicalIndustry {
  id: string;
  name: string;
  aliases: string[];
  jobCount: number;
}

export default function CanonicalIndustries() {
  const { data: canonicalIndustries = [] } = useQuery<CanonicalIndustry[]>({
    queryKey: ["canonical-industries"],
    queryFn: getCanonicalIndustries,
  });

  return (
    <Card style={{ marginTop: 16 }}>
      {canonicalIndustries
        .sort((a, b) => b.jobCount - a.jobCount)
        .map((canonicalIndustry) => (
          <div key={canonicalIndustry.id} style={{ marginBottom: 8 }}>
            <Link href={`/industry-analysis?canonicalIndustryId=${canonicalIndustry.id}`}>
              <strong>
                {canonicalIndustry.jobCount} - {canonicalIndustry.name}:
              </strong>
            </Link>
            {canonicalIndustry.aliases.join(", ")}
          </div>
        ))}
    </Card>
  );
}
