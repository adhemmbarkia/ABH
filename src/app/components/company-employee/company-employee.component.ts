import {
  Component,
  computed,
  ElementRef,
  OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { MenuModule } from "primeng/menu";
import { AvatarModule } from "primeng/avatar";
import { TagModule } from "primeng/tag";
import { MenuItem } from "primeng/api";
import { DialogModule } from "primeng/dialog";
import { DividerModule } from "primeng/divider";
import { FormsModule } from "@angular/forms";
import { ReactiveFormsModule } from "@angular/forms";
import { ProgressSpinner } from "primeng/progressspinner";

import { CheckboxModule } from "primeng/checkbox";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { Company } from "../../models/company.interface";
import { CompanyModalComponent } from "../company-modal/company-modal.component";

import { AddEditCompanyComponent } from "../add-edit-company/add-edit-company.component";
import { CompanyService } from "../../services/company.service";
import { ViewCompanyEmployeeModalComponent } from "../view-company-employee/view-company-employee-modal.component";
import { PaginatorModule, PaginatorState } from "primeng/paginator";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { LanguageService } from "../../services/language.service";

@Component({
  selector: "app-company",
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    MenuModule,
    AvatarModule,
    CheckboxModule,
    TagModule,
    DividerModule,
    DialogModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,

    AddEditCompanyComponent,
    IconField,
    InputIcon,
    ViewCompanyEmployeeModalComponent,
    ProgressSpinner,
    PaginatorModule,
    TranslateModule,
  ],
  templateUrl: "./company-employee.component.html",
  styleUrl: "./company-employee.component.css",
})
export class CompanyEmployeeComponent implements OnInit {
  @ViewChild("searchInput") searchInput!: ElementRef;
  items!: MenuItem[];
  showEditDialog = false;
  viewDialogVisible = false;
  search: any = "";
  modalVisible = false;
  addEditModalVisible = false;
  showMobileSearch = false;
  loading = false;
  selectAll: boolean = false;
  selectedCompanies = new Set<string>();
  menuItems: MenuItem[] = [];
  companies = signal<any[]>([]);
  originalCompanies = signal<any[]>([]);
  companyData!: Company;

  // Status filtering properties
  currentStatus = signal<any>("");
  publishedCount = signal<number>(0); // Signal for published companies count
  archivedCount = signal<number>(0); // Signal for archived companies count

  allCompanies = signal<any[]>([]); // All companies from API
  filteredCompanies = signal<any[]>([]); // Filtered companies
  currentPage = signal(0); // Current page index
  rowsPerPage = signal(5); // Number of rows per page

  // Pagination
  totalRecords: number = 0;
  rows: number = 10;
  first: number = 0;

  constructor(
    private companyService: CompanyService,
    private translate: TranslateService,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.companyService.getAllData(this.search).subscribe({
      next: (response: any) => {
        this.allCompanies.set(response.companies);
        this.filteredCompanies.set(response.companies); // Initially, no filter applied
        // this.originalCompanies.set(response.companies);
        // this.companies.set([...this.originalCompanies()]);
        this.totalRecords = response.companies.length;
        console.log("companies", this.totalRecords);
        // this.updatePaginatedEmployees();

        // Calculate counts for badges
        this.updateCounts();

        this.loading = false;
      },
      error: (error) => {
        console.error("Error fetching data:", error);
        this.loading = false;
      },
    });
  }

  // Compute the paginated products dynamically
  paginatedCompanies = computed(() => {
    const start = this.currentPage() * this.rowsPerPage();
    const end = start + this.rowsPerPage();
    return this.filteredCompanies().slice(start, end);
  });

  totalCompanies = computed(() => this.filteredCompanies().length);

  onPageChange(event: PaginatorState) {
    this.currentPage.set(event.page ?? 0);
    this.rowsPerPage.set(event.rows ?? 5);
  }

  // Reset filter
  resetFilter() {
    this.filteredCompanies.set(this.allCompanies());
    this.currentPage.set(0); // Reset to first page
  }

  // onPageChange(event: any) {
  //   this.currentPage = event.page;
  //   this.rowsPerPage = event.rows;
  //   this.first = this.currentPage() * this.rowsPerPage();
  //   this.updatePaginatedEmployees();
  // }

  private updatePaginatedEmployees() {
    const start = this.currentPage() * this.rowsPerPage();
    console.log("start", start);
    const end = start + this.rowsPerPage();
    console.log("end", end);
    this.companies.set(this.originalCompanies().slice(start, end)); // Assuming it's a Signal or State
  }

  // menu Filter Items
  menuFilterItems: MenuItem[] = [
    {
      label: "Pending",
      icon: "pi pi-clock",
      command: () => this.filterByStatus("pending"),
    },
    {
      label: "Accepted",
      icon: "pi pi-check",
      command: () => this.filterByStatus("accepted"),
    },
    {
      label: "Rejected",
      icon: "pi pi-times",
      command: () => this.filterByStatus("rejected"),
    },
    { separator: true },
    {
      label: "Clear Filter",
      icon: "pi pi-filter-slash",
      command: () => this.clearFilter(),
    },
  ];

  selectedCompany: any = {
    uid: "0",
    name: "",
    createdBy: "",
    legalStatus: "Active",
    status: "Published",
    requestType: "",
  };

  // Update the counts for badges
  updateCounts() {
    const companies = this.companies();

    const publishedCount = this.allCompanies().filter(
      (company) => !company.is_archived
    ).length;
    this.publishedCount.set(publishedCount);

    const archivedCount = this.allCompanies().filter(
      (company) => company.is_archived
    ).length;
    this.archivedCount.set(archivedCount);
  }

  // Add this method to your component class
  searchCompanies() {
    if (!this.search || this.search.trim() === "") {
      // If search is empty, reset to current filter state
      if (this.currentStatus() === "published") {
        this.filterByPublished();
      } else if (this.currentStatus() === "archived") {
        this.filterByArchived();
      } else if (this.currentStatus()) {
        this.filterByStatus(this.currentStatus());
      } else {
        this.filteredCompanies.set(this.allCompanies());
      }
    } else {
      // Filter companies based on search term
      const searchTerm = this.search.toLowerCase().trim();

      // Start with all companies and then apply search filter
      let filtered = this.allCompanies().filter((company) => {
        return (
          (company.name && company.name.toLowerCase().includes(searchTerm)) ||
          (company.uid && company.uid.toLowerCase().includes(searchTerm)) ||
          (company.employee &&
            company.employee.toLowerCase().includes(searchTerm)) ||
          (company.legal_information?.legal_status &&
            company.legal_information.legal_status
              .toLowerCase()
              .includes(searchTerm))
        );
      });

      // Apply current status filter if any
      if (this.currentStatus() === "published") {
        filtered = filtered.filter((company) => !company.is_archived);
      } else if (this.currentStatus() === "archived") {
        filtered = filtered.filter((company) => company.is_archived);
      } else if (this.currentStatus()) {
        filtered = filtered.filter(
          (company) => company.approval_status === this.currentStatus()
        );
      }

      this.filteredCompanies.set(filtered);
    }

    // Reset pagination
    this.currentPage.set(0);
  }

  // Filter by published status
  filterByPublished() {
    console.log("ss", this.originalCompanies());
    if (this.currentStatus() === "published") {
      this.clearFilter();
    } else {
      this.currentStatus.set("published");
      this.filteredCompanies.set(
        this.allCompanies().filter((company) => !company.is_archived)
      );
    }

    console.log("ll", this.originalCompanies());
  }

  // Filter by archived status
  filterByArchived() {
    if (this.currentStatus() === "archived") {
      this.clearFilter();
    } else {
      this.currentStatus.set("archived");
      this.filteredCompanies.set(
        this.allCompanies().filter((company) => company.is_archived)
      );
    }
  }

  // Filter by approval status
  filterByStatus(status: string) {
    this.currentStatus.set(status);
    this.filteredCompanies.set(
      this.allCompanies().filter(
        (company) => company.approval_status === status
      )
    );
  }

  // Clear all filters
  clearFilter() {
    this.currentStatus.set(null);
    this.filteredCompanies.set([...this.allCompanies()]); // Reset to the original list
    console.log(this.originalCompanies());
  }

  openFilterMenu(event: Event, menu: any) {
    menu.toggle(event);
  }

  openMenu(event: Event, company: any, menu: any) {
    console.log("ccc", company);
    this.companyData = company;
    this.menuItems = [
      {
        label: "View",
        icon: "pi pi-eye",
        command: () => this.showModal(this.companyData),
      },
      {
        label: "Edit",
        icon: "pi pi-pencil",
        command: () => this.showModal(this.companyData),
      },
      {
        label: "Delete",
        icon: "pi pi-trash",
        command: () => this.onDelete(company),
      },
    ];

    menu.toggle(event);
  }

  getStatusClass(status: string): string {
    return status === "Active"
      ? "px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm"
      : "px-3 py-1 rounded-full bg-orange-50 text-orange-500 text-sm";
  }

  toggleMobileSearch() {
    this.showMobileSearch = !this.showMobileSearch;
    if (this.showMobileSearch) {
      setTimeout(() => {
        this.searchInput?.nativeElement?.focus();
      });
    }
  }

  focusOutFunction() {
    this.showMobileSearch = !this.showMobileSearch;
  }

  onView(employee: any) {
    this.selectedCompany = { ...employee }; // Clone employee data
    this.viewDialogVisible = true;
    console.log("Viewing:", employee);
  }

  onDelete(company: any) {
    this.companyService.archieveCompany(company.id).subscribe({
      next: (response) => {
        this.loadData();
      },
      error: (error) => {
        console.error("Error archieved company:", error);
      },
    });
  }

  onEdit(company: any) {
    this.selectedCompany = { ...company }; // Clone employee data
    this.showEditDialog = true;
  }

  addNew() {
    this.addEditModalVisible = true;
  }

  onSave() {
    if (this.selectedCompany) {
      // const index = this.companies.findIndex(row => row.uid === this.selectedCompany.uid);
      // if (index !== -1) {
      //   this.companies[index] = { ...this.selectedCompany };
      // }
    }
    this.showEditDialog = false;
  }

  onDeactivate() {
    console.log("Account Deactivated:", this.selectedCompany);
  }

  onEditCompany(company: any) {
    console.log("Editing company:", company);
  }

  onDeleteCompany(company: any) {
    console.log("Deleting company:", company);
  }

  onSelectAll(event: any) {
    if (event.checked) {
      this.companies().forEach((row: any) =>
        this.selectedCompanies.add(row.id)
      );
    } else {
      this.selectedCompanies.clear();
    }
  }

  onRowSelect(company: Company) {
    if (this.selectedCompanies.has(company.id)) {
      this.selectedCompanies.delete(company.id);
    } else {
      this.selectedCompanies.add(company.id);
    }
    this.selectAll = this.companies.length === this.selectedCompanies.size;
  }

  getselectedCompanies(): Company[] {
    return this.companies().filter((row: any) =>
      this.selectedCompanies.has(row.id)
    );
  }

  showModal(company: any) {
    this.selectedCompany = company;
    this.modalVisible = true;
  }

  handleEdit() {
    console.log("Edit clicked");
  }

  handleDelete() {
    console.log("Delete clicked");
  }

  // Accept a company
  acceptCompany(id: number) {
    this.loading = true;
    this.companyService.acceptCompany(id).subscribe({
      next: (response) => {
        console.log("Company approved successfully", response);
        this.loadData();
        this.loading = false;
      },
      error: (error) => {
        console.error("Error approving company:", error);
      },
    });
  }

  // Reject a company
  rejectCompany(id: number) {
    this.companyService.rejectCompany(id).subscribe({
      next: (response) => {
        console.log("Company rejected successfully", response);
        this.loadData();
      },
      error: (error) => {
        console.error("Error approving company:", error);
      },
    });
  }
}
