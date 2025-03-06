import { HttpErrorResponse, HttpHandler, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';



  export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
   const authToken = authService.getAccessToken();
  // const authReq = req.clone({
  //   setHeaders: {
  //     Authorization: `Bearer ${authToken}`
  //   }
  // });

  if (authToken) {
    req = addToken(req, authToken);
  }
  //return next(authReq);

  return next(req).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        console.log(error)
        //authService.logout();
        return handle401Error(req, next, authService);
      }
      return throwError(() => error);
    })
  );
  
};




 

//  function  handle401Error(request: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService) {
//   //const authService2 = inject(AuthService);
//   console.log("handle401Error");
//     // return authService.refreshToken().pipe(
//     //   switchMap(response => {
//     //     return next(addToken(request, response.access));
//     //   })
//     // );
//     return authService.refreshToken().pipe(
//       switchMap(response => {
//         console.log("Token refreshed:", response.access);
//        // authService.setAccessToken(response.access); // Save the new token
//         return next(addToken(request, response.access));
//       }),
//       catchError(error => {
//         console.log("Refresh token failed", error);
//         authService.logout(); // Clear session and redirect
//         return throwError(() => error);
//       })
//     );
//   }

  function handle401Error(request: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService) {
    return authService.refreshToken().pipe(
      switchMap((response) => {
        if (!response) {
          // If refreshToken() returns no response (i.e., no refresh token found)
          return throwError(() => new Error('No refresh token available'));
        }
        return next(addToken(request, response.access));
      }),
      catchError((error) => {
        console.error('Token refresh failed:', error);
        authService.logout();
        
        // Navigate to login page after logout
        const router = inject(Router);
        router.navigate(['/auth/login'], {
          queryParams: { 
            returnUrl: router.url 
          }
        });
  
        return throwError(() => new Error('Session expired. Please login again.'));
      })
    );
  }
  
  // Helper function to add token to request
  function addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }



  // export function addToken(request: HttpRequest<any>, token: string) {
  //   return request.clone({
  //     setHeaders: {
  //       Authorization: `Bearer ${token}`
  //     }
  //   });
  // }
