"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@ant-design/v5-patch-for-react-19";
import { App, ConfigProvider, theme } from "antd";
import enGB from "antd/locale/en_GB";
import dayjs from "dayjs";
import "dayjs/locale/en-gb";
dayjs.locale("en-gb");

export default function AntdProvider({ children }: { children: React.ReactNode }) {
  const isDark = false;
  return (
    <AntdRegistry>
      <ConfigProvider
        locale={enGB}
        theme={{
          algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
      >
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
