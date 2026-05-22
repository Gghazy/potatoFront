export interface Season {
  id: number;
  name: string;
  notes: string | null;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateSeasonRequest {
  name: string;
  notes: string | null;
}

export interface UpdateSeasonRequest {
  id: number;
  name: string;
  notes: string | null;
}
