import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { catchError, map, Observable } from "rxjs";
import { CompanyEmployee } from "../models/company-employee";
import { Company } from "../models/company.interface";
import { AddCompany } from "../models/add-company.model";
import { Director } from "../models/directors.interface";

@Injectable({
  providedIn: "root",
})
export class CompanyService {
  private API_URL = `${environment.apiUrl}`;

  constructor(private httpClient: HttpClient) {}


  
  getAllData(search: string) {
    const params = new HttpParams().set("search", search.toString());

    return this.httpClient.get(`${this.API_URL}/administrator-companies/employee-owned/`, { params });
  }


  /**
   * Adds a new company 
   * @param company - The company data to be added
   */
  addCompany(company: any) {
    return this.httpClient.post(
      `${this.API_URL}/administrator-companies/`,
      company
    );
  }
  

  /**
   * Retrieve all companies created by the admin
   * @param search Search query string
   * @param page Optional page number for pagination
   * @param pageSize Optional page size for pagination
   * @returns Observable with company count and results
   */
  getAllCompaniesCreatedByAdmin(
    search: string = "",
    page: number = 1,
    pageSize: number = 10
  ): Observable<any> {
    let params = new HttpParams()
      .set("search", search.toString())
      .set("page", page.toString())
      .set("page_size", pageSize.toString());

    return this.httpClient.get<any[]>(
      `${this.API_URL}/administrator-companies/admin-owned/`,
      { params }
    );
  }

  getAdminCompanyById(id: number): Observable<Company> {
    const url = `${this.API_URL}/administrator-companies/${id}/`;
    return this.httpClient.get<Company>(url, {});
  }

  acceptCompany(id: number): Observable<any> {
    const url = `${this.API_URL}/administrator/employee/companies/${id}/approve/`;
    return this.httpClient.patch(url, {});
  }

  rejectCompany(id: number): Observable<any> {
    const url = `${this.API_URL}/administrator/employee/companies/${id}/reject/`;
    return this.httpClient.patch(url, {});
  }

  archieveCompany(id: number): Observable<any> {
    const url = `${this.API_URL}/administrator-companies/${id}/archive/`;
    return this.httpClient.post(url, {});
  }

  updateDirector(id: number, director: Director): Observable<any> {
    const url = `${this.API_URL}/directors/${id}/`;
    return this.httpClient.patch(url, director);
  }

  updateActivities(id: number, activity: any): Observable<any> {
    const url = `${this.API_URL}/activities/${id}/`;
    return this.httpClient.patch(url, activity);
  }

  updateFinancialInformation(id: number, financial_information: any): Observable<any> {
    const url = `${this.API_URL}/financial-information/${id}/`;
    return this.httpClient.patch(url, financial_information);
  }

   updateLegalInfo(id: number, legal_info: any): Observable<any> {
    const url = `${this.API_URL}/legal-info/${id}/`;
    return this.httpClient.patch(url, legal_info);
  }

  updateAdministratorCompanies(id: number, administrator_companies: any): Observable<any> {
    const url = `${this.API_URL}/administrator-companies/${id}/`;
    return this.httpClient.patch(url, administrator_companies);
  }


}
