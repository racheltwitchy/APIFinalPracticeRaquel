export interface Notification {
    id?: number;
    userId: number;
    message: string;
    type: "appointment" | "medical_record";
    timestamp?: string;
  }
  