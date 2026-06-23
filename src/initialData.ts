/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Card, Transaction, Assistance, AppNotification, SystemSetting, SalaryConfig } from './types';

// Default system settings
export const DEFAULT_SETTINGS: SystemSetting = {
  platformName: 'MOBIKISSI',
  logoUrl: '', // Will use a beautiful custom SVG/icon inside the app
  address: 'Brazzaville, Quartier Massina PK, République du Congo',
  phone1: '+242 06 474 00 00',
  phone2: '+242 06 902 98 98',
  email: 'contact@mobikissi.cg',
  description: 'Épargner, Grandir, Réussir. Plateforme moderne de pointage, d\'épargne et d\'accompagnement entrepreneurial propulsée par TO SOLOLA Group.',
  defaultInterestRate: 22,
  cellCount: 31,
  openingFee: 500,
  rule31Config: 'Le 31ème carreau appartient à MOBIKISSI. Si le client ne termine pas sa carte conformément aux conditions, l\'avantage reste acquis à l\'entreprise.'
};

// Available Themes Configurations
export const THEMES_LIST = [
  {
    id: 'geometric_balance',
    name: 'Geometric Balance',
    primary: 'bg-orange-600',
    primaryText: 'text-orange-600',
    primaryBgHover: 'hover:bg-orange-500',
    accent: 'bg-slate-900',
    accentText: 'text-slate-950',
    gradient: 'from-orange-500 to-orange-600',
    focusRing: 'focus:ring-orange-500',
    border: 'border-slate-200'
  },
  {
    id: 'royal_blue',
    name: 'Bleu Royal',
    primary: 'bg-blue-600',
    primaryText: 'text-blue-600',
    primaryBgHover: 'hover:bg-blue-700',
    accent: 'bg-amber-500',
    accentText: 'text-amber-500',
    gradient: 'from-blue-600 to-indigo-800',
    focusRing: 'focus:ring-blue-500',
    border: 'border-blue-200'
  },
  {
    id: 'orange_premium',
    name: 'Orange Premium',
    primary: 'bg-orange-600',
    primaryText: 'text-orange-600',
    primaryBgHover: 'hover:bg-orange-700',
    accent: 'bg-cyan-500',
    accentText: 'text-cyan-500',
    gradient: 'from-orange-500 to-amber-600',
    focusRing: 'focus:ring-orange-500',
    border: 'border-orange-200'
  },
  {
    id: 'emerald_green',
    name: 'Vert Émeraude',
    primary: 'bg-emerald-600',
    primaryText: 'text-emerald-600',
    primaryBgHover: 'hover:bg-emerald-700',
    accent: 'bg-yellow-500',
    accentText: 'text-yellow-500',
    gradient: 'from-emerald-600 to-teal-800',
    focusRing: 'focus:ring-emerald-500',
    border: 'border-emerald-200'
  },
  {
    id: 'red_business',
    name: 'Rouge Business',
    primary: 'bg-red-600',
    primaryText: 'text-red-600',
    primaryBgHover: 'hover:bg-red-700',
    accent: 'bg-slate-700',
    accentText: 'text-slate-700',
    gradient: 'from-red-600 to-rose-800',
    focusRing: 'focus:ring-red-500',
    border: 'border-red-200'
  },
  {
    id: 'violet_luxury',
    name: 'Violet Luxe',
    primary: 'bg-purple-600',
    primaryText: 'text-purple-600',
    primaryBgHover: 'hover:bg-purple-700',
    accent: 'bg-amber-400',
    accentText: 'text-amber-400',
    gradient: 'from-purple-600 to-fuchsia-800',
    focusRing: 'focus:ring-purple-500',
    border: 'border-purple-200'
  },
  {
    id: 'black_gold',
    name: 'Noir Gold',
    primary: 'bg-slate-900',
    primaryText: 'text-slate-900',
    primaryBgHover: 'hover:bg-slate-800',
    accent: 'bg-amber-500',
    accentText: 'text-amber-500',
    gradient: 'from-zinc-900 to-neutral-800 border-amber-500',
    focusRing: 'focus:ring-amber-500',
    border: 'border-amber-300'
  },
  {
    id: 'turquoise',
    name: 'Turquoise',
    primary: 'bg-cyan-600',
    primaryText: 'text-cyan-600',
    primaryBgHover: 'hover:bg-cyan-700',
    accent: 'bg-rose-500',
    accentText: 'text-rose-500',
    gradient: 'from-cyan-500 to-teal-700',
    focusRing: 'focus:ring-cyan-500',
    border: 'border-cyan-200'
  },
  {
    id: 'corporate_gray',
    name: 'Gris Corporate',
    primary: 'bg-slate-700',
    primaryText: 'text-slate-700',
    primaryBgHover: 'hover:bg-slate-800',
    accent: 'bg-indigo-500',
    accentText: 'text-indigo-500',
    gradient: 'from-slate-600 to-zinc-800',
    focusRing: 'focus:ring-slate-500',
    border: 'border-slate-300'
  },
  {
    id: 'midnight_blue',
    name: 'Bleu Nuit',
    primary: 'bg-indigo-950',
    primaryText: 'text-indigo-950',
    primaryBgHover: 'hover:bg-indigo-900',
    accent: 'bg-orange-500',
    accentText: 'text-orange-500',
    gradient: 'from-indigo-950 to-blue-900',
    focusRing: 'focus:ring-indigo-500',
    border: 'border-indigo-800'
  },
  {
    id: 'prestige_yellow',
    name: 'Jaune Prestige',
    primary: 'bg-yellow-500',
    primaryText: 'text-yellow-600',
    primaryBgHover: 'hover:bg-yellow-600',
    accent: 'bg-stone-900',
    accentText: 'text-stone-950',
    gradient: 'from-yellow-500 to-amber-600',
    focusRing: 'focus:ring-yellow-500',
    border: 'border-yellow-200'
  }
];

export const INITIAL_USERS: User[] = [
  // Clients
  {
    id: 'u-client-1',
    name: 'Arnaud Malonga',
    role: 'CLIENT',
    email: 'arnaud@gmail.com',
    phone: '+242 06 511 22 33',
    agency: 'Agence Centrale (Massina PK)',
    zone: 'Zone A - Massina',
    status: 'active',
    balance: 45000,
    createdAt: '2026-05-10T10:00:00Z',
    seniorityWeeks: 5,
    referralCode: 'MOBI-ARNAUD',
    streakDays: 4,
    lastPointingDate: '2026-06-18T10:00:00Z',
    badges: ['milestone-debutant', 'milestone-active']
  },
  {
    id: 'u-client-2',
    name: 'Grace Bouanga',
    role: 'CLIENT',
    email: 'grace.b@gmail.com',
    phone: '+242 05 622 44 88',
    agency: 'Agence Ouenze',
    zone: 'Zone B - Ouenze',
    status: 'active',
    balance: 12500,
    createdAt: '1926-06-01T14:30:00Z', // More than 2 weeks
    seniorityWeeks: 3,
    referralCode: 'MOBI-GRACE',
    streakDays: 2,
    lastPointingDate: '2026-06-17T14:30:00Z',
    badges: ['milestone-debutant']
  },
  {
    id: 'u-client-3',
    name: 'Durel Gakosso',
    role: 'CLIENT',
    email: 'durel.g@gmail.com',
    phone: '+242 06 911 55 77',
    agency: 'Agence Talangaï',
    zone: 'Zone C - Talangaï',
    status: 'active',
    balance: 3000,
    createdAt: '2026-06-12T09:15:00Z', // Under 2 weeks! (Calculated relative to Jun 18, 2026)
    seniorityWeeks: 1,
    referralCode: 'MOBI-DUREL',
    streakDays: 0,
    badges: []
  },
  {
    id: 'u-client-4',
    name: 'Marielle Mboundzo',
    role: 'CLIENT',
    email: 'marielle@gmail.com',
    phone: '+242 05 444 66 11',
    agency: 'Agence Centrale (Massina PK)',
    zone: 'Zone A - Massina',
    status: 'active',
    balance: 85000,
    createdAt: '2026-04-10T08:00:00Z',
    seniorityWeeks: 9,
    referralCode: 'MOBI-MARIELLE',
    streakDays: 12,
    lastPointingDate: '2026-06-18T08:00:00Z',
    badges: ['milestone-debutant', 'milestone-active', 'milestone-champion', 'milestone-investor']
  },

  // Personnel (Staff)
  {
    id: 'u-recouvreur-1',
    name: 'Michel Nkoua',
    role: 'RECOUVREUR',
    email: 'michel.rec@mobikissi.cg',
    phone: '+242 06 411 22 22',
    agency: 'Agence Centrale (Massina PK)',
    zone: 'Zone A - Massina',
    status: 'active',
    balance: 0,
    createdAt: '2026-01-15T08:00:00Z',
    seniorityWeeks: 22,
    baseSalary: 120000,
    prime: 15000,
    commission: 4500 // Accumulating from collections
  },
  {
    id: 'u-recouvreur-2',
    name: 'Blaise Samba',
    role: 'RECOUVREUR',
    email: 'blaise.s@mobikissi.cg',
    phone: '+242 05 551 12 12',
    agency: 'Agence Talangaï',
    zone: 'Zone C - Talangaï',
    status: 'active',
    balance: 0,
    createdAt: '2026-02-10T08:00:00Z',
    seniorityWeeks: 18,
    baseSalary: 120000,
    prime: 10000,
    commission: 2000
  },
  {
    id: 'u-caissier-1',
    name: 'Sandrine Moundele',
    role: 'CAISSIER',
    email: 'sandrine.cai@mobikissi.cg',
    phone: '+242 06 822 33 44',
    agency: 'Agence Centrale (Massina PK)',
    zone: 'Zone A - Massina',
    status: 'active',
    balance: 0,
    createdAt: '2026-01-20T08:00:00Z',
    seniorityWeeks: 21,
    baseSalary: 180000,
    prime: 20000,
    commission: 0
  },
  {
    id: 'u-superviseur-1',
    name: 'Didier Yoka',
    role: 'SUPERVISEUR',
    email: 'didier.sup@mobikissi.cg',
    phone: '+242 06 944 66 88',
    agency: 'Agence Centrale (Massina PK)',
    zone: 'Toutes les Zones',
    status: 'active',
    balance: 0,
    createdAt: '2025-11-01T08:00:00Z',
    seniorityWeeks: 32,
    baseSalary: 250000,
    prime: 40000,
    commission: 0
  },
  {
    id: 'u-callcenter-1',
    name: 'Arnaud CallCenter',
    role: 'CALL_CENTER',
    email: 'arnaud.cc@mobikissi.cg',
    phone: '+242 06 500 11 22',
    agency: 'Agence Centrale (Massina PK)',
    zone: 'Zone A - Massina',
    status: 'active',
    balance: 0,
    createdAt: '2026-03-01T08:00:00Z',
    seniorityWeeks: 15,
    baseSalary: 150000,
    prime: 25000,
    commission: 0
  },
  {
    id: 'u-pdg-1',
    name: 'Dominique TO SOLOLA',
    role: 'PDG',
    email: 'pdg@mobikissi.cg',
    phone: '+242 06 474 00 00',
    agency: 'Direction Générale',
    zone: 'Toutes Zones',
    status: 'active',
    balance: 0,
    createdAt: '2025-01-01T08:00:00Z',
    seniorityWeeks: 76,
    baseSalary: 800000,
    prime: 150000,
    commission: 0
  }
];

export const INITIAL_CARDS: Card[] = [
  {
    id: 'card-1',
    clientId: 'u-client-1',
    cardNumber: 'CARTE-2026-001',
    createdAt: '2026-05-12T10:30:00Z',
    amount: 1000,
    filledCells: Array.from({ length: 24 }, (_, i) => i + 1), // Completed 24 cells out of 30
    isCompleted: false,
    rule31Applied: 'pending'
  },
  {
    id: 'card-2',
    clientId: 'u-client-1',
    cardNumber: 'CARTE-2026-002',
    createdAt: '2026-06-02T11:00:00Z',
    amount: 2000,
    filledCells: [1, 2, 3, 4, 5, 6, 7], // 7 cells filled
    isCompleted: false,
    rule31Applied: 'pending'
  },
  {
    id: 'card-3',
    clientId: 'u-client-2',
    cardNumber: 'CARTE-2026-003',
    createdAt: '2026-06-02T15:00:00Z',
    amount: 500,
    filledCells: Array.from({ length: 31 }, (_, i) => i + 1), // Fully completed client cells
    isCompleted: true,
    rule31Applied: 'mobikissi_kept' // Mobikissi advantage keeps 31st tile
  },
  {
    id: 'card-4',
    clientId: 'u-client-3',
    cardNumber: 'CARTE-2026-004',
    createdAt: '2026-06-12T09:30:00Z',
    amount: 1000,
    filledCells: [1, 2, 3], // New cards
    isCompleted: false,
    rule31Applied: 'pending'
  },
  {
    id: 'card-5',
    clientId: 'u-client-4',
    cardNumber: 'CARTE-2026-005',
    createdAt: '2026-04-12T09:00:00Z',
    amount: 5000,
    filledCells: Array.from({ length: 15 }, (_, i) => i + 1), // 15 cells filled
    isCompleted: false,
    rule31Applied: 'pending'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Arnaud Malonga setup
  {
    id: 't-1',
    type: 'frais_ouverture',
    clientId: 'u-client-1',
    clientName: 'Arnaud Malonga',
    amount: 500,
    agentId: 'u-recouvreur-1',
    agentName: 'Michel Nkoua',
    createdAt: '2026-05-10T10:05:00Z',
    status: 'validated',
    zone: 'Zone A - Massina',
    agency: 'Agence Centrale (Massina PK)'
  },
  {
    id: 't-2',
    type: 'depot',
    clientId: 'u-client-1',
    clientName: 'Arnaud Malonga',
    amount: 24000, // For Card-1 (24 cells * 1000)
    agentId: 'u-recouvreur-1',
    agentName: 'Michel Nkoua',
    createdAt: '2026-05-25T17:00:00Z',
    status: 'validated',
    zone: 'Zone A - Massina',
    agency: 'Agence Centrale (Massina PK)',
    cardId: 'card-1'
  },
  {
    id: 't-3',
    type: 'depot',
    clientId: 'u-client-1',
    clientName: 'Arnaud Malonga',
    amount: 14000, // For Card-2 (7 cells * 2000)
    agentId: 'u-recouvreur-1',
    agentName: 'Michel Nkoua',
    createdAt: '2026-06-10T16:30:00Z',
    status: 'validated',
    zone: 'Zone A - Massina',
    agency: 'Agence Centrale (Massina PK)',
    cardId: 'card-2'
  },

  // Grace Bouanga setup
  {
    id: 't-4',
    type: 'frais_ouverture',
    clientId: 'u-client-2',
    clientName: 'Grace Bouanga',
    amount: 500,
    agentId: 'u-recouvreur-1',
    agentName: 'Michel Nkoua',
    createdAt: '2026-06-01T14:35:00Z',
    status: 'validated',
    zone: 'Zone A - Massina', // Handled central
    agency: 'Agence Centrale (Massina PK)'
  },
  {
    id: 't-5',
    type: 'depot',
    clientId: 'u-client-2',
    clientName: 'Grace Bouanga',
    amount: 15000, // For Card-3 (30 cells * 500)
    agentId: 'u-recouvreur-1',
    agentName: 'Michel Nkoua',
    createdAt: '2026-06-15T15:45:00Z',
    status: 'validated',
    zone: 'Zone A - Massina',
    agency: 'Agence Centrale (Massina PK)',
    cardId: 'card-3'
  },

  // Durel Gakosso setup
  {
    id: 't-6',
    type: 'frais_ouverture',
    clientId: 'u-client-3',
    clientName: 'Durel Gakosso',
    amount: 500,
    agentId: 'u-recouvreur-2',
    agentName: 'Blaise Samba',
    createdAt: '2026-06-12T09:20:00Z',
    status: 'validated',
    zone: 'Zone C - Talangaï',
    agency: 'Agence Talangaï'
  },
  {
    id: 't-7',
    type: 'depot',
    clientId: 'u-client-3',
    clientName: 'Durel Gakosso',
    amount: 3000, // Card-4 (3 cells * 1000)
    agentId: 'u-recouvreur-2',
    agentName: 'Blaise Samba',
    createdAt: '2026-06-14T11:00:00Z',
    status: 'validated',
    zone: 'Zone C - Talangaï',
    agency: 'Agence Talangaï',
    cardId: 'card-4'
  },

  // Marielle Mboundzo setup
  {
    id: 't-8',
    type: 'frais_ouverture',
    clientId: 'u-client-4',
    clientName: 'Marielle Mboundzo',
    amount: 500,
    agentId: 'u-recouvreur-1',
    agentName: 'Michel Nkoua',
    createdAt: '2026-04-10T08:05:00Z',
    status: 'validated',
    zone: 'Zone A - Massina',
    agency: 'Agence Centrale (Massina PK)'
  },
  {
    id: 't-9',
    type: 'depot',
    clientId: 'u-client-4',
    clientName: 'Marielle Mboundzo',
    amount: 75000, // For Card-5 (15 cells * 5000)
    agentId: 'u-recouvreur-1',
    agentName: 'Michel Nkoua',
    createdAt: '2026-04-20T16:00:00Z',
    status: 'validated',
    zone: 'Zone A - Massina',
    agency: 'Agence Centrale (Massina PK)',
    cardId: 'card-5'
  },

  // Pending Actions for the Cashier to validate live in the UI!
  {
    id: 't-pending-1',
    type: 'depot',
    clientId: 'u-client-1',
    clientName: 'Arnaud Malonga',
    amount: 5000,
    agentId: 'u-recouvreur-1',
    agentName: 'Michel Nkoua',
    createdAt: '2026-06-18T14:20:00Z',
    status: 'pending',
    zone: 'Zone A - Massina',
    agency: 'Agence Centrale (Massina PK)'
  },
  {
    id: 't-pending-2',
    type: 'retrait',
    clientId: 'u-client-4',
    clientName: 'Marielle Mboundzo',
    amount: 10000,
    agentId: 'u-caissier-1',
    agentName: 'Sandrine Moundele',
    createdAt: '2026-06-18T15:00:00Z',
    status: 'pending',
    zone: 'Zone A - Massina',
    agency: 'Agence Centrale (Massina PK)'
  }
];

export const INITIAL_ASSISTANCES: Assistance[] = [
  {
    id: 'ast-1',
    clientId: 'u-client-1',
    clientName: 'Arnaud Malonga',
    amount: 50000,
    domain: 'Boutique',
    status: 'approved',
    interestRate: 22,
    repaymentAmount: 61000, // 50000 + 22%
    repaidAmount: 20000,
    createdAt: '2026-05-15T11:00:00Z',
    durationMonths: 3,
    notes: 'Achat de cartons de boisson et d\'épicerie pour approvisionner la boutique de Massina.'
  },
  {
    id: 'ast-2',
    clientId: 'u-client-4',
    clientName: 'Marielle Mboundzo',
    amount: 150000,
    domain: 'Élevage',
    status: 'pending',
    interestRate: 22,
    repaymentAmount: 183000, // 150000 + 22%
    repaidAmount: 0,
    createdAt: '2026-06-16T10:00:00Z',
    durationMonths: 6,
    notes: 'Rénovation d\'une petite porcherie et achat d\'aliments de bétail.'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n-1',
    userId: 'u-client-1',
    title: 'Nouveau versement validé',
    message: 'Votre pointage de 14 000 FCFA sur la carte CARTE-2026-002 a été validé par l\'administration.',
    createdAt: '2026-06-10T16:35:00Z',
    isRead: false,
    type: 'deposit'
  },
  {
    id: 'n-2',
    userId: 'u-client-1',
    title: 'Assistance Approuvée',
    message: 'Votre demande d\'assistance MOBIKISSI Business de 50 000 FCFA pour votre "Boutique" est validée à un taux de 22%.',
    createdAt: '2026-05-15T14:30:00Z',
    isRead: true,
    type: 'assistance'
  },
  {
    id: 'n-3',
    userId: 'u-client-4',
    title: 'Informations importantes',
    message: 'Bienvenue sur MOBIKISSI ! Votre adhésion a été enregistrée avec succès. Vous pouvez désormais souscrire à des cartes d\'épargne journalière.',
    createdAt: '2026-04-10T08:10:00Z',
    isRead: true,
    type: 'info'
  }
];

export const DEFAULT_SALARY_CONFIGS: SalaryConfig[] = [
  {
    role: 'SUPERVISEUR',
    label: 'Superviseur de Zone',
    baseSalary: 250000,
    prime: 40000,
    commissionRate: 0.5 // 0.5% on matches
  },
  {
    role: 'CAISSIER',
    label: 'Gestionnaire de Caisse',
    baseSalary: 180000,
    prime: 20000,
    commissionRate: 0.2
  },
  {
    role: 'RECOUVREUR',
    label: 'Agent Recouvreur / Collecteur',
    baseSalary: 120000,
    prime: 15000,
    commissionRate: 2.5 // 2.5% commission on collected deposits
  },
  {
    role: 'CALL_CENTER',
    label: 'Conseiller Call Center',
    baseSalary: 150000,
    prime: 25000,
    commissionRate: 0.1 // 0.1% on follow ups
  }
];

export const CONGO_AGENCIES = [
  'Agence Centrale (Massina PK)',
  'Agence Talangaï',
  'Agence Ouenze',
  'Agence Poto-Poto',
  'Agence Bacongo'
];

export const CONGO_ZONES = [
  'Zone A - Massina',
  'Zone B - Ouenze',
  'Zone C - Talangaï',
  'Zone D - Poto-Poto',
  'Zone E - Bacongo'
];
