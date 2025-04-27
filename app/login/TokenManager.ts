interface JwtResponse {
  accessToken: string;
  refreshToken: string;
}

export class TokenManager {
  static accessToken: string | null = null;
  private static readonly REFRESH_TOKEN_KEY = "refreshToken";
  
  static setTokens({ accessToken, refreshToken }: JwtResponse) {
    this.accessToken = accessToken;
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  static removeTokens() {
    this.accessToken = null;
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static getAccessToken() {
    return this.accessToken;
  }

  static getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }
}
