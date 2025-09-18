export interface Lead {
  id: string;
  roomName: string;
  meta: {
    lossReason: string | null;
  };
}
