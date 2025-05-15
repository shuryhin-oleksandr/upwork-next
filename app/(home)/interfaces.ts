import { NamePath } from "antd/es/form/interface";
import React from "react";
import { Dayjs } from "dayjs";

export interface Room {
  id: string;
  roomName: string;
  topic: string;
  url: string;
  jobUrl: string;
  //  TODO: Rationalise
  nextFollowUpNumber: number;
  nextFollowUpDate: string;
  followUpDateType: string | boolean | null;
  isContract: boolean;
  meta: RoomMeta;
}

export interface RoomMeta {
  _id: string;
  roomId: string;
  comment: string;
  bant?: number;
  nextFollowUpDateCustom?: Dayjs;
  nextFollowUpDateCustomUpdatedAt?: string;
}

export interface CreateRoomMetaDto {
  roomId: string;
  comment: string;
  bant?: number;
  nextFollowUpDateCustom?: Dayjs;
  nextFollowUpDateCustomUpdatedAt?: string;
}

export interface UpdateRoomMetaDto {
  _id: string;
  // TODO: roomId
  comment: string;
  bant?: number;
  nextFollowUpDateCustom?: Dayjs;
  nextFollowUpDateCustomUpdatedAt?: string;
}

export interface EditableRowProps {
  index: number;
}

export interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  dataIndex: NamePath<Room>;
  record: Room;
  handleSave: (record: Room) => void;
  editableType?: "text" | "number" | "date";
}
