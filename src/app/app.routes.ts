import { Routes } from "@angular/router";
import { LayoutComponent } from "./components/layout/layout.component";
import { authGuard } from "./components/login/auth.guard";

export const routes: Routes = [
  
  {
    path: "",
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: "",
        loadComponent: () =>
          import("./components/dashboard/dashboard.component").then(
            (m) => m.DashboardComponent
          ),
        title: "Dashboard",
      },
      // {
      //   path: 'analytics',
      //   loadComponent: () =>
      //     import('./features/analytics/analytics.component').then(m => m.AnalyticsComponent),
      //   title: 'Analytics'
      // },
      {
        path: "employee",
        loadComponent: () =>
          import("./components/employee/employee.component").then(
            (m) => m.EmployeeComponent
          ),
        title: "Employee",
      },
      {
        path: "companies/admin",
        loadComponent: () =>
          import("./components/company-my/company-my.component").then(
            (m) => m.CompanyComponent
          ),
        title: "Companies",
      },
      {
        path: "companies/employee",
        loadComponent: () =>
          import("./components/company-employee/company-employee.component").then(
            (m) => m.CompanyEmployeeComponent
          ),
        title: "Companies",
      },
      // {
      //   path: '**',
      //   loadComponent: () =>
      //     import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
      //   title: 'Page Not Found'
      // },
    ],
  },
  
  {
    path: "auth/login",
    loadComponent: () =>
      import("./components/login/login.component").then(
        (m) => m.LoginComponent
      ),
    title: "login",
  },
  {
    path: "auth/reset-password-request",
    loadComponent: () =>
      import(
        "./components/password-reset-request/password-reset-request.component"
      ).then((m) => m.PasswordResetRequestComponent),
    title: "Reset Password Request",
  },
  {
    path: "auth/verify-code",
    loadComponent: () =>
      import("./components/verify-code/verify-code.component").then(
        (m) => m.VerifyCodeComponent
      ),
    title: "Reset Password Request",
  },
  {
    path: "auth/reset-password",
    loadComponent: () =>
      import("./components/reset-password/reset-password.component").then(
        (m) => m.ResetPasswordComponent
      ),
    title: "Reset Password Request",
  },
];
