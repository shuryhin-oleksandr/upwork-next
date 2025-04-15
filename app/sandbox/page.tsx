"use client";

import { useMutation } from "@tanstack/react-query";
import { Button, Card, DatePicker, Form, FormProps, Input, Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

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
};

const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
  console.log("Failed:", errorInfo);
};

function Tmp() {
  const [sentValues, setSentValues] = useState<FieldType | null>(null);
  const [form] = Form.useForm();
  const [displayValue, setDisplayValue] = useState("");

  const { mutate, error, data } = useMutation({
    mutationFn: async (values: FieldType) => {
      setSentValues(values);
      const response = await fetch("http://localhost:3001/upwork/sandbox", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      return response.json();
    },
  });

  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    console.log("Submitting:", values);
    mutate(values);
  };

  return (
    <Form
      form={form}
      onValuesChange={() => console.log("Form:", form.getFieldsValue())}
      name="basic"
      style={{ maxWidth: 600 }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <Form.Item<FieldType>
        label="Input Date"
        name="inputDate"
        rules={[{ required: true, message: "Please input your date!" }]}
        normalize={(value) => value + "AAA"}
        getValueProps={() => ({
          value: displayValue,
        })}
      >
        <Input onChange={(e) => setDisplayValue(e.target.value)} />
      </Form.Item>

      <Form.Item label={null}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>

      {data && <p>Form data: {JSON.stringify(data)}</p>}
      {error && <p>Error: {error.message}</p>}
      {data && <br />}
      {sentValues && <p>Sent Values: {JSON.stringify(sentValues)}</p>}
    </Form>
  );
}
