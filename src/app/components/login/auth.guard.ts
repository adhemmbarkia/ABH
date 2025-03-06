import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = ( state) => {

  const  authService  =  inject(AuthService);
  const  router  =  inject(Router);
  if (authService.isLoggedIn()) {
    return true;
  }
  router.navigate(['/auth/login'], { 
    queryParams: { 
      returnUrl: state.url 
    }
  });
  return false;

  

}