"use client";

import { getProfile } from "@/app/login/api";
import { emitter, REDIRECT_TO_LOGIN } from "@/app/login/events";
import { TokenManager } from "@/app/login/TokenManager";
import { useQuery } from "@tanstack/react-query";
import { Button, theme, Typography } from "antd";
import { Header } from "antd/es/layout/layout";

const { Title } = Typography;
const { useToken } = theme;

export default function AppHeader() {
  const { token } = useToken();

  const { isSuccess: isUserAuthenticated } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  // TODO: Rationalize orthogonality
  const handleLogout = () => {
    emitter.emit(REDIRECT_TO_LOGIN);
    TokenManager.removeTokens();
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
        {isUserAuthenticated && (
          <Button type="primary" onClick={handleLogout}>
            Log out
          </Button>
        )}
      </div>
    </Header>
  );
}
