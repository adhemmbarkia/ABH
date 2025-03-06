  import {
    Component,
    Input,
    Output,
    EventEmitter,
    SimpleChanges,
    ViewChild,
  } from "@angular/core";
  import { CommonModule } from "@angular/common";
  import { DialogModule } from "primeng/dialog";
  import { ButtonModule } from "primeng/button";
  import { FileUpload, FileUploadModule } from 'primeng/fileupload';
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
      FileUploadModule,
    ],
    templateUrl: "./add-edit-company.component.html",
    styleUrl: "./add-edit-company.component.css",
    providers: [MessageService],
  })
  export class AddEditCompanyComponent {
    @ViewChild('fileInput') fileInput!: FileUpload;
    uploadedFiles: File[] = [];
    uploadSuccess = false;
    @Input() visible: boolean = false;
    @Input() formType: string = "";
    @Input() loadAllCompanies!: () => void;
    @Input() company: CompanyV | null = null;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() edit = new EventEmitter<void>();
    @Output() delete = new EventEmitter<void>();
    selectedCompany: any = {};

    companyForm!: FormGroup;
    
    isDragging = false;
    
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

    legalFormOptions!: LegalForm[];

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
        headquarters: [[], Validators.required],
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
        financial_report: [null, Validators.required] // Single file control
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
      if (this.companyForm.valid) {
        // Get the headquarters and branch locations fields
        const headquarters = this.companyForm.value.headquarters;
        const branchLocations = this.companyForm.value.branch_locations;
    
        // Ensure headquarters and branch_locations are arrays and format them as strings
        const formattedHeadquarters = Array.isArray(headquarters)
          ? headquarters.join(', ') // Join array elements into a string
          : String(headquarters); // Convert to string if not an array
    
        const formattedBranchLocations = Array.isArray(branchLocations)
          ? branchLocations.join(', ') // Join array elements into a string
          : String(branchLocations); // Convert to string if not an array
    
        // Log to verify the format of the headquarters and branch_locations
        console.log('Formatted Headquarters:', formattedHeadquarters);
        console.log('Formatted Branch Locations:', formattedBranchLocations);
    
        // Prepare the form data
        const formData = {
          ...this.companyForm.value,
          headquarters: formattedHeadquarters,
          branch_locations: formattedBranchLocations,
          // Convert numeric fields like legal_form if necessary
          legal_information: {
            ...this.companyForm.value.legal_information,
            legal_form: +this.companyForm.value.legal_information.legal_form // Ensure it's a number
          }
        };
    
        // Send the formatted data to the backend
        this.companyService.addCompany(formData).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Company added successfully'
            });
            this.resetForm();
          },
          error: (error) => {
            console.error('Error adding company:', error);
            this.handleError(error);
          }
        });
      }
    }
    
    private resetForm(): void {
      // Proper form reset with control-specific defaults
      this.companyForm.reset({
        headquarters: [],
        branch_locations: [],
        legal_information: {
          legal_form: '',
          legal_status: '',
          sector: '',
          registration_date: ''
        },
        financial_information: {
          company_capital: '',
          type_of_capital: ''
        }
      });
    
      // Clear file-related state
      this.uploadedFiles = [];
      
      // Safely clear PrimeNG file input
      if (this.fileInput) {
        this.fileInput.clear();
        this.fileInput._files = []; // PrimeNG internal state cleanup
      }
      
      // Reset validation states
      this.companyForm.markAsPristine();
      this.companyForm.markAsUntouched();
    }

    private handleError(error: any): void {
      let errorMessage = 'Failed to add company';
      const serverErrors = error.error;
    
      // Handle different error types
      if (typeof serverErrors === 'object') {
        // Handle multiple server validation errors
        const errorMessages = [];
        
        if (serverErrors.financial_report) {
          errorMessages.push(...this.parseFileErrors(serverErrors.financial_report));
        }
        
        if (serverErrors.non_field_errors) {
          errorMessages.push(...serverErrors.non_field_errors);
        }
    
        // Generic field errors
        for (const [field, messages] of Object.entries(serverErrors)) {
          if (field !== 'financial_report' && field !== 'non_field_errors') {
            errorMessages.push(`${field}: ${(messages as string[]).join(', ')}`);
          }
        }
    
        errorMessage = errorMessages.join('\n');
      } else if (typeof serverErrors === 'string') {
        errorMessage = serverErrors;
      }
    
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 7000  // Longer display for multi-line messages
      });
    }
    private parseFileErrors(errors: string[]): string[] {
      return errors.map(error => {
        if (error.includes('extension')) return 'Invalid file type. Only PDF files are allowed.';
        if (error.includes('size')) return 'File too large. Maximum size 5MB.';
        if (error.includes('required')) return 'Financial report is required.';
        return error;
      });
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

  
  

    // Update file handling methods
    onFileSelected(event: { files: File[] }): void {
      if (event.files && event.files.length > 0) {
        this.handleFile(event.files[0]);
      }
    }
    private handleFile(file: File): void {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = (reader.result as string).split(',')[1];
        this.companyForm.patchValue({
          financial_report: base64Data
        });
        this.uploadedFiles = [file]; // Store only the last uploaded file
        this.uploadSuccess = true;
      };
      reader.readAsDataURL(file);
    }
    // Update removeFile method
    removeFile(index: number): void {
      this.uploadedFiles.splice(index, 1);
      this.companyForm.patchValue({ financial_report: null });
      this.uploadSuccess = false;
      this.fileInput.clear(); // Clear the PrimeNG file input
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

    onDrop(event: DragEvent) {
      event.preventDefault();
      this.isDragging = false;
      
      const files = event.dataTransfer?.files;
      if (files && files.length > 0) {
        this.handleFile(files[0]);
      }
    }
  }
  function SECTOR_CHOICES(arg0: string, arg1: string) {
    throw new Error("Function not implemented.");
  }
