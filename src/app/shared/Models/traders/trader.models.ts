export interface Trader {
  id: number;
  name: string;
  phoneNumber: string | null;
  createdAt: string;
}

export interface CreateTraderRequest {
  name: string;
  phoneNumber: string | null;
}

export interface UpdateTraderRequest extends CreateTraderRequest {
  id: number;
}

export const EGYPT_PHONE_REGEX = /^01[0125][0-9]{8}$/;
