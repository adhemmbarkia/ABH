import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { map, Observable } from "rxjs";
import { Company } from "../models/company.interface";
import { LegalForm } from "../models/legal-form.model";

@Injectable({
  providedIn: "root",
})
export class EmployeeService {
  private API_URL = `${environment.apiUrl}`;

  constructor(private httpClient: HttpClient) {}

  getAllData(
    search: string
    //email:string, phone_number:string, unique_identifier:string, search:string, page: number, ordering: number
  ) {
    const params = new HttpParams()
      // .set('email', email.toString())
      // .set('phone_number', phone_number.toString())
      // .set('unique_identifier', unique_identifier.toString())
      .set("search", search.toString());
    // .set('page', page.toString())
    // .set('ordering', ordering.toString());

    return this.httpClient.get<{
      count: number;
      results: any[];
    }>(`${this.API_URL}/administrator/employees/list/`, { params });
  }

  approveUser(id: string): Observable<any> {
    console.log(id);
    return this.httpClient.patch(
      `${this.API_URL}/authentication/approve-user/${id}/`,
      {}
    );
  }

  rejectUser(id: string): Observable<any> {
    console.log(id);

    return this.httpClient.patch(
      `${this.API_URL}/authentication/reject-user/${id}/`,
      {}
    );
  }

  deleteUser(id: string): Observable<any> {
    return this.httpClient.delete(
      `${this.API_URL}/administrator/delete/${id}/`
    );
  }

  getCompanies(employeeId: string): Observable<Company[]> {
    return this.httpClient.get<Company[]>(
      `${this.API_URL}/administrator-companies/by-employee/?employee_id=${employeeId}`
    );
  }

  toggleBlockStatus(employeeId: string): Observable<any> {
    return this.httpClient.patch(
      `${this.API_URL}/administrator/block-unblock/${employeeId}/`,
      {}
    );
  }
  updateEmployee(employeeId: string, data: any): Observable<any> {
    return this.httpClient.patch(
      `${this.API_URL}/administrator/employees/${employeeId}/`,
      data
    );
  }

  updateProfile(employeeId: string, data: any): Observable<any> {
    return this.httpClient.put(`${this.API_URL}/administrator/profile/`, data);
  }

  //Get All Legal Forms
  getLegalForms(): Observable<LegalForm[]> {
    return this.httpClient
      .get<{ count: number; next: any; previous: any; results: LegalForm[] }>(
        `${this.API_URL}/employee/legal-forms/`
      )
      .pipe(map((response) => response.results));
  }

  getLegalFormById(id: number): Observable<string> {
    return this.httpClient.get<LegalForm>(
      `${this.API_URL}/employee/legal-forms/${id}/`
    ).pipe(
      map(dept => dept.name)
    );
  }
}
