"use client";

import { getRooms } from "@/app/api";
import { Room } from "@/app/interfaces";
import { useQuery } from "@tanstack/react-query";
import { Layout, Table, TableProps, theme } from "antd";
import { Content } from "antd/es/layout/layout";

const columns: TableProps<Room>["columns"] = [
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
];

export default function Home() {
  const { isPending, isError, data, error } = useQuery<Room[]>({
    queryKey: ["rooms"],
    queryFn: getRooms,
  });

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const RoomsTable = <Table columns={columns} dataSource={data} pagination={{ pageSize: 20 }} size="small" />;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ padding: "30px", maxWidth: "1200px", margin: "auto", width: "100%" }}>
        <div
          style={{
            background: colorBgContainer,
            minHeight: 280,
            padding: 24,
            borderRadius: borderRadiusLG,
          }}
        >
          {isPending ? (
            <span>Loading...</span>
          ) : isError ? (
            <span>Error: {error.message}</span>
          ) : (
            RoomsTable
          )}
        </div>
      </Content>
    </Layout>
  );
}
