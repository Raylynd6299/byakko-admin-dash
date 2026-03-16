export interface AdminTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AdminProfile {
  email: string;
}

export interface AdminLoginInput {
  email: string;
  password: string;
}
