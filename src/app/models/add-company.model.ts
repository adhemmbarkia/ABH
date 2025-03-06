export interface AddCompany {
  name: string;
  headquarters: string;
  activity: {
    details: string;
    project_name: string;
    location: string;
  };
  legal_information: {
    legal_form: number;
    legal_status: 'Active' | 'Inactive' | 'Dissolved' | 'Bankrupt' | 'Pending Registration';
    sector: 'Raw Materials & Extraction' | 'Manufacturing & Industry' | 'Services & Commerce' | 'Knowledge & Innovation' | 'Public & Non-Profit Services';
    registration_date: string;
    status_archived_update:  string;
    request_type:  string;
    pending_changes: Record<string, unknown>;
  };
  directors: Array<{
    name: string;
    role: string;
    signature: string;
  }>;
  financial_information: {
    company_capital: string;
    type_of_capital: 'Based on Ownership Structure' | 'Based on Funding Source' | 'Based on Legal Classification';
    pending_changes: Record<string, unknown>;
  };
  uid: string;
  request_type: string;
  Branch_Locations: string;
  is_archived: boolean;
  approval_status: string;
}