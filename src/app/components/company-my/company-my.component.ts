import { CommonModule } from "@angular/common";
import { Component, ElementRef, signal, ViewChild } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ConfirmationService, MenuItem, MessageService } from "primeng/api";
import { AvatarModule } from "primeng/avatar";
import { ButtonModule } from "primeng/button";
import { CheckboxModule } from "primeng/checkbox";
import { DialogModule } from "primeng/dialog";
import { DividerModule } from "primeng/divider";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";
import { MenuModule } from "primeng/menu";
import { ProgressSpinner } from "primeng/progressspinner";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { Company, CompanyDetails } from "../../models/company.interface";
import { CompanyService } from "../../services/company.service";
import { AddEditCompanyComponent } from "../add-edit-company/add-edit-company.component";
import { CompanyModalComponent } from "../company-modal/company-modal.component";
import { CompanyEmployee } from "../../models/company-employee";
import { LanguageService } from "../../services/language.service";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { CompanyV } from "../../models/companyView.model";
import { ToastModule } from "primeng/toast";
import { ConfirmDialog } from "primeng/confirmdialog";
import { PaginatorModule } from "primeng/paginator";

@Component({
  selector: "app-company-employee",
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
    CompanyModalComponent,
    ProgressSpinner,
    TranslateModule,
    ToastModule,
    ConfirmDialog,
    PaginatorModule,
  ],
  templateUrl: "./company-my.component.html",
  styleUrl: "./company-my.component.css",
  providers: [ConfirmationService, MessageService],
})
export class CompanyComponent {
  @ViewChild("searchInput") searchInput!: ElementRef;
  items!: MenuItem[];
  showEditDialog = false;
  viewDialogVisible = false;
  search: string = "";
  modalVisible = false;
  addEditModalVisible = false;
  showMobileSearch = false;
  loading = signal(false);
  selectAll: boolean = false;
  selectedCompanies = new Set<number>();
  menuItems: MenuItem[] = [];
  companies = signal<any[]>([]);
  originalCompanies = signal<any[]>([]);
  isMobile = false;

  publishedCount = signal<number>(0); // Signal for published companies count
  archivedCount = signal<number>(0); // Signal for archived companies count
  companyData!: CompanyV;
  formType!: string;

  // Pagination
  totalRecords: number = 0;
  rows: number = 10;
  first: number = 0;
  rowsPerPage = 10;
  currentPage = 0;

  onPageChange(event: any) {
    this.currentPage = event.page;
    this.rowsPerPage = event.rows;
    this.first = this.currentPage * this.rowsPerPage; 
    this.updatePaginatedEmployees();
  }

  private updatePaginatedEmployees() {
    const start = this.currentPage * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    this.originalCompanies.set(this.companies().slice(start, end)); // Assuming it's a Signal or State
  }

  menuFilterItems: MenuItem[] = [
    {
      label: "Pending",
      icon: "pi pi-clock",
      command: () => this.filterByStatus("pending"),
    },
    {
      label: "Approved",
      icon: "pi pi-check",
      command: () => this.filterByStatus("approved"),
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

  langs = [
    { name: "DE", lang: "de", code: "de" },
    { name: "IT", lang: "it", code: "it" },
    { name: "EN", lang: "en", code: "GB" },
    { name: "FR", lang: "fr", code: "FR" },
  ];

  currentStatus: string | null = null;

  filterByStatus(status: string) {
    this.currentStatus = status;
    this.companies.set(
      this.originalCompanies().filter((company) => {
        return company.approval_status.toLowerCase() === status;
      })
    );
  }

  openFilterMenu(event: Event, menu: any) {
    menu.toggle(event);
  }

  constructor(
    private companyService: CompanyService,
    private translate: TranslateService,
    private languageService: LanguageService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    const language = this.languageService.getCurrentLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
  }

  selectedCompany: any = {
    uid: "0",
    name: "",
    createdBy: "",
    legalStatus: "Active",
    status: "Published",
    requestType: "",
  };

  openMenu(event: Event, company: any, menu: any) {
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
        command: () => this.showEditModal(this.companyData),
      },
      {
        label: "Delete",
        icon: "pi pi-trash",
        command: () => this.confirm(this.companyData),
      },
    ];

    menu.toggle(event);
  }

  getStatusClass(status: string): string {
    return status === "Active"
      ? "px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm"
      : "px-3 py-1 rounded-full bg-orange-50 text-orange-500 text-sm";
  }

  ngOnInit() {
    this.checkScreenSize();
    window.addEventListener("resize", () => this.checkScreenSize());
    this.loadData();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  ngOnDestroy() {
    window.removeEventListener("resize", () => this.checkScreenSize());
  }

  loadData = () => {
    this.loading.set(true);
    this.companyService.getAllCompaniesCreatedByAdmin(this.search).subscribe({
      next: (response) => {

        
      this.originalCompanies.set(response.companies);
      this.companies.set([...this.originalCompanies()]);
      this.totalRecords = response.companies.length;
      this.updatePaginatedEmployees(); 
      this.updateCounts();
      this.loading.set(false);
      },
      error: (error) => {
        console.error("Error fetching data:", error);
        this.loading.set(false);
      },
    });
  };

  confirm(company: any) {
    this.confirmationService.confirm({
      header: "Are you sure?",
      message: "Please confirm to proceed.",
      accept: () => {
        this.companyService.archieveCompany(company.id).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: "error",
              summary: "Deleted",
              detail: "Company deleted successfully",
            });
            this.loadData();
          },
          error: (error) => {
            console.error("Error archieved company:", error);
            this.messageService.add({
              severity: "info",
              summary: "Rejected",
              detail: "You Can't delete this company ",
            });
          },
        });
      },
      reject: () => {},
    });
  }

  // Update the counts for badges
  updateCounts() {
    const companies = this.companies();

    const publishedCount = companies.filter(
      (company) => !company.is_archived
    ).length;
    this.publishedCount.set(publishedCount);

    const archivedCount = companies.filter(
      (company) => company.is_archived
    ).length;
    this.archivedCount.set(archivedCount);
  }

  // Filter by published status
  filterByPublished() {
    if (this.currentStatus === "published") {
      // If already filtered by published, clear the filter
      this.clearFilter();
    } else {
      this.currentStatus = "published";
      this.companies.set(
        this.originalCompanies().filter((company) => !company.is_archived)
      );
    }
  }

  // Filter by archived status
  filterByArchived() {
    if (this.currentStatus === "archived") {
      // If already filtered by archived, clear the filter
      this.clearFilter();
    } else {
      this.currentStatus = "archived";
      this.companies.set(
        this.originalCompanies().filter((company) => company.is_archived)
      );
    }
  }

  // Clear all filters
  clearFilter() {
    this.currentStatus = null;
    this.companies.set([...this.originalCompanies()]); // Reset to the original list
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
    this.formType = "Add";
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

  onRowSelect(company: CompanyEmployee) {
    if (this.selectedCompanies.has(company.id)) {
      this.selectedCompanies.delete(company.id);
    } else {
      this.selectedCompanies.add(company.id);
    }
    this.selectAll = this.companies().length === this.selectedCompanies.size;
  }

  getselectedCompanies(): CompanyEmployee[] {
    return this.companies().filter((row: any) =>
      this.selectedCompanies.has(row.id)
    );
  }

  showModal(company: any) {
    this.selectedCompany = company;
    this.modalVisible = true;
  }

  showEditModal(company: any) {
    this.selectedCompany = company;
    this.formType = "Edit";
    this.addEditModalVisible = true;
  }

  handleEdit() {
    console.log("Edit clicked");
  }

  handleDelete() {
    console.log("Delete clicked");
  }

  acceptCompany(id: number) {
    this.loading.set(true);
    this.companyService.acceptCompany(id).subscribe({
      next: (response) => {
        console.log("Company approved successfully", response);
        this.loadData();
        this.loading.set(false);
      },
      error: (error) => {
        console.error("Error approving company:", error);
      },
    });
  }

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

  // For Pagination

  next() {
    this.first = this.first + this.rows;
  }

  prev() {
    this.first = this.first - this.rows;
  }

  reset() {
    this.first = 0;
  }
  pageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
  }
  isLastPage(): boolean {
    return this.companies()
      ? this.first + this.rows >= this.companies().length
      : true;
  }

  isFirstPage(): boolean {
    return this.companies() ? this.first === 0 : true;
  }
}
