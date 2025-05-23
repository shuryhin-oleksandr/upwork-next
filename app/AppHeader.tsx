"use client";

import { getProfile, logout } from "@/app/login/api";
import { useAuthStore } from "@/app/login/auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { App, Button, Menu, theme, Typography } from "antd";
import { Header } from "antd/es/layout/layout";
import { AxiosError } from "axios";
import Link from "next/link";
import { usePathname } from "next/navigation";

const { Title, Text } = Typography;
const { useToken } = theme;

const LINKS = [
  { href: "/", label: "Rooms" },
  { href: "/bid-analysis", label: "Bid Analysis" },
];

export default function AppHeader() {
  const { token } = useToken();
  const { message } = App.useApp();
  const isAuthenticated = useAuthStore.use.isAuthenticated();
  const setLoggedOut = useAuthStore.use.setLoggedOut();

  const pathname = usePathname();
  const selectedKey = LINKS.find((link) => link.href === pathname)?.href || "";

  // Used to initialize an access token on a first page load
  const { data } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    enabled: isAuthenticated,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      setLoggedOut();
    },
    onError: (error: AxiosError) => {
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
          gap: "4rem",
        }}
      >
        <Title level={3} style={{ color: token.colorTextLightSolid, margin: 0 }}>
          Upwork CRM
        </Title>
        {isAuthenticated && data?.username && (
          <>
            <Menu
              theme="dark"
              mode="horizontal"
              selectedKeys={[selectedKey]}
              items={LINKS.map(({ label, href }) => ({
                key: href,
                label: <Link href={href}>{label}</Link>,
              }))}
              style={{ flex: 1, minWidth: 0 }}
            />
            <div>
              <Text style={{ color: token.colorTextLightSolid }}>{data.username}</Text>
              <Button type="primary" onClick={handleLogout} style={{ marginLeft: 20 }}>
                Log out
              </Button>
            </div>
          </>
        )}
      </div>
    </Header>
  );
}
