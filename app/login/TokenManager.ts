import { queryClient } from "@/app/lib/ReactQueryClientProvider";
import { emitter, REDIRECT_TO_LOGIN } from "@/app/login/events";

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

  private static removeTokens() {
    this.accessToken = null;
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static getAccessToken() {
    return this.accessToken;
  }

  static getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static login(data: JwtResponse) {
      this.setTokens(data);
      queryClient.cancelQueries();
      queryClient.clear();
  }

  static logout() {
    this.removeTokens();
    queryClient.cancelQueries();
    queryClient.clear();
    // TODO: Rationalize if it should be here
    emitter.emit(REDIRECT_TO_LOGIN);
  }
}
