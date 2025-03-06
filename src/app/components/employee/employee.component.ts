import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Menu, MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { MenuItem, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { IconField } from 'primeng/iconfield';
import { PaginatorModule } from 'primeng/paginator';
import { InputIcon } from 'primeng/inputicon';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Employee } from '../../models/employee.interface';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { EmployeeService } from '../../services/employee.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { Toast } from 'primeng/toast';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, MenuModule, AvatarModule,CheckboxModule,
    TagModule, DividerModule, DialogModule,  InputTextModule,FormsModule,ReactiveFormsModule,
    IconField, InputIcon, ConfirmationDialogComponent, Toast, ProgressSpinner, PaginatorModule
  ],
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.css',
  providers: [MessageService]
})
export class EmployeeComponent implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('menuOnViewMobile') menuOnViewMobile!: Menu;
  items!: MenuItem[];
  showEditDialog = false;
  viewDialogVisible = false;
  employees: Employee[]=[];
  email:any="";
  // phone_number:any="";
  unique_identifier:any="";
  search:any="";
  originalData: any[] = []; // Store the original data
  displayData: any[] = [];
  page:any="";
  ordering:any="";

  showMobileSearch = false;
  isMobile: boolean = false;

  newPassword: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  currentStatus: string | null = null;
  selectAll: boolean = false;
  //employees: Employee[] = [];
  selectedEmployees = new Set<string>();

  loading:boolean = false;

  showDialog = false;
  dialogTitle = '';
  dialogMessage = '';
  dialogConfirmLabel = '';
  dialogDisplayData: any;
  currentAction: 'approve' | 'reject' | 'delete' |'block' | null = null;
  confirmButtonClass="";

  currentPage = 0;
rowsPerPage = 10;
paginatedEmployees: any[] = [];

  constructor(private breakpointObserver: BreakpointObserver,
    private employeeService: EmployeeService, private messageService: MessageService
  ) {
    this.breakpointObserver.observe([Breakpoints.HandsetPortrait])
      .subscribe(result => {
        console.log(result);
        this.isMobile = result.matches;
      });
  }


  selectedEmployee: Employee={
    id:'',
    unique_identifier: '',
    username: '',
    email: '',
    role:'',
    phone_number: '',
    //accountStatus?: 'Pending Approval' | 'Active',
    is_approved: false,
    is_blocked: true,
    is_pending: false,
    is_rejected: false,
    //accountStatus: 'Pending Approval',
    totalCompanies: 0
  };

  menuItems: MenuItem[] = [];
  menuFilterItems : MenuItem[] = [];

 
  loadData_old() {
    this.loading = true;
    this.employeeService.getAllData(this.search
     // this.email, this.phone_number, this.unique_identifier,
     // this.search, this.page, this.ordering
    ).subscribe(
        (response) => {
          console.log('Data fetched successfully:', response);
          this.employees = response.results;
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching data:', error);
        this.loading = false;
      }
    );
  }

  // loadData() {
  //   this.loading = true;
  //   this.employeeService.getAllData(this.search).pipe(
  //     switchMap(response => {
  //       this.employees = response.results;
  //     this.loading = false;
        
  //       // Create an array of observables for company requests
  //       const companyRequests = this.employees.map(employee => 
  //         this.employeeService.getCompanies(employee.id).pipe(
  //           map(companies => ({
  //             ...employee,
  //             companies: companies
  //           })),
  //           catchError(error => {
  //             console.error(`Error fetching companies for employee ${employee.id}:`, error);
  //             return of({ ...employee, companies: [] });
  //           })
  //         )
  //       );
        
  //       // Combine all requests
  //       return forkJoin(companyRequests);
  //     })
  //   ).subscribe({
  //     next: (employeesWithCompanies) => {
  //       this.employees = employeesWithCompanies;
  //       console.log("data ", this.employees);
  //     this.displayData = [...this.employees];

  //       this.updatePaginatedEmployees();
  //       this.loading = false;
  //     },
  //     error: (error) => {
  //       console.error('Error fetching data:', error);
  //       this.loading = false;
  //     }
  //   });
  // }

 loadData() {
  this.loading = true;
  this.employeeService.getAllData(this.search).pipe(
    switchMap(response => {
      this.employees = response.results;
      this.displayData = [...this.employees]; // Update displayData
      this.updatePaginatedEmployees(); // Update paginatedEmployees
      this.loading = false;

      // Create an array of observables for company requests
      const companyRequests = this.employees.map(employee => 
        this.employeeService.getCompanies(employee.id).pipe(
          map(companies => ({
            ...employee,
            companies: companies
          })),
          catchError(error => {
            console.error(`Error fetching companies for employee ${employee.id}:`, error);
            return of({ ...employee, companies: [] });
          })
        )
      );

      // Combine all requests
      return forkJoin(companyRequests);
    })
  ).subscribe({
    next: (employeesWithCompanies) => {
      this.employees = employeesWithCompanies;
      this.displayData = [...this.employees]; // Update displayData
      this.updatePaginatedEmployees(); // Update paginatedEmployees
      this.loading = false;
    },
    error: (error) => {
      console.error('Error fetching data:', error);
      this.loading = false;
    }
  });
}

  filterData() {
    if (this.search.trim() === '') {
      this.displayData = [...this.employees];
    } else {
      const searchTerm = this.search.toLowerCase();
      this.displayData = this.employees.filter(item => {
        return (
          item.unique_identifier?.toLowerCase().includes(searchTerm) ||
          item.username?.toLowerCase().includes(searchTerm) ||
          item.email?.toLowerCase().includes(searchTerm)
        );
      });
    }
    // Reset to first page when filtering
    this.currentPage = 0;
    this.updatePaginatedEmployees();
  }

  openMenu(event: Event, employee: any, menu: any) {
    this.menuItems = [
      // { label: 'View', icon: 'pi pi-eye', command: () => this.onView(employee) },
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.onEdit(employee) },
      { label: 'Delete', icon: 'pi pi-trash', command: () => this.showDeleteDialog(employee) }
    ];
    menu.toggle(event);
  }

  // openFilterMenu(event: Event, menu: any) {
  //   this.menuFilterItems = [
  //     { label: 'Approved', icon: 'pi pi-eye', command: () => this.statusFilter("is_approved") },
  //     { label: 'Pending', icon: 'pi pi-pencil', command: () => this.statusFilter("is_pending") },
  //     { label: 'Rejected', icon: 'pi pi-trash', command: () => this.statusFilter("is_rejected") }
  //   ];
  //   menu.toggle(event);
  // }
  openFilterMenu(event: Event, menu: any) {
    this.menuFilterItems = [
      { 
        label: 'Approved', 
        icon: 'pi pi-check-circle', 
        command: () => this.statusFilter("is_approved"),
        styleClass: this.currentStatus === 'is_approved' ? 'active-filter' : ''
      },
      { 
        label: 'Pending', 
        icon: 'pi pi-clock', 
        command: () => this.statusFilter("is_pending"),
        styleClass: this.currentStatus === 'is_pending' ? 'active-filter' : ''
      },
      { 
        label: 'Rejected', 
        icon: 'pi pi-times-circle', 
        command: () => this.statusFilter("is_rejected"),
        styleClass: this.currentStatus === 'is_rejected' ? 'active-filter' : ''
      },
      { separator: true },
      { 
        label: 'Clear Filter', 
        icon: 'pi pi-times',
        command: () => this.clearStatusFilter(),
        styleClass: 'clear-filter'
      }
    ];
    menu.toggle(event);
  }
  
  updateMenuItems(employee: any) {
    this.items = [
      { 
        label: employee.is_blocked ? 'Activate account' : 'Deactivate account',
        icon: employee.is_blocked ? 'pi pi-unlock' : 'pi pi-lock',
        command: () => this.toggleBlockStatus(employee)
      },
      { 
        label: 'Edit', 
        icon: 'pi pi-pencil' 
      }
    ];
  }
  statusFilter(status: string) {
    if (this.currentStatus === status) {
      this.currentStatus = null;
      this.displayData = [...this.employees];
    } else {
      this.currentStatus = status;
      this.displayData = this.employees.filter(item => {
        switch (status) {
          case 'is_approved':
            return item.is_approved === true;
          case 'is_pending':
            return item.is_pending === true;
          case 'is_rejected':
            return item.is_rejected === true;
          case 'is_active':
            return item.is_blocked === false; // Active means NOT blocked
          case 'is_blocked':
            return item.is_blocked === true; // Deactivated means blocked
          default:
            return true;
        }
      });
    }
  
    // Apply search filter if exists
    if (this.search.trim() !== '') {
      const searchTerm = this.search.toLowerCase();
      this.displayData = this.displayData.filter(item => 
        item.unique_identifier?.toLowerCase().includes(searchTerm) ||
        item.username?.toLowerCase().includes(searchTerm) ||
        item.email?.toLowerCase().includes(searchTerm)
      );
    }
  
    // Reset to first page when filtering
    this.currentPage = 0;
    this.updatePaginatedEmployees();
  }
  

  getStatusClass(status: string): string {
    return status === 'Active' 
      ? 'px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm'
      : 'px-3 py-1 rounded-full bg-orange-50 text-orange-500 text-sm';
  }
  clearStatusFilter() {
    this.currentStatus = null;
    this.displayData = [...this.employees];
  
    // Apply search filter if exists
    if (this.search.trim() !== '') {
      this.filterData();
    }
  
    this.currentPage = 0;
    this.updatePaginatedEmployees();
  }
  
  // Add this method
// onPageChange(event: any) {
//   this.currentPage = event.page;
//   this.rowsPerPage = event.rows;
//   this.updatePaginatedEmployees();
// }

onPageChange(event: any) {
  this.currentPage = event.page;
  this.rowsPerPage = event.rows;
  this.updatePaginatedEmployees();
}



// private updatePaginatedEmployees() {
//   const start = this.currentPage * this.rowsPerPage;
//   const end = start + this.rowsPerPage;
//   this.paginatedEmployees = this.displayData.slice(start, end);
// }

// private updatePaginatedEmployees() {
//   const start = this.currentPage * this.rowsPerPage;
//   const end = start + this.rowsPerPage;
//   this.paginatedEmployees = this.displayData.slice(start, end);
// }

private updatePaginatedEmployees() {
  const start = this.currentPage * this.rowsPerPage;
  const end = start + this.rowsPerPage;
  this.paginatedEmployees = this.displayData.slice(start, end);
}

// Call this whenever employees data changes
ngOnChanges() {
  this.updatePaginatedEmployees();
}

  // showMenu(event: Event) {
  //   const menu = document.querySelector('p-menu');
  //   if (menu) {
  //     menu['toggle'](event);
  //   }
  // }

  ngOnInit() {
    this.loadData();
    this.displayData = [...this.employees]; // Initialize displayData with all employees
    this.updatePaginatedEmployees(); // Initialize paginatedEmployees
  }
  // ngOnInit() {
  //   // Initialize component
  //   this.loadData();
  //   // this.items = [
  //   //   { label: 'Disactivate account', icon: 'pi pi-lock' },
  //   //   { label: 'Edit', icon: 'pi pi-pencil' },

  //   // ];
  // }

  // toggleMobileSearch() {
  //   this.showMobileSearch = !this.showMobileSearch;
  // }
  toggleMobileSearch() {
    this.showMobileSearch = !this.showMobileSearch;
    if (this.showMobileSearch) {
      setTimeout(() => {
        this.searchInput?.nativeElement?.focus();
      });
    }
  }
  focusOutFunction(){
    this.showMobileSearch = !this.showMobileSearch;
  }
  onView(employee: any) {
    this.selectedEmployee = { ...employee }; // Clone employee data

    this.viewDialogVisible=true;
    console.log('Viewing:', employee);
  }

  onDelete(employee: any) {
    this.employees = this.employees.filter(emp => emp.id !== employee.id);
  }

  onEdit(employee: any) {
    this.selectedEmployee = { ...employee }; // Clone employee data
    this.showEditDialog = true;
  }

  onSave() {
    if (this.selectedEmployee) {
      const index = this.employees.findIndex(emp => emp.id === this.selectedEmployee.id);
      if (index !== -1) {
        this.employees[index] = { ...this.selectedEmployee };
      }
    }
    this.showEditDialog = false;
  }


  onDeactivate() {
    console.log('Account Deactivated:', this.selectedEmployee);
  }

  onEditCompany(company: any) {
    console.log('Editing company:', company);
  }

  onDeleteCompany(company: any) {
    console.log('Deleting company:', company);
  }

  onSelectAll(event: any) {
    if (event.checked) {
      this.employees.forEach(emp => this.selectedEmployees.add(emp.id));
    } else {
      this.selectedEmployees.clear();
    }
  }

  onRowSelect(employee: Employee) {
    if (this.selectedEmployees.has(employee.id)) {
      this.selectedEmployees.delete(employee.id);
    } else {
      this.selectedEmployees.add(employee.id);
    }
    this.selectAll = this.employees.length === this.selectedEmployees.size;
  }

  getSelectedEmployees(): Employee[] {
    return this.employees.filter(emp => this.selectedEmployees.has(emp.id));
  }
  // 

  showApproveDialog(employee: any): void {
    this.selectedEmployee = employee;
    console.log(this.selectedEmployee);
    this.currentAction = 'approve';
    this.dialogTitle = 'Approve client';
    this.dialogMessage = 'Are you sure?';
    this.dialogConfirmLabel = 'Approve';
    // this.dialogDisplayData = {
    //   Name: employee.username,
    //   Email: employee.email,
    //   Phone: employee.phone_number,
    //   Role: employee.role
    // };
    this.dialogDisplayData = [
    ];
    this.showDialog = true;
  }

  showRejectDialog(employee: any): void {
    this.selectedEmployee = employee;
    this.currentAction = 'reject';
    this.dialogTitle = 'Reject User';
    this.dialogMessage = 'Are you sure?';
    this.dialogConfirmLabel = 'Reject';
    this.dialogDisplayData = [
      
    ];
    this.showDialog = true;
  }

  validatePasswords(): boolean {
    // Only validate passwords if either the new password or confirm password is provided
    if (this.newPassword || this.confirmPassword) {
      if (this.newPassword && this.confirmPassword) {
        if (this.newPassword !== this.confirmPassword) {
          this.errorMessage = 'Passwords do not match';
          return false;
        }
        if (this.newPassword.length < 8) {
          this.errorMessage = 'Password must be at least 8 characters long';
          return false;
        }
      } else {
        this.errorMessage = 'Both password fields are required';
        return false;
      }
    }
    this.errorMessage = ''; // Clear any previous errors
    return true;
  }
  
  validateUsername(): boolean {
    if (!this.selectedEmployee.username || this.selectedEmployee.username.trim() === '') {
      this.errorMessage = 'Username cannot be empty';
      return false;
    }
    this.errorMessage = ''; // Clear any previous errors
    return true;
  }
  

  showDeleteDialog(employee: any): void {
    this.selectedEmployee = employee;
    this.currentAction = 'delete';
    this.dialogTitle = 'Delete User';
    this.dialogMessage = 'Are you sure?';
    this.dialogConfirmLabel = 'Delete';
    this.confirmButtonClass="bg-red-600 border-none text-white";

    this.showDialog = true;
  }

  handleConfirm(): void {
    if (!this.selectedEmployee) return;
    this.loading = true;
  
    let action$: Observable<any>;
    
    switch (this.currentAction) {
      case 'approve':
        action$ = this.employeeService.approveUser(this.selectedEmployee.id);
        break;
      case 'reject':
        action$ = this.employeeService.rejectUser(this.selectedEmployee.id);
        break;
      case 'delete':
        action$ = this.employeeService.deleteUser(this.selectedEmployee.id);
        break;
      default:
        return;
    }
  
    action$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `User successfully ${this.currentAction}${this.currentAction === 'reject' ? 'ed' : 'd'}`
        });
        this.loadData();
        this.resetDialog();
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${this.currentAction} user. ${error.message || 'Please try again.'}`
        });
        console.error('Error:', error);
        this.resetDialog();
      }
    });
  }

  handleCancel(): void {
    console.log('Cancelled');
    this.resetDialog();
  }

  private resetDialog(): void {
    this.showDialog = false;
    this.currentAction = null;
    this.selectedEmployee = {
      id:'',
      unique_identifier: '',
      username: '',
      email: '',
      role:'',
      phone_number: '',
      is_approved: false,
      is_blocked: false,
      is_pending: false,
      is_rejected: false,
    };
  }

  openMobileMenu(event: any, employee: any) {
    this.updateMenuItems(employee);
    this.menuOnViewMobile.toggle(event);
  }

  toggleBlockStatus(employee: any) {
    this.loading = true;
    this.viewDialogVisible = false;
    this.employeeService.toggleBlockStatus(employee.id).subscribe({
      next: (response) => {
        employee.is_blocked = !employee.is_blocked;
        // Update menu items after status change
        this.loadData();
        this.updateMenuItems(employee);
        // Show success message
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Account ${employee.is_blocked ? 'deactivated' : 'activated'} successfully`
        });
      },
      error: (error) => {
        this.loading = false;
        console.error('Error toggling block status:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update account status'
        });
      }
    });
  }

  // toggleBlockStatus(employee: any) {
  //   this.loading=true;
  //   this.viewDialogVisible=false;
  //   this.employeeService.toggleBlockStatus(employee.id).subscribe({
  //     next: (response) => {
  //       employee.is_blocked = !employee.is_blocked;
  //       // Update menu items after status change
  //       this.loadData();
  //       this.updateMenuItems(employee);
  //       // Show success message
  //       this.loading=false;
  //       this.messageService.add({
  //         severity: 'success',
  //         summary: 'Success',
  //         detail: `Account ${employee.is_blocked ? 'deactivated' : 'activated'} successfully`
  //       });
  //     },
  //     error: (error) => {
  //       this.loading=false;
  //       console.error('Error toggling block status:', error);
  //       this.messageService.add({
  //         severity: 'error',
  //         summary: 'Error',
  //         detail: 'Failed to update account status'
  //       });
  //     }
  //   });
  // }

  updateEmployee() {
    // Validate username if it was changed
    if (this.selectedEmployee.username !== this.selectedEmployee.originalUsername && !this.validateUsername()) {
      return;
    }
  
    // Validate password if it was entered
    if (this.newPassword || this.confirmPassword) {
      if (!this.validatePasswords()) {
        return;
      }
    }
  
    this.loading = true;
  
    let updateData: any = {
      username: this.selectedEmployee.username,
      email: this.selectedEmployee.email,
    };
  
    // Add password only if a new password was entered
    if (this.newPassword) {
      updateData.password = this.newPassword;
    }
  
    this.employeeService.updateEmployee(this.selectedEmployee.id, updateData).subscribe({
      next: (response) => {
        this.showEditDialog = false;
        this.loading = false;
        this.newPassword = '';
        this.confirmPassword = '';
        this.errorMessage = '';
        this.loadData();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Employee updated successfully',
        });
      },
      error: (error) => {
        this.loading = false;
        console.log(error);
        this.errorMessage = 'Failed to update employee';
      },
    });
  }
  
  hideEditDialog(){
    this.showEditDialog = false;
    this.errorMessage = '';
    this.newPassword='';
    this.confirmPassword = '';
  }

   // Method to filter employees by status
   filterEmployeesByStatus(isBlocked: boolean | null) {
    if (isBlocked === null) {
      // Reset to the original list
      this.displayData = [...this.employees];
    } else {
      // Filter employees based on the is_blocked status
      this.displayData = this.employees.filter(
        employee => employee.is_blocked === isBlocked
      );
    }
    // Reset to the first page when filtering
    this.currentPage = 0;
    this.updatePaginatedEmployees();
  }

  // Calculate the number of active employees (is_blocked === false)
getActiveEmployeeCount(): number {
  return this.employees.filter(employee => !employee.is_blocked).length;
}

// Calculate the number of inactive employees (is_blocked === true)
getInactiveEmployeeCount(): number {
  return this.employees.filter(employee => employee.is_blocked).length;
}

}
