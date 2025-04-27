"use client";

import { getProfile, login, LoginDto } from "@/app/login/api";
import { AuthManager } from "@/app/login/AuthManager";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Alert, Button, Card, Form, Input } from "antd";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Login() {
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();

  const { isSuccess } = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  useEffect(() => {
    if (isSuccess) router.push("/");
  }, [isSuccess, router]);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // TODO: Rationalize orthogonality
      AuthManager.login(data);

      setFormError(null);
    },
    // TODO: Error handling DRY
    onError: (error: AxiosError<{ message: string }>) => {
      setFormError(error?.response?.data.message || error.message);
    },
  });

  const onSubmit = (values: LoginDto) => {
    loginMutation.mutate(values);
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card title="Log in" style={{ width: "100%", maxWidth: 400 }}>
        <Form name="login" onFinish={onSubmit}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please input your Username!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your Password!" }]}
          >
            <Input prefix={<LockOutlined />} type="password" placeholder="Password" />
          </Form.Item>
          {formError && (
            <Form.Item>
              <Alert type="error" message={formError} showIcon />
            </Form.Item>
          )}

          <Form.Item>
            <Button block type="primary" htmlType="submit">
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
