export interface Employee {
    id:string;
    unique_identifier: string;
    username: string;
    email: string;
    phone_number: string;
    //accountStatus?: 'Pending Approval' | 'Active';
    is_approved?: boolean;
    is_blocked?: boolean;
    is_pending?: boolean;
    is_rejected?: boolean;
    role:string,
    totalCompanies?: number;
    avatar?: string;
    companies?:any;
    originalUsername?: string;
  }
