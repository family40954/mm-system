
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  LEARNERS = 'LEARNERS',
  TEACHERS = 'TEACHERS',
  FEES = 'FEES',
  RESULTS = 'RESULTS',
  ACCOUNTING = 'ACCOUNTING',
  AI_HELPER = 'AI_HELPER',
  SETTINGS = 'SETTINGS',
  BACKUP = 'BACKUP'
}

export interface MadrasaProfile {
  name: string;
  address: string;
  establishedYear: string;
  logo: string;
  phone: string;
  adminPassword: string;
}

export interface Student {
  id: string;
  name: string;
  fatherName: string;
  class: string;
  roll: number;
  phone: string;
  status: 'active' | 'inactive';
  address: string;
  session: string;
}

export interface SubjectMark {
  subjectName: string;
  mark: number | null;
}

export interface ExamResult {
  id: string;
  studentId: string;
  studentName: string;
  roll: number;
  class: string;
  session: string;
  examType: string;
  marks: SubjectMark[];
  totalMarks: number;
  average: number;
  grade: string;
  meritPosition?: number;
  status: 'Pass' | 'Fail' | 'Absent' | 'Suspended';
}

export interface Transaction {
  id: string;
  type: 'Income' | 'Expense';
  category: string;
  amount: number;
  date: string;
  note: string;
  jammat?: string;
}

export interface Teacher {
  id: string;
  name: string;
  designation: string;
  department: string;
  phone: string;
  image: string;
}

export interface Fee {
  id: string;
  studentName: string;
  studentId: string;
  studentClass: string;
  studentRoll: number;
  amount: number;
  month: string;
  type: string;
  date: string;
  receivedBy: string;
}
