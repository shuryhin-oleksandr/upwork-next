import React from "react";

export interface Room {
  id: React.Key;
  roomName: string;
  topic: string;
  meta: RoomMeta;
}

export interface UpdateRoomMetaDto {
  action: string;
}

export interface RoomMeta {
  _id: string;
  action: string;
}
export interface EditableRowProps {
  index: number;
}
export interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  dataIndex: keyof Room;
  record: Room;
  handleSave: (record: Room) => void;
}
