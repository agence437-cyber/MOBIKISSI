/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'PDG' | 'SUPERVISEUR' | 'CAISSIER' | 'RECOUVREUR' | 'CLIENT' | 'CALL_CENTER';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  agency: string;
  zone: string;
  status: 'active' | 'inactive';
  balance: number; // for clients
  createdAt: string;
  seniorityWeeks: number; // For assistance eligibility (must be >= 2 weeks)
  referralCode?: string; // e.g. "MOBI-AZER"
  referredBy?: string; // referrer code or uid
  streakDays?: number; // consecutive pointing days
  lastPointingDate?: string; // ISO date of last validated pointing
  badges?: string[]; // list of badge IDs
  baseSalary?: number; // for staff
  prime?: number; // for staff
  commission?: number; // for staff percentage or total
  internalNotes?: string[]; // Call Center & staff notes tracking
}

export interface Card {
  id: string;
  clientId: string;
  cardNumber: string;
  createdAt: string;
  amount: number; // 500, 1000, 2000, 5000, 10000 FCFA
  filledCells: number[]; // 1 to 30 for the client, 31 is MOBIKISSI
  isCompleted: boolean;
  rule31Applied: 'pending' | 'mobikissi_kept' | 'mobikissi_released';
}

export interface Transaction {
  id: string;
  type: 'depot' | 'retrait' | 'frais_ouverture';
  clientId: string;
  clientName: string;
  amount: number;
  agentId: string;
  agentName: string;
  createdAt: string;
  status: 'pending' | 'validated' | 'rejected';
  zone: string;
  agency: string;
  cardId?: string;
  cellIndex?: number;
}

export interface Assistance {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  domain: 'Commerce' | 'Agriculture' | 'Boutique' | 'Restaurant' | 'Élevage' | 'Transport' | 'Services' | 'Projets personnels';
  status: 'pending' | 'approved' | 'refused' | 'refunded';
  interestRate: number; // e.g. 22
  repaymentAmount: number; // amount + interest
  repaidAmount: number;
  createdAt: string;
  durationMonths: number;
  notes?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: 'deposit' | 'withdrawal' | 'assistance' | 'info';
}

export interface SystemSetting {
  platformName: string;
  logoUrl: string;
  address: string;
  phone1: string;
  phone2: string;
  email: string;
  description: string;
  defaultInterestRate: number; // 22%
  cellCount: number; // 31
  openingFee: number; // 500 FCFA
  rule31Config: string; // descriptive configuration
}

export interface SalaryConfig {
  role: UserRole;
  label: string;
  baseSalary: number;
  prime: number;
  commissionRate: number; // percentage on deposits
}

export interface ThemeColors {
  name: string;
  primary: string; // tailwind class e.g. "bg-blue-600 border-blue-600 text-blue-600"
  secondary: string;
  accent: string;
  gradientFrom: string;
  gradientTo: string;
  textMuted: string;
  badge: string;
}
