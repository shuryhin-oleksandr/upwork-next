"use client";

import { getRooms } from "@/app/api";
import { useQuery } from "@tanstack/react-query";
import { Card, Layout, Table, TableProps } from "antd";
import { Content } from "antd/es/layout/layout";

const columns: TableProps["columns"] = [
  {
    title: "Name",
    dataIndex: "roomName",
    key: "roomName",
  },
  {
    title: "Topic",
    dataIndex: "topic",
    key: "topic",
  },
  {
    title: "Action",
    dataIndex: ["meta", "action"],
    key: "action",
  },
];

export default function Home() {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["rooms"],
    queryFn: getRooms,
  });

  const RoomsTable = (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ pageSize: 15 }}
      size="small"
    />
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ padding: "30px", maxWidth: "1200px", margin: "auto", width: "100%" }}>
        <Card>
          {isPending ? (
            <span>Loading...</span>
          ) : isError ? (
            <span>Error: {error.message}</span>
          ) : (
            RoomsTable
          )}
        </Card>
      </Content>
    </Layout>
  );
}
