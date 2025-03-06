import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { AuthResponse, LoginRequest } from '../models/auth.model';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //constructor() { }
  private httpClient = inject(HttpClient);
  private API_URL = `${environment.apiUrl}/authentication`;

  private platformId = inject(PLATFORM_ID);

  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();


  private isAuthenticated = new BehaviorSubject<boolean>(false);

  constructor(private router: Router) {
    this.checkToken();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${this.API_URL}/login/`, { email, password })
      .pipe(
        tap(response => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('access_token', response.access);
            localStorage.setItem('refresh_token', response.refresh);
          }
          // localStorage.setItem('access_token', response.access);
          // localStorage.setItem('refresh_token', response.refresh);
          this.isAuthenticated.next(true);
          const user = {
            id: response.user_id,
            email: response.email,
            role: response.role,
            username: response.username
          };
          
          // Save user data in localStorage
          localStorage.setItem('user_data', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }),
        catchError(error => throwError(() => error))
      );
  }

  // refreshToken() {
  //   const refresh = localStorage.getItem('refresh_token');
  //   if (!refresh) {
  //     return this.logout();
  //   }
  //   console.log(`Refreshing token: ${refresh}`);
  //   return this.httpClient.post<AuthResponse>(`${this.API_URL}/token/refresh/`, { refresh })
  //     .pipe(
  //       tap(response => {
  //         localStorage.setItem('access_token', response.access);
  //       })
  //     );
  // }

  refreshToken(): Observable<AuthResponse> {
    const refresh = localStorage.getItem('refresh_token');
    
    if (!refresh) {
      return throwError(() => new Error('No refresh token found'));
    }
  
    return this.httpClient.post<AuthResponse>(`${this.API_URL}/token/refresh/`, { refresh })
      .pipe(
        tap(response => {
          localStorage.setItem('access_token', response.access);
        }),
        catchError(error => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          return throwError(() => error);
        })
      );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    this.isAuthenticated.next(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login'])
  }

  private checkToken() {
    if (isPlatformBrowser(this.platformId)){
      const token = localStorage.getItem('access_token');
    this.isAuthenticated.next(!!token);
    }
    
  }

  getAccessToken(){
    return localStorage.getItem('access_token');
  }

  // isLoggedIn(): Observable<boolean> {
  //   return this.isAuthenticated.asObservable();
  // }

  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    if (!token) {
      return false;
    }

    // try {
    //   const isExpired = this.jwtHelper.isTokenExpired(token);
    //   if (isExpired) {
    //     localStorage.removeItem('token');
    //   }
    //   return !isExpired;
    // } catch {
    //   return false;
    // }
    return true;
  }

  getUser() {
   // return this.currentUserSubject.asObservable();
   const user = localStorage.getItem('user_data') ? JSON.parse(localStorage.getItem('user_data')!) : null;
   
    return user;

  }
  updateUsername(newUsername: string) {
    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        user.username = newUsername;
        
        // Update localStorage
        localStorage.setItem('user_data', JSON.stringify(user));
        
        // Update BehaviorSubject
        this.currentUserSubject.next(user);
      }
    }
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.httpClient.post(`${this.API_URL}/password-reset-request/`, { email });
  }

  verifyResetCode(email: string, code: string): Observable<any> {
    return this.httpClient.post(`${this.API_URL}/password-reset-verify/`, {
      email,
      verification_code: code
    });
  }

  submitNewPassword(email: string, new_password: string): Observable<any> {
    return this.httpClient.post(`${this.API_URL}/password-reset-submit/`, {
      email:email,
      new_password: new_password
    });
  }
  
updateUser(username:string):Observable<any>{
  return this.httpClient.patch(`${environment.apiUrl}/administrator/profile/`,{username})
}

updatePassword(password:string):Observable<any>{
  return this.httpClient.patch(`${environment.apiUrl}/administrator/profile/`,{password})
}

authToken(username:string, password:string):Observable<any>{
  return this.httpClient.post(`${environment.apiUrl}/api-token-auth/`,{username,password})
}
  
}