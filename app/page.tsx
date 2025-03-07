"use client";

import { useQuery } from "@tanstack/react-query";
import { Layout, theme } from "antd";
import { Content } from "antd/es/layout/layout";
import axios from "axios";

const getRooms = async () => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/upwork/rooms`;
  const response = await axios.get(url);
  return response.data;
};

interface Room {
  id: string;
}

export default function Home() {
  const { isPending, isError, data, error } = useQuery<Room[]>({
    queryKey: ["rooms"],
    queryFn: getRooms,
  });

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ padding: "48px", maxWidth: "1200px", margin: "auto", width: "100%" }}>
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
            data.map((room) => (
              <div style={{ marginBottom: "1rem" }} key={room.id}>
                {JSON.stringify(room)}
              </div>
            ))
          )}
        </div>
      </Content>
    </Layout>
  );
}
