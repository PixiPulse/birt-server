export interface AuthUser {
    id: string;
    name: string;
    roles: string[];
    mobile?: string;
    iat: number;
  }
  