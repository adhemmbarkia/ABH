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
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    ReactiveFormsModule,
    FloatLabel,
    IconField,
    InputIcon,
    Toast
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  providers: [MessageService]
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  // isMobile() {
  //   return window.innerWidth <= 768;
  // }
  submitted: boolean = false;
  errorMessage: string = '';

  error = '';
  loading = false;
  returnUrl: string='';

  constructor(
    private authService: AuthService,private route: ActivatedRoute,
    private router: Router, private messageService: MessageService
  ) {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/employee';
  }

  handleLogin(): void {
  

    this.loading = true;
    this.submitted = true;
    if (!this.email || !this.password) {
      this.loading = false;
      return;
    }

    this.authService.login(this.email, this.password )
      .subscribe({
        next: (response) => {
          this.loading = false;
          console.log(response)
        //  this.router.navigate(['/']);
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.loading = false;
        console.error('Login failed:', error);
          this.errorMessage = error.error.message || 'Login failed';
          this.messageService.add({ severity: 'error', summary: "Error", detail:  "Invalid email or password", life: 3000 });

        }
      });
  }

  goToResetPassword(event: Event) {
    event.preventDefault();
    this.router.navigate(['/auth/reset-password-request']);
  }

}
