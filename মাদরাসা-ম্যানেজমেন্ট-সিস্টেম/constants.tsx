
import React from 'react';
import { 
  LayoutDashboard, Users, GraduationCap, Receipt, 
  Bot, FileText, Wallet, Settings, Database 
} from 'lucide-react';
import { AppView, Student, Teacher, Transaction, Fee } from './types';

export const NAV_ITEMS = [
  { id: AppView.DASHBOARD, label: 'ড্যাশবোর্ড', icon: <LayoutDashboard size={20} /> },
  { id: AppView.LEARNERS, label: 'শিক্ষার্থী তালিকা', icon: <GraduationCap size={20} /> },
  { id: AppView.TEACHERS, label: 'শিক্ষক তালিকা', icon: <Users size={20} /> },
  { id: AppView.RESULTS, label: 'ফলাফল', icon: <FileText size={20} /> },
  { id: AppView.FEES, label: 'ফিস কালেকশন', icon: <Receipt size={20} /> },
  { id: AppView.ACCOUNTING, label: 'আয়-ব্যয় হিসাব', icon: <Wallet size={20} /> },
  { id: AppView.AI_HELPER, label: 'এআই অ্যাসিস্ট্যান্ট', icon: <Bot size={20} /> },
  { id: AppView.SETTINGS, label: 'সেটিংস', icon: <Settings size={20} /> },
  { id: AppView.BACKUP, label: 'ডেটা ব্যাকআপ', icon: <Database size={20} /> },
];

export const MOCK_CLASSES = ['কায়দা', 'আমপারা', 'নাজেরা', 'হিফজ', 'মিশকাত', 'শরহে বেকায়া', 'কাফিয়া', 'দাওরায়ে হাদিস'];
export const MOCK_SESSIONS = ['২০২৩-২৪', '২০২৪-২৫', '২০২৫-২৬'];

export const MOCK_STUDENTS: Student[] = [
  { id: 'S001', name: 'আব্দুল্লাহ আল মারুফ', fatherName: 'মোহাম্মদ আলী', class: 'মিশকাত', roll: 12, phone: '01712345678', status: 'active', address: 'উত্তরা, ঢাকা', session: '২০২৪-২৫' },
  { id: 'S002', name: 'হাসান মাহমুদ', fatherName: 'আহমেদ হোসেন', class: 'শরহে বেকায়া', roll: 5, phone: '01812345678', status: 'active', address: 'মিরপুর, ঢাকা', session: '২০২৪-২৫' },
  { id: 'S003', name: 'উসমান গণি', fatherName: 'মুসা কলিম', class: 'কাফিয়া', roll: 20, phone: '01912345678', status: 'active', address: 'গাজীপুর', session: '২০২৩-২৪' },
];

export const MOCK_FEES: Fee[] = [
  { id: 'F001', studentName: 'আব্দুল্লাহ আল মারুফ', studentId: 'S001', studentClass: 'মিশকাত', studentRoll: 12, amount: 2500, month: 'জুলাই', type: 'মাসিক ফি', date: '2024-07-10', receivedBy: 'ক্যাশিয়ার' },
  { id: 'F002', studentName: 'হাসান মাহমুদ', studentId: 'S002', studentClass: 'শরহে বেকায়া', studentRoll: 5, amount: 1800, month: 'জুলাই', type: 'মাসিক ফি', date: '2024-07-12', receivedBy: 'ক্যাশিয়ার' },
];

export const MOCK_TEACHERS: Teacher[] = [
  { id: 'T001', name: 'মাওলানা আব্দুল হাই', designation: 'প্রধান মুহাদ্দিস', department: 'হাদিস', phone: '01711223344', image: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=400&h=400&fit=crop' },
  { id: 'T002', name: 'মাওলানা ইসমাইল', designation: 'সিনিয়র শিক্ষক', department: 'আদব', phone: '01811223344', image: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=400&h=400&fit=crop' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'TR001', type: 'Income', category: 'মাসিক ফি', amount: 25000, date: '2024-07-01', note: 'জুলাই মাসের কালেকশন', jammat: 'মিশকাত' },
  { id: 'TR002', type: 'Expense', category: 'বেতন', amount: 15000, date: '2024-07-05', note: 'উস্তাদের হাদিয়া' },
  { id: 'TR003', type: 'Income', category: 'দান', amount: 5000, date: '2024-07-10', note: 'মসজিদ ফান্ড' },
  { id: 'TR004', type: 'Income', category: 'ভর্তি ফি', amount: 12000, date: '2024-07-15', note: 'নতুন ছাত্র ভর্তি', jammat: 'কাফিয়া' },
];
