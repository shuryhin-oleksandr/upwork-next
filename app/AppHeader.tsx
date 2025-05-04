"use client";

import { getProfile, logout } from "@/app/login/api";
import { useIsAuthenticated, useResetAccessToken } from "@/app/login/auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { App, Button, theme, Typography } from "antd";
import { Header } from "antd/es/layout/layout";

const { Title, Text } = Typography;
const { useToken } = theme;

export default function AppHeader() {
  const { token } = useToken();
  const { message } = App.useApp();
  // TODO: Rationalise isAuthenticated lifecycle
  const isAuthenticated = useIsAuthenticated();
  const resetAccessToken = useResetAccessToken();

  // Used to initialize an access token on a first page load
  const { data } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

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
        {isAuthenticated && data?.username && (
          <div>
            <Text style={{ color: token.colorTextLightSolid }}>
              {data.username}
            </Text>
            <Button type="primary" onClick={handleLogout} style={{ marginLeft: 20 }}>
              Log out
            </Button>
          </div>
        )}
      </div>
    </Header>
  );
}
