export interface IJwtPayload {
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface IAccessToken {
  access_token: string;
}
