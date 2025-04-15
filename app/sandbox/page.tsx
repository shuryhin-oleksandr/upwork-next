"use client";

import { Button, Card, DatePicker, Form, FormProps, Input, Layout } from "antd";
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

type FieldType = {
  inputDate?: string;
  pickerDate?: string;
};

const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
  console.log("Success:", values);
};

const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
  console.log("Failed:", errorInfo);
};

function Tmp() {
  return (
    <Form
      name="basic"
      style={{ maxWidth: 600 }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <Form.Item<FieldType>
        label="Input Date"
        name="inputDate"
        rules={[{ required: true, message: "Please input your date!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item<FieldType>
        label="Picker Date"
        name="pickerDate"
        rules={[{ required: true, message: "Please input your date!" }]}
      >
        <DatePicker format="D MMM YY" />
      </Form.Item>

      <Form.Item label={null}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}