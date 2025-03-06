export interface Company {
    //uid: string;
    companyName?: string;
    createdBy?: string;
    legalStatus?: 'Pending' | 'Active' |'Inactive';
    is_archived?:boolean ;
    status?: 'Published' | 'Archived';
    requestType?: string;
    approval_status?: string;
  //
    id?: any;
    name?: string;
    headquarters?: string;
    activity?: string;
    legal_information?: any;
    directors?: any[];
    history?: any[];
    financial_information?: any;
    employee?: string;
    uid?: string;
    request_type?: string;
    Branch_locations?: any;
  }


export interface CompanyDetails {
  createdBy: {
    fullName: string;
    registrationDate: string;
    email: string;
    avatar?: string;
  };
  companyInfo: {
    name: string;
    uid: string;
  };
  legalInfo: {
    legalForm: string;
    registrationName: string;
    legalStatus: string;
  };
  address: {
    headquarters: string;
    branchLocations: string;
  };
  management: {
    directors: string;
    signatories: string;
  };
  financialInfo?: any;
  historicalData?: any;
  legalDocuments?: any;
  industryClass?: any;
}