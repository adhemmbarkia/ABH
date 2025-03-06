import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { EmployeeService } from "../../services/employee.service";
import { MessageService } from "primeng/api";
import { CommonModule } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { DividerModule } from "primeng/divider";
import { DialogModule } from "primeng/dialog";
import { InputTextModule } from "primeng/inputtext";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { Toast } from "primeng/toast";
import { ProgressSpinner } from "primeng/progressspinner";
import { User } from "../../models/user.model";
import { AuthService } from "../../services/auth.service";
import { RadioButtonModule } from "primeng/radiobutton";
import { finalize } from "rxjs";

@Component({
  selector: "app-edit-profile",
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DividerModule,
    DialogModule,
    InputTextModule,
    RadioButtonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./edit-profile.component.html",
  styleUrl: "./edit-profile.component.css",
})
export class EditProfileComponent implements OnInit {
  //@Input() userCurrent: any;
  @Input() visible = false;
  @Output() confirm = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<any>();
  @Output() visibleChange = new EventEmitter<boolean>();

  newPassword: string = "";
  confirmPassword: string = "";
  errorMessage: string = "";
  email: any = "";
  username: any = "";
  isMobile: boolean = false;
  loading = false;
  user: User | null = null;

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  
  editType: string = 'profile'; 

  // Update methods
  updateProfile() {
    // Logic to update just the username
    this.loading = true;
    // Your profile update logic here
    this.loading = false;
  }

  updatePassword() {
    // Password validation and update logic
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = "Passwords don't match";
      return;
    }

    this.loading = true;
    // Your password update logic here
    this.loading = false;
  }

  constructor(
    private breakpointObserver: BreakpointObserver,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.breakpointObserver
      .observe([Breakpoints.HandsetPortrait])
      .subscribe((result) => {
        console.log(result);
        this.isMobile = result.matches;
      });
  }
  ngOnInit() {
    this.user = this.authService.getUser();
    this.initForms();
  }

 
  initForms() {
    // Profile form
    this.profileForm = this.fb.group({
      username: [this.user?.username || "", Validators.required]
    });

    // Password form
    this.passwordForm = this.fb.group({
      newPassword: ["", [Validators.required, Validators.minLength(8)]],
      confirmPassword: ["", Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }
  updateProfilee() {
    if (this.profileForm.invalid) {
      this.errorMessage = 'Please enter a valid username';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    
    const username = this.profileForm.get('username')?.value;
    
    this.authService.updateUser(username)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          console.log(response);
          // localStorage.getItem('user_data') ? JSON.parse(localStorage.getItem('user_data')!) : null;

         this.authService.updateUsername(username);
         this.confirm.emit();
          this.onCancel();
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to update profile. Please try again.';
        }
      });
  }

  updatePasswordd() {
    if (this.passwordForm.invalid) {
      if (this.passwordForm.hasError('passwordMismatch')) {
        this.errorMessage = 'Passwords do not match';
      } else if (this.passwordForm.get('newPassword')?.errors?.['minlength']) {
        this.errorMessage = 'Password must be at least 8 characters long';
      } else {
        this.errorMessage = 'Please fill all required fields';
      }
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    
    const password = this.passwordForm.get('newPassword')?.value;
    
    this.authService.updatePassword(password)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.onCancel();
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to update password. Please try again.';
        }
      });
  }

  onCancel() {
    this.visible = false;
    this.errorMessage = '';
    this.initForms(); // Reset forms
  }

  open() {
    this.visible = true;
    this.editType = 'profile';
    this.errorMessage = '';
    this.initForms(); // Reset forms with current user data
  }
  

  validatePasswords(): boolean {
    if (!this.user!.username) {
      this.errorMessage = "Username cannot be empty";
      return false;
    }
    if (this.newPassword && this.confirmPassword) {
      if (this.newPassword !== this.confirmPassword) {
        this.errorMessage = "Passwords do not match";
        return false;
      }
      if (this.newPassword.length < 8) {
        this.errorMessage = "Password must be at least 8 characters long";
        return false;
      }
    } else {
      this.errorMessage = "Passwords do not match";
      return false;
    }
    this.errorMessage = "";
    return true;
  }
  onConfirm(): void {
    this.confirm.emit();
    this.visible = false;
    this.visibleChange.emit(false);
  }

  // onCancel(): void {
  //   this.cancel.emit();
  //   this.visible = false;
  //   this.visibleChange.emit(false);
  // }
  onHide() {
    this.visible = false;

    this.visibleChange.emit(false);
  }
  updateEmployee() {
    if (!this.validatePasswords()) {
      return;
    }
    this.loading = true;
    let updateData = {
      username: this.user!.username,
      // email: this.user!.email,
      password: this.newPassword,
    };

    this.employeeService.updateProfile(this.user!.id, updateData).subscribe({
      next: (response) => {
        this.visible = false;
        // Show success message or handle success
        this.authService.updateUsername(this.user!.username);
        this.loading = false;
        this.confirm.emit(true);
        this.visible = false;
        this.visibleChange.emit(false);
      },
      error: (error) => {
        // Handle error
        this.loading = false;
        console.log(error);
        this.errorMessage = "Failed to update employee";
        // this.messageService.add({
        //   severity: 'error',
        //   summary: 'Error',
        //   detail: 'Failed to update employee'
        // })
      },
    });
  }

  hideEditDialog() {
    this.visible = false;
    this.errorMessage = "";
    this.newPassword = "";
    this.confirmPassword = "";
  }
}
