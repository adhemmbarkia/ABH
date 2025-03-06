
export interface CompanyEmployee {
    id: number;
    name: string;
    headquarters: string;
    activity: Activity;
    legal_information: LegalInformation;
    directors: Director[];
    history: any[];
    financial_information: FinancialInformation;
    employee: string;
    uid: string;
    request_type: string;
    Branch_Locations: string;
    is_archived: boolean;
    approval_status: string;
  }

export interface Activity {
    id: number;
    details: string;
    project_name: string;
    location: string;
  }

  export interface LegalInformation {
    legal_form: number;
    legal_status: string;
    sector: string;
    registration_date: string;
    status_archived_update: string;
    request_type: string | null;
    pending_changes: any | null;
  }
  

  export interface Director {
    id: number;
    name: string;
    role: string;
    signature: string | null;
  }
  

  export interface FinancialInformation {
    id: number;
    company_capital: string;
    type_of_capital: string;
    pending_changes: any | null;
  }
  

