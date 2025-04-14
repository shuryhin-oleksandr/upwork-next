"use client";

import { Button, Card, DatePicker } from "antd";
import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";

export default function Sandbox() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ padding: "30px", maxWidth: "1200px", margin: "auto", width: "100%" }}>
        <Card>
          <DatePicker />
          <br />
          <br />
          <Button>Save</Button>
        </Card>
      </Content>
    </Layout>
  );
}

