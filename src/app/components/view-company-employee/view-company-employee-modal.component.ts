import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { DialogModule } from "primeng/dialog";
import { ButtonModule } from "primeng/button";
import { TagModule } from "primeng/tag";
import { DividerModule } from "primeng/divider";
import { AccordionModule } from "primeng/accordion";
import { Company } from "../../models/company.interface";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { CompanyService } from "../../services/company.service";
import { CompanyV } from "../../models/companyView.model";
import { AppPipesModule } from "../../utils/app-pipes.module";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { LanguageService } from "../../services/language.service";
import { EmployeeService } from "../../services/employee.service";
import { Observable } from "rxjs";

@Component({
  selector: "app-view-company-employee-modal",
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    AccordionModule,
    DividerModule,
    ButtonModule,
    AppPipesModule,
    TranslateModule,
    TagModule
  ],
  templateUrl: "./view-company-employee-modal.component.html",
  styleUrl: "./view-company-employee-modal.component.css",
})
export class ViewCompanyEmployeeModalComponent  {
  @Input() visible: boolean = false;
  @Input() company: any ;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  selectedCompany: any = {};

  selectedItem: any;
  modalVisible: boolean = false;
  activeIndex = 0;

  isExpanded = true;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private companyService: CompanyService,
    private employeeService: EmployeeService,
    private translate: TranslateService,
    private languageService: LanguageService
  ) {
    const language = this.languageService.getCurrentLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    this.breakpointObserver
      .observe([Breakpoints.HandsetPortrait])
      .subscribe((result) => {
        this.isMobile = result.matches;
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["company"] && this.company?.id) {
      this.getAdminCompanyById(this.company.id);
    }
  }

  getAdminCompanyById(id: any) {
    this.companyService.getAdminCompanyById(id).subscribe({
      next: (data) => {
        console.log("hel",data);
        this.selectedCompany = data;
        this.getLegalFormById(data.legal_information.legal_form);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  legalFormName: string = '';

  


  getLegalFormById(id: number) {
    this.employeeService.getLegalFormById(id).subscribe({
      next: (data) => {
        // console.log('Legal Form Data:', data);
        this.selectedItem = data;
        console.log('Legal Form Data:', this.selectedItem);
      },
      error: (err) => {
        console.error('Error fetching legal form data:', err);
        // Handle error (e.g., display an error message)
      },
    });
  }

  isMobile: boolean = false;
  onHide() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }

  onEdit() {
    this.edit.emit();
  }

  onDelete() {
    this.delete.emit();
  }

  acceptCompany(id: number) {
    // this.loading = true;
    this.companyService.acceptCompany(id).subscribe({
      next: (response) => {
        console.log("Company approved successfully", response);
        // this.loadData();
        // this.loading = false;
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
        // this.loadData();
      },
      error: (error) => {
        console.error("Error approving company:", error);
      },
    });
  }

  acceptEdit(id:any){
    console.log("accept edit")
  }
  archiveCompany(id:any){
    console.log("archive company")

  }
}
