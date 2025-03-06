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
  selector: 'app-verify-code',
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
  templateUrl: './verify-code.component.html',
  styleUrl: './verify-code.component.css',
  providers : [MessageService]

})
export class VerifyCodeComponent implements OnInit  {
  
  email: string = '';
  code: string = '';
  submitted: boolean = false;
  errorMessage: string = '';
  loading = false;
  isResending = false;

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

  onSubmit() {
    this.loading = true;
    this.submitted = true;
    if (!this.code) {
      this.loading = false;
      return;
    }
    

    this.authService.verifyResetCode(this.email, this.code).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Verification code is valid',
          life: 3000
        });
        setTimeout(() => {
          this.router.navigate(['/auth/reset-password'], { 
            queryParams: { email: this.email }
          });
        }, 1000);
      },
      error: (error) => {
        this.loading = false;
        
        switch (error.status) {
          case 400:
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Email and verification code are required',
              life: 5000
            });
            break;
            
          case 404:
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Verification code has expired or does not exist',
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
  
  resendCode() {
    this.isResending = true;
    this.authService.requestPasswordReset(this.email).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'New verification code sent to your email',
          life: 3000
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to resend verification code. Please try again',
          life: 5000
        });
      },
      complete: () => {
        this.isResending = false;
      }
    });
  }

}
