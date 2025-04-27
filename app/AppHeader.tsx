"use client";

import { getProfile } from "@/app/login/api";
import { TokenManager } from "@/app/login/TokenManager";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, theme, Typography } from "antd";
import { Header } from "antd/es/layout/layout";
import { useRouter } from "next/navigation";

const { Title } = Typography;
const { useToken } = theme;

export default function AppHeader() {
  const router = useRouter();
  const { token } = useToken();
  const queryClient = useQueryClient();

  const { isSuccess } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const handleLogout = () => {
    queryClient.cancelQueries();
    queryClient.clear();
    TokenManager.removeTokens();
    router.push("/login");
  };

  return (
    <Header style={{ padding: 0 }}>
      <div
        style={{
          maxWidth: "1200px",
          width: "100%",
          margin: "auto",
          padding: "0 30px",
          display: "flex",
          height: "100%",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Title level={3} style={{ color: token.colorTextLightSolid, margin: 0 }}>
          Upwork CRM
        </Title>
        {isSuccess && (
          <Button type="primary" onClick={handleLogout}>
            Log out
          </Button>
        )}
      </div>
    </Header>
  );
}
