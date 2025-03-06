import {
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { DialogModule } from "primeng/dialog";
import { ButtonModule } from "primeng/button";

import { DividerModule } from "primeng/divider";
import { AccordionModule } from "primeng/accordion";
import { CompanyDetails } from "../../models/company.interface";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AddCompany } from "../../models/add-company.model";
import { LegalForm } from "../../models/legal-form.model";
import { EmployeeService } from "../../services/employee.service";
import { CompanyService } from "../../services/company.service";
import { InputTextModule } from "primeng/inputtext";
import { MultiSelectModule } from "primeng/multiselect";
import { nonEmptyArrayValidator } from "../../utils/validations/nonEmptyArrayValidator.validator";
import { MessageService } from "primeng/api";
import { Toast } from "primeng/toast";
import { CompanyV } from "../../models/companyView.model";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { LanguageService } from "../../services/language.service";
import { switchMap } from "rxjs";
@Component({
  selector: "app-add-edit-company",
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    AccordionModule,
    DividerModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    MultiSelectModule,
    Toast,
    TranslateModule,
  ],
  templateUrl: "./add-edit-company.component.html",
  styleUrl: "./add-edit-company.component.css",
  providers: [MessageService],
})
export class AddEditCompanyComponent {
  @Input() visible: boolean = false;
  @Input() formType: string = "";
  @Input() loadAllCompanies!: () => void;
  @Input() company: CompanyV | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  selectedCompany: any = {};

  companyForm!: FormGroup;

  legalStatusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Dissolved", value: "dissolved" },
    { label: "Bankrupt", value: "bankrupt" },
    { label: "Pending Registration", value: "pending" },
  ];

  sectorOptions = [
    { label: "Raw Materials & Extraction", value: "raw_materials" },
    { label: "Manufacturing & Industry", value: "manufacturing" },
    { label: "Services & Commerce", value: "services" },
    { label: "Knowledge & Innovation", value: "knowledge" },
    { label: "Public & Non-Profit Services", value: "public" },
  ];

  typeOfCapitalOptions = [
    { label: "Based on Ownership Structure", value: "ownership" },
    { label: "Based on Funding Source", value: "funding" },
    { label: "Based on Legal Classification", value: "legal" },
  ];

  statusChoices = [
    { label: "Active", value: "active" },
    { label: "Archived", value: "archived" },
  ];

  // legalFormOptions!: LegalForm[];

  headquartersOptions = [
    { label: "Zurich", value: "Zurich" },
    { label: "Geneva", value: "Geneva" },
    { label: "Basel", value: "Basel" },
    { label: "Bern", value: "Bern" },
    { label: "Lausanne", value: "Lausanne" },
  ];
  branchLocationsMap: Record<string, string> = {
    Zurich: "ZH",
    Geneva: "GE",
    Basel: "BS",
    Bern: "BE",
    Lausanne: "LS",
  };

  branchLocations = [
    { label: "Zurich", value: "ZH" },
    { label: "Geneva", value: "GE" },
    { label: "Basel", value: "BS" },
    { label: "Bern", value: "BE" },
    { label: "Lausanne", value: "LS" },
  ];

  branchLocationsOptions: { label: string; value: string }[] = [];


  legalFormOptions: LegalForm[] = [
    { id: 1, name: 'GmbH' },
    { id: 2, name: 'Sarl' },
    { id: 3, name: 'Ag' },
    { id: 4, name: 'LLC' },
  ];

  newOptionText: string = '';
  editingOption: LegalForm | null = null;
  isDropdownOpen: boolean = true;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  addNewOption() {
    if (this.newOptionText.trim()) {
      if (this.editingOption) {
        // Update existing option
        const index = this.legalFormOptions.findIndex(
          (option) => option.id === this.editingOption?.id
        );
        if (index !== -1) {
          this.legalFormOptions[index].name = this.newOptionText.trim();
        }
        this.editingOption = null; // Reset editing state
      } else {
        // Add new option
        const newId = Math.max(...this.legalFormOptions.map((o) => o.id), 0) + 1;
        this.legalFormOptions.push({
          id: newId,
          name: this.newOptionText.trim(),
        });
      }
      this.newOptionText = ''; // Clear the input field
    }
  }

  editOption(option: LegalForm) {
    this.editingOption = option;
    this.newOptionText = option.name; // Populate the input field with the option's name
  }

  deleteOption(id: number) {
    this.legalFormOptions = this.legalFormOptions.filter(
      (option) => option.id !== id
    );
  }

  constructor(
    private breakpointObserver: BreakpointObserver,
    private employeeService: EmployeeService,
    private companyService: CompanyService,
    private fb: FormBuilder,
    private messageService: MessageService,
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

  ngOnInit() {
    // get Legal Forms from the Server
    this.employeeService.getLegalForms().subscribe((legalForms) => {
      this.legalFormOptions = legalForms;
    });

    console.log("Received loadAllCompanies function:", this.loadAllCompanies);

    // company Form
    this.companyForm = this.fb.group({
      name: ["", Validators.required],
      headquarters: ["", Validators.required],
      branch_locations: ["", Validators.required],
      // headquarters: this.fb.control(
      //   [],
      //   [Validators.required, Validators.minLength(1)]
      // ),
      // branch_locations: this.fb.control({ value: [], disabled: true }, [
      //   Validators.required,
      // ]),

      activity: this.fb.group({
        details: ["", Validators.required],
        project_name: ["", Validators.required],
        location: ["", Validators.required],
      }),
      legal_information: this.fb.group({
        legal_form: ["", Validators.required],
        legal_status: ["", Validators.required],
        sector: ["", Validators.required],
        registration_date: ["", Validators.required],
      }),
      directors: this.fb.array([
        this.fb.group({
          name: ["", Validators.required],
          role: ["", Validators.required],
          signature: [""],
        }),
      ]),
      financial_information: this.fb.group({
        company_capital: ["", Validators.required],
        type_of_capital: ["", Validators.required],
      }),
    });

    // Listen for changes in headquarters selection
    this.companyForm
      .get("headquarters")
      ?.valueChanges.subscribe((selectedHeadquarters: string[]) => {
        this.updateBranchLocations(selectedHeadquarters);
      });
  }

  getAdminCompanyById(id: any) {
    this.companyService.getAdminCompanyById(id).subscribe({
      next: (data) => {
        console.log(data);
        this.selectedCompany = data;
        this.companyForm.setValue({
          name: this.selectedCompany.name || "",
          headquarters: this.selectedCompany.headquarters || "",
          branch_locations: this.selectedCompany.branch_locations || "",
          activity: {
            details: this.selectedCompany.activity?.details || "",
            project_name: this.selectedCompany.activity?.project_name || "",
            location: this.selectedCompany.activity?.location || "",
          },
          legal_information: {
            legal_form:
              this.selectedCompany.legal_information?.legal_form || "",
            legal_status:
              this.selectedCompany.legal_information?.legal_status || "",
            sector: this.selectedCompany.legal_information?.sector || "",
            registration_date:
              this.selectedCompany.legal_information?.registration_date || "",
          },
          directors: this.selectedCompany.directors?.map((director: any) => ({
            name: director.name || "",
            role: director.role || "",
            signature: director.signature || "",
          })) || [
            {
              name: "",
              role: "",
              signature: "",
            },
          ],
          financial_information: {
            company_capital:
              this.selectedCompany.financial_information?.company_capital || "",
            type_of_capital:
              this.selectedCompany.financial_information?.type_of_capital || "",
          },
        });
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes["formType"] || changes["company"]) {
      if (this.formType === "Edit") {
        this.getAdminCompanyById(this.company?.id);
      }
    }
  }

  updateBranchLocations(selectedHeadquarters: string[]) {
    const selectedBranches = selectedHeadquarters.map((hq) => ({
      label: this.branchLocationsMap[hq],
      value: this.branchLocationsMap[hq],
    }));

    this.branchLocationsOptions = selectedBranches;

    this.companyForm
      .get("branch_locations")
      ?.setValue(selectedBranches.map((b) => b.value));
  }

  get directors(): FormArray {
    return this.companyForm.get("directors") as FormArray;
  }

  onSubmit() {
    if (this.formType === "Edit") {
      this.updateCompany();
    } else {
      this.addNewCompany();
    }
  }

  addNewCompany() {
    console.log(this.companyForm.value);

    if (this.companyForm.valid) {
      this.companyService.addCompany(this.companyForm.value).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: "success",
            summary: "Success",
            detail: "Company Added Succesffully",
          });
          if (this.loadAllCompanies) {
            console.log("Calling loadAllCompanies...");
            this.loadAllCompanies();
          } else {
            console.error("loadAllCompanies is undefined!");
          }
          this.companyForm.reset();
          this.onHide();
        },
        error: (error) => {
          console.error("Error adding company:", error);
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to add company.",
          });
        },
      });
    }
  }

  updateCompany() {
    if (this.companyForm.valid) {
      const directorIds = this.selectedCompany.directors.map((director: any) => director.id);
      const activityId = this.selectedCompany.activity.id;
      const legalInfoId = this.selectedCompany.legal_information.legal_form;
      const companyId = this.selectedCompany.id;
      const financialId = this.selectedCompany.financial_information.id;
  
      const administratorCompanies = {
        name: this.companyForm.value.name,
        headquarters: this.companyForm.value.headquarters,
        Branch_Locations: this.companyForm.value.branch_locations
      };
  
      const financialInformation = {
        company_capital: this.companyForm.value.financial_information.company_capital,
        type_of_capital: this.companyForm.value.financial_information.type_of_capital,
      };
  
      const legalInfo = {
        legal_form: this.companyForm.value.legal_information.legal_form,
        legal_status: this.companyForm.value.legal_information.legal_status,
        sector: this.companyForm.value.legal_information.sector,
        registration_date: this.companyForm.value.legal_information.registration_date,
      };
  
      const activities = {
        description: this.companyForm.value.activity.details,
        project_name: this.companyForm.value.activity.project_name,
        location: this.companyForm.value.activity.location,
      };
  
      this.companyService.updateDirector(directorIds, this.companyForm.value.directors[0])
        .pipe(
          switchMap(() => this.companyService.updateAdministratorCompanies(companyId, administratorCompanies)),
          switchMap(() => this.companyService.updateFinancialInformation(financialId, financialInformation)),
          switchMap(() => this.companyService.updateLegalInfo(legalInfoId, legalInfo)),
          switchMap(() => this.companyService.updateActivities(activityId, activities))
        )
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "Company Updated Successfully",
            });
            if (this.loadAllCompanies) {
              console.log("Calling loadAllCompanies...");
              this.loadAllCompanies();
            } else {
              console.error("loadAllCompanies is undefined!");
            }
            this.onHide();
          },
          error: (error) => {
            console.error("Error updating company:", error);
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: "Failed to update company.",
            });
          }
        });
    }
  }

  isMobile: boolean = false;
  onHide() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.companyForm.reset();
  }

  onEdit() {
    this.edit.emit();
  }

  onDelete() {
    this.delete.emit();
  }

  //My code
  addressForm!: FormGroup;

  get addresses(): FormArray {
    return this.addressForm.get("addresses") as FormArray;
  }

  removeAddress(index: number) {
    this.addresses.removeAt(index);
  }

  uploadedFiles: File[] = [];
  uploadSuccess = false;

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      this.uploadedFiles.push(...Array.from(target.files));
      this.uploadSuccess = true;
    }
  }

  removeFile(index: number): void {
    this.uploadedFiles.splice(index, 1);
  }

  previewFile(file: File): void {
    const url = URL.createObjectURL(file);
    window.open(url, "_blank");
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      this.uploadedFiles.push(...Array.from(event.dataTransfer.files));
      this.uploadSuccess = true;
    }
  }
}
function SECTOR_CHOICES(arg0: string, arg1: string) {
  throw new Error("Function not implemented.");
}


