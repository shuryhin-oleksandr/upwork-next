export interface Lead {
  id: string;
  roomName: string;
  createdAtDateTime: string;
  hidden: boolean;
  meta: {
    lossReason: string | null;
  };
}
