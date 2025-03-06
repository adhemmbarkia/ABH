import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewCompanyEmployeeModalComponent } from './view-company-employee-modal.component';



describe('ViewCompanyModal', () => {
  let component: ViewCompanyEmployeeModalComponent;
  let fixture: ComponentFixture<ViewCompanyEmployeeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCompanyEmployeeModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewCompanyEmployeeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
