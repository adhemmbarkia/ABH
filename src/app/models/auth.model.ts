export interface AuthResponse {
    message: string;
    user_id: string;
    email: string;
    role: string;
    username: string;
    refresh: string;
    access: string;
  }
  
  export interface LoginRequest {
    email: string;
    password: string;
  }