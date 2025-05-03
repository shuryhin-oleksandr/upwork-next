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

  // [Auth] Interceptor does not know if that is the first request,
  // and should not know due to beeing orthogonal.
  const [isFirstProfileRequest, setIsFirstProfileRequest] = useState(true);
  const { isSuccess, isError } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    enabled: isFirstProfileRequest,
  });
  useEffect(() => {
    if (isSuccess) router.push("/");
    if (isError) setIsFirstProfileRequest(false);
  }, [isSuccess, isError, router]);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      AuthManager.login(data);
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
