"use client";

import { logout } from "@/app/login/api";
import { useIsAuthenticated, useResetAccessToken } from "@/app/login/auth";
import { useMutation } from "@tanstack/react-query";
import { App, Button, theme, Typography } from "antd";
import { Header } from "antd/es/layout/layout";

const { Title } = Typography;
const { useToken } = theme;

export default function AppHeader() {
  const { token } = useToken();
  const { message } = App.useApp();
  // TODO: Rationalise isAuthenticated lifecycle
  const isAuthenticated = useIsAuthenticated();
  const resetAccessToken = useResetAccessToken();

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // TODO: Rename to login()?
      resetAccessToken();
    },
    onError: (error) => {
      // TODO: Fix error message
      message.error("Logout error: " + error.message);
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
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
        {isAuthenticated && (
          <Button type="primary" onClick={handleLogout}>
            Log out
          </Button>
        )}
      </div>
    </Header>
  );
}
