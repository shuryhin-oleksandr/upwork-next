"use client";

import { Layout, theme } from "antd";
import { Content } from "antd/es/layout/layout";

export default function Home() {
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
          Content
        </div>
      </Content>
    </Layout>
  );
}
