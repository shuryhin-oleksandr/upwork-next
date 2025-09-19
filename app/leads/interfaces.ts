export interface Lead {
  id: string;
  roomName: string;
  createdAtDateTime: string;
  hidden: boolean;
  meta: {
    id: string;
    lossReason?: string;
  };
}
