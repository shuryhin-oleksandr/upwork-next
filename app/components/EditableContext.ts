import type { GetRef } from "antd";
import { Form } from "antd";
import React from "react";

type FormInstance<T> = GetRef<typeof Form<T>>;

export const EditableContext = React.createContext<FormInstance<any> | null>(null);
