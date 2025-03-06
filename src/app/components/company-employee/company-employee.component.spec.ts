import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyEmployeeComponent } from './company-employee.component';

describe('CompanyComponent', () => {
  let component: CompanyEmployeeComponent;
  let fixture: ComponentFixture<CompanyEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyEmployeeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
