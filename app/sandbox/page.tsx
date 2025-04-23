"use client";

import { Card, DatePicker, Form, Layout } from "antd";
import { Content } from "antd/es/layout/layout";

export default function Sandbox() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ padding: "30px", maxWidth: "1200px", margin: "auto", width: "100%" }}>
        <Card>
          <Tmp />
        </Card>
      </Content>
    </Layout>
  );
}

function Tmp() {
  const [form] = Form.useForm();
  const formValues = Form.useWatch([], form);

  return (
    <Form form={form} name="basic" style={{ maxWidth: 600 }}>
      <Form.Item
        label="Date"
        name="date"
        rules={[{ required: true, message: "Please input your date!" }]}
      >
        <DatePicker format={["D MMM YY"]} />
      </Form.Item>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      {<p>Form data: {JSON.stringify(formValues)}</p>}
    </Form>
  );
}
