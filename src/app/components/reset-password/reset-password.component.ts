import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { FloatLabel } from 'primeng/floatlabel';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Toast } from 'primeng/toast';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
            FormsModule,
            InputTextModule,
            ButtonModule,
            ReactiveFormsModule,
            FloatLabel,
            IconField,
            InputIcon, Toast
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
  providers : [MessageService]

})
export class ResetPasswordComponent  implements OnInit {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  loading = false;
  submitted: boolean = false;
  errorMessage: string = '';


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private messageService: MessageService
  ) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
      if (!this.email) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Email parameter is missing',
          life: 5000
        });
        this.router.navigate(['/reset-password-request']);
      }
    });
  }

  

  validatePasswords(): boolean {
   
    if (this.password && this.confirmPassword) {
      if (this.password !== this.confirmPassword) {
        this.errorMessage = 'Passwords do not match';
        return false;
      }
      if (this.password.length < 8) {
        this.errorMessage = 'Password must be at least 8 characters long';
        return false;
      }
    }
    else {
      this.errorMessage = 'Passwords do not match';
      return false;
    }
    this.errorMessage = '';
    return true;
  }
 
  onSubmit() {
    this.submitted=true;
    if (!this.validatePasswords()) {
      return;
    }
    this.loading=true;
      
      this.authService.submitNewPassword(this.email, this.password).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Password reset successfully',
            life: 3000
          });
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 1500);
        },
        error: (error) => {
          this.loading = false;
          
          switch (error.status) {
            case 400:
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Email and new password are required or invalid',
                life: 5000
              });
              break;
              
            case 404:
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'User with this email does not exist',
                life: 5000
              });
              break;
              
            case 500:
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Internal server error. Please try again later',
                life: 5000
              });
              break;
              
            default:
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'An unexpected error occurred. Please try again',
                life: 5000
              });
          }
        },
        complete: () => {
          this.loading = false;
        }
      });
     
  }
}
