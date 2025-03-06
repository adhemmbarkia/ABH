import { Component } from '@angular/core';
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
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-password-reset-request',
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
  templateUrl: './password-reset-request.component.html',
  styleUrl: './password-reset-request.component.css',
  providers : [MessageService]
})
export class PasswordResetRequestComponent {
  email: string = '';
  submitted: boolean = false;
  errorMessage: string = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    
  }

  onSubmit() {
    
      this.loading = true;
      this.submitted = true;
    if (!this.email) {
      this.loading = false;
      return;
    }

      this.authService.requestPasswordReset(this.email).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Verification code sent to your email.',
            life: 3000
          });
          setTimeout(() => {
            this.router.navigate(['/auth/verify-code'], { 
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
                detail: 'Email is required.',
                life: 5000
              });
              break;
              
            case 404:
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'User with this email does not exist.',
                life: 5000
              });
              break;
              
            case 500:
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Verification email could not be sent. Please try again later.',
                life: 5000
              });
              break;
              
            default:
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'An unexpected error occurred. Please try again.',
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
