export interface Farmer {
  id: number;
  name: string;
  phoneNumber: string | null;
  createdAt: string;
}

export interface CreateFarmerRequest {
  name: string;
  phoneNumber: string | null;
}

export interface UpdateFarmerRequest extends CreateFarmerRequest {
  id: number;
}

export const EGYPT_PHONE_REGEX = /^01[0125][0-9]{8}$/;
