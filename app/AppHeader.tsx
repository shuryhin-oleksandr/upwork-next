"use client";

import { useIsAuthenticated, useResetTokens } from "@/app/login/auth";
import { Button, theme, Typography } from "antd";
import { Header } from "antd/es/layout/layout";

const { Title } = Typography;
const { useToken } = theme;

export default function AppHeader() {
  const { token } = useToken();
  const isAuthenticated = useIsAuthenticated();
  const resetTokens = useResetTokens();

  const handleLogout = () => resetTokens();

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
        {isAuthenticated && (
          <Button type="primary" onClick={handleLogout}>
            Log out
          </Button>
        )}
      </div>
    </Header>
  );
}
