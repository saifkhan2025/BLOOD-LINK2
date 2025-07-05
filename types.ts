export enum BloodGroup {
  APositive = 'A+',
  ANegative = 'A-',
  BPositive = 'B+',
  BNegative = 'B-',
  ABPositive = 'AB+',
  ABNegative = 'AB-',
  OPositive = 'O+',
  ONegative = 'O-',
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  password?: string; // Made optional as we don't want to pass it around everywhere
  bloodGroup: BloodGroup;
  phone: string;
  district: string;
  isActive: boolean;
}

export enum Page {
    Directory = 'DIRECTORY',
    Profile = 'PROFILE',
    // Admin = 'ADMIN' // Removed for now to simplify flow
}

export enum AuthPage {
    Login = 'LOGIN',
    Register = 'REGISTER',
}