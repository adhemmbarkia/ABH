import { CommonModule } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  QueryList,
  signal,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { CardModule } from "primeng/card";
import { CountUp } from "countup.js";
import { EmployeeService } from "../../services/employee.service";
import { CompanyService } from "../../services/company.service";
import { AvatarModule } from "primeng/avatar";
import { switchMap, map, catchError, of, forkJoin } from "rxjs";
import { Employee } from "../../models/employee.interface";
import { RippleModule } from "primeng/ripple";
import { ButtonModule } from "primeng/button";
import { TableModule } from "primeng/table";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { LanguageService } from "../../services/language.service";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    AvatarModule,
    TableModule,
    ButtonModule,
    RippleModule,
    TranslateModule
  ],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.css",
})
export class DashboardComponent {
  @ViewChildren("counter") counterElements!: QueryList<ElementRef>;
  kpis: any[] = [];
  totalEmployees: number = 0;
  totalAdministratorCompanies: number = 0;
  totalEmployeesCompanies: number = 0;

  products:any[];

  loading = signal<boolean>(false);
  allCompanies = signal<any[]>([]);
  filteredCompanies = signal<any[]>([]);
  totalRecords = signal<number>(0);
  search = signal<string>('');

  employees: Employee[]=[];


 

  constructor(
    private companyService: CompanyService,
    private employeeService: EmployeeService,
    private cdRef: ChangeDetectorRef,
    private translateService: TranslateService
  ) {
    this.translateService.onLangChange.subscribe(() => {
      this.getCompanyCount(); 
      this.cdRef.detectChanges(); 
    });
  }
  ngOnInit() {
      this.loadData();
      this.loadEmployeeData()


  }

  getCompanyCount() {
    this.companyService.getAllCompaniesCreatedByAdmin().subscribe((res) => {
      console.log(res);
      this.totalEmployees = res.totals.total_employees;
      this.totalAdministratorCompanies = res.companies.length;
      this.totalEmployeesCompanies =
        res.totals.total_companies - res.companies.length;

      console.log(
        this.totalEmployees,
        this.totalEmployeesCompanies,
        this.totalAdministratorCompanies
      );

      this.kpis = [
        {
          value: this.totalAdministratorCompanies,
          label: this.translateService.instant('DASHBOARD.TOTAL_ADMINISTRATOR_COMPANIES'),
          icon: "pi pi-building",
        },
        {
          value: this.totalEmployeesCompanies,
          label: this.translateService.instant('DASHBOARD.TOTAL_EMPLOYEES_COMPANIES'),
          icon: "pi pi-users",
        },
        {
          value: this.totalEmployees,
          label: this.translateService.instant('DASHBOARD.TOTAL_EMPLOYEES'),
          icon: "pi pi-user",
        },
      ];

  

      // Initialize the CountUp animation AFTER setting kpis
      this.initCountUp();
    });
  }


  ngAfterViewInit() {
    // Call API when the view is ready
    this.getCompanyCount();
    console.log("aa",this.employees);
  }

  initCountUp() {
    setTimeout(() => {
      this.counterElements.forEach((el, i) => {
        const countUp = new CountUp(el.nativeElement, this.kpis[i]?.value);
        if (!countUp.error) countUp.start();
      });
    }, 100);
  }

  loadData() {
    this.loading.set(true);
    this.companyService.getAllData(this.search()).subscribe({
      next: (response: any) => {
    
        this.allCompanies.set(response.companies.slice(0, 5));
       

        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.loading.set(false);
      },
    });
  }

  loadEmployeeData() {
    this.loading.set(true);
    this.employeeService.getAllData(this.search()).pipe(
      switchMap(response => {
        this.employees = response.results;
        console.log("employees", this.employees);
        

        this.loading.set(false);
  
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

        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.loading.set(false);
      }
    });
  }


}
