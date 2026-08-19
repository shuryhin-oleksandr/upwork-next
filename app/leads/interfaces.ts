export interface Lead {
  id: string;
  roomName: string;
  createdAtDateTime: string;
  hidden: boolean;
  roomType: string;
  meta: {
    id: string;
    lossReason?: string;
  };
}
