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

import { DividerModule } from "primeng/divider";
import { AccordionModule } from "primeng/accordion";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { CompanyService } from "../../services/company.service";
import { AppPipesModule } from "../../utils/app-pipes.module";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { LanguageService } from "../../services/language.service";
import { EmployeeService } from "../../services/employee.service";

@Component({
  selector: "app-company-modal",
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    AccordionModule,
    DividerModule,
    ButtonModule,
    AppPipesModule,
    TranslateModule
  ],
  templateUrl: "./company-modal.component.html",
  styleUrl: "./company-modal.component.css",
})
export class CompanyModalComponent {
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
    private translate: TranslateService,
    private languageService: LanguageService,
    private employeeService: EmployeeService
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
  ngOnInit() {
   this.getAdminCompanyById(this.company.id);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["company"] && this.company?.id) {
      this.getAdminCompanyById(this.company.id);
    }
  }

  getAdminCompanyById(id: any) {
    this.companyService.getAdminCompanyById(id).subscribe({
      next: (data) => {
        console.log("hi",data);
        this.selectedCompany = data;
        this.getLegalFormById(data.legal_information.legal_form);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  getLegalFormById(id: number) {
    this.employeeService.getLegalFormById(id).subscribe({
      next: (data) => {
        console.log("hello",data);
        this.selectedItem = data;
      },
      error: (err) => {
        console.log(err);
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
}
