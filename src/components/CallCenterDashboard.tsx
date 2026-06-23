/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Phone, Users, AlertCircle, HeartHandshake, Calendar, Megaphone, 
  Bell, BarChart2, User, PhoneCall, CheckCircle2, X, Plus, Search, 
  Eye, EyeOff, Save, Trash2, ArrowRight, UserPlus, Filter, Clock, 
  FileText, ChevronRight, Download, Send, RefreshCw, Star, MapPin, 
  Mail, MessageSquare, Check, ShieldAlert, TrendingUp, AlertTriangle, 
  Briefcase, Activity, ShieldCheck, PhoneForwarded, PhoneMissed, PhoneIncoming
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType, Card, Assistance, AppNotification, SystemSetting } from '../types';

interface CallCenterDashboardProps {
  agent: UserType;
  allUsers: UserType[];
  cards: Card[];
  assistances: Assistance[];
  notifications: AppNotification[];
  settings: SystemSetting;
  selectedTheme: any;
  setUsers: React.Dispatch<React.SetStateAction<UserType[]>>;
  permissions?: {
    showBalance: boolean;
    showCards: boolean;
    createAppointments: boolean;
    createClaims: boolean;
    sendSms: boolean;
    viewAssistances: boolean;
    viewRefunds: boolean;
    accessReports: boolean;
    viewPersonalInfo: boolean;
    exportData: boolean;
  };
}

interface CallRecord {
  id: string;
  clientName: string;
  phone: string;
  type: 'incoming' | 'outgoing' | 'missed';
  time: string;
  duration?: string;
  notes: string;
  status: 'completed' | 'callback_scheduled' | 'no_answer';
}

interface Appointment {
  id: string;
  clientName: string;
  phone: string;
  type: 'agency' | 'assistance' | 'refund' | 'commercial';
  date: string;
  time: string;
  notes: string;
  status: 'scheduled' | 'done' | 'cancelled';
}

interface Claim {
  id: string;
  clientName: string;
  phone: string;
  category: 'client_claim' | 'deposit_error' | 'lost_card' | 'processing_delay' | 'withdrawal_issue';
  title: string;
  notes: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  zone: string;
  status: 'lead' | 'interested' | 'to_follow' | 'converted';
  notes: string;
  createdAt: string;
}

export default function CallCenterDashboard({
  agent,
  allUsers,
  cards,
  assistances,
  notifications,
  settings,
  selectedTheme,
  setUsers,
  permissions = {
    showBalance: true,
    showCards: true,
    createAppointments: true,
    createClaims: true,
    sendSms: true,
    viewAssistances: true,
    viewRefunds: true,
    accessReports: true,
    viewPersonalInfo: true,
    exportData: true
  }
}: CallCenterDashboardProps) {

  // Current sub-view state
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Local storage lists for call center specific operations
  const [calls, setCalls] = useState<CallRecord[]>(() => {
    const saved = localStorage.getItem('mobikissi_cc_calls');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'c-1', clientName: 'Alice Massengo', phone: '+242 06 912 34 56', type: 'incoming', time: '10:15', duration: '2m 14s', notes: 'Renseignements sur le taux d\'éligibilité pour un crédit boutique.', status: 'completed' },
      { id: 'c-2', clientName: 'Paul Samba', phone: '+242 05 523 11 22', type: 'outgoing', time: '09:40', duration: '1m 05s', notes: 'Relance versement carte #2026-001. A promis de verser cet après-midi.', status: 'completed' },
      { id: 'c-3', clientName: 'Michel Ngolo', phone: '+242 06 855 44 33', type: 'missed', time: '09:12', notes: 'Appel manqué durant pause café.', status: 'no_answer' },
      { id: 'c-4', clientName: 'Clarisse Nzete', phone: '+242 05 321 99 88', type: 'outgoing', time: '08:30', notes: 'Planification rappel pour vendredi concernant réclamation carte perdue.', status: 'callback_scheduled' }
    ];
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('mobikissi_cc_appointments');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'a-1', clientName: 'Paul Samba', phone: '+242 05 523 11 22', type: 'agency', date: '2026-06-24', time: '10:00', notes: 'Rendez-vous pour finaliser la clôture de la carte.', status: 'scheduled' },
      { id: 'a-2', clientName: 'Alice Massengo', phone: '+242 06 912 34 56', type: 'assistance', date: '2026-06-25', time: '14:30', notes: 'Rendez-vous comité d\'assistance crédit Commerce.', status: 'scheduled' }
    ];
  });

  const [claims, setClaims] = useState<Claim[]>(() => {
    const saved = localStorage.getItem('mobikissi_cc_claims');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'cl-1', clientName: 'Clarisse Nzete', phone: '+242 05 321 99 88', category: 'lost_card', title: 'Perte de carte de pointage', notes: 'Le client a égaré sa carte physique à Massina. Demande de duplicata.', status: 'open', createdAt: '2026-06-18' },
      { id: 'cl-2', clientName: 'Michel Ngolo', phone: '+242 06 855 44 33', category: 'deposit_error', title: 'Erreur de saisie versement', notes: 'L\'agent Blaise a coché 2 cases au lieu de 3 hier.', status: 'in_progress', createdAt: '2026-06-19' }
    ];
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('mobikissi_cc_leads');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'l-1', name: 'Jean-Pierre Makosso', phone: '+242 06 441 22 33', zone: 'Zone A - Massina', status: 'lead', notes: 'Intéressé par l\'épargne journalière pour sa menuiserie.', createdAt: '2026-06-18' },
      { id: 'l-2', name: 'Maman Clotilde', phone: '+242 05 750 90 90', zone: 'Zone B - Ouenze', status: 'interested', notes: 'Veut une carte de 2000 FCFA pour son étal de beignets.', createdAt: '2026-06-19' },
      { id: 'l-3', name: 'Sylvain Bouanga', phone: '+242 06 990 12 34', zone: 'Zone C - Talangaï', status: 'to_follow', notes: 'Sceptique mais demande une relance ce vendredi.', createdAt: '2026-06-15' }
    ];
  });

  const [campaignLogs, setCampaignLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem('mobikissi_cc_campaigns');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'cam-1', title: 'Information Assistances Commerciales', target: 'Zone A - Massina', count: 42, message: 'Chers adhérents, les dossiers d\'accompagnement pour le commerce sont ouverts. Contactez-nous !', date: '2026-06-15' }
    ];
  });

  // Local notifications (Call Center tasks)
  const [ccNotifications, setCcNotifications] = useState<string[]>([
    "🔔 Nouvelle réclamation soumise par Clarisse Nzete (Carte perdue)",
    "🔔 Rappel : Relancer Paul Samba aujourd'hui à 15h00",
    "🔔 Nouvelle demande d'assistance en attente d'évaluation"
  ]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('mobikissi_cc_calls', JSON.stringify(calls));
  }, [calls]);

  useEffect(() => {
    localStorage.setItem('mobikissi_cc_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('mobikissi_cc_claims', JSON.stringify(claims));
  }, [claims]);

  useEffect(() => {
    localStorage.setItem('mobikissi_cc_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('mobikissi_cc_campaigns', JSON.stringify(campaignLogs));
  }, [campaignLogs]);

  // Toast notice
  const [toastMsg, setToastMsg] = useState('');
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Dial Simulator Modal
  const [dialingClient, setDialingClient] = useState<{ name: string; phone: string } | null>(null);
  const [dialingNotes, setDialingNotes] = useState('');
  const [dialingStatus, setDialingStatus] = useState<'completed' | 'no_answer' | 'callback_scheduled'>('completed');

  const startSimulatedCall = (name: string, phone: string) => {
    setDialingClient({ name, phone });
    setDialingNotes('');
    setDialingStatus('completed');
  };

  const endSimulatedCall = () => {
    if (!dialingClient) return;
    const newCall: CallRecord = {
      id: `c-${Date.now()}`,
      clientName: dialingClient.name,
      phone: dialingClient.phone,
      type: 'outgoing',
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      duration: dialingStatus === 'completed' ? `${Math.floor(Math.random() * 3) + 1}m ${Math.floor(Math.random() * 50) + 10}s` : undefined,
      notes: dialingNotes || 'Aucune note ajoutée.',
      status: dialingStatus
    };
    setCalls(prev => [newCall, ...prev]);
    triggerToast(`☎️ Appel avec ${dialingClient.name} enregistré.`);
    
    // Also save in client internal notes if it was a real client!
    const clientUserObj = allUsers.find(u => u.phone === dialingClient.phone || u.name === dialingClient.name);
    if (clientUserObj) {
      const formattedNote = `[Appel ${newCall.time}] ${newCall.notes} (Statut: ${newCall.status})`;
      setUsers(prev => prev.map(u => u.id === clientUserObj.id ? {
        ...u,
        internalNotes: [formattedNote, ...(u.internalNotes || [])]
      }: u));
    }

    setDialingClient(null);
  };

  // Compute stats
  const clients = useMemo(() => allUsers.filter(u => u.role === 'CLIENT'), [allUsers]);

  const callsTodayCount = useMemo(() => calls.length, [calls]);
  const contactedClientsCount = useMemo(() => new Set(calls.map(c => c.phone)).size, [calls]);
  const appointmentsCount = useMemo(() => appointments.filter(a => a.status === 'scheduled').length, [appointments]);
  const claimsCount = useMemo(() => claims.filter(c => c.status !== 'closed').length, [claims]);

  // Clients with no payments in 7, 15, 30 days
  const inactiveClients = useMemo(() => {
    // Current simulated date is 2026-06-23
    const refDate = new Date('2026-06-23');
    return clients.map(client => {
      // Find last pointing transaction
      const lastDateStr = client.lastPointingDate || client.createdAt;
      const diffTime = Math.abs(refDate.getTime() - new Date(lastDateStr).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { client, diffDays };
    }).filter(item => item.diffDays >= 7);
  }, [clients]);

  const inactive7Days = useMemo(() => inactiveClients.filter(i => i.diffDays >= 7 && i.diffDays < 15), [inactiveClients]);
  const inactive15Days = useMemo(() => inactiveClients.filter(i => i.diffDays >= 15 && i.diffDays < 30), [inactiveClients]);
  const inactive30Days = useMemo(() => inactiveClients.filter(i => i.diffDays >= 30), [inactiveClients]);

  // Cards close to finish (80%, 90% progress, or completed)
  const cardsCloseToFinish = useMemo(() => {
    return cards.map(card => {
      const owner = clients.find(cl => cl.id === card.clientId);
      const progressPercent = Math.round((card.filledCells.length / 30) * 100);
      return { card, owner, progressPercent };
    });
  }, [cards, clients]);

  const progress80 = useMemo(() => cardsCloseToFinish.filter(c => c.progressPercent >= 80 && c.progressPercent < 90 && !c.card.isCompleted), [cardsCloseToFinish]);
  const progress90 = useMemo(() => cardsCloseToFinish.filter(c => c.progressPercent >= 90 && !c.card.isCompleted), [cardsCloseToFinish]);
  const progressCompleted = useMemo(() => cardsCloseToFinish.filter(c => c.card.isCompleted), [cardsCloseToFinish]);

  // Assistance requests
  const pendingAssistances = useMemo(() => assistances.filter(a => a.status === 'pending'), [assistances]);
  const approvedAssistances = useMemo(() => assistances.filter(a => a.status === 'approved'), [assistances]);
  const eligibleForAssistance = useMemo(() => {
    return clients.filter(c => (c.seniorityWeeks || 0) >= 2 && c.balance >= 5000 && !assistances.some(a => a.clientId === c.id));
  }, [clients, assistances]);

  // Inspected client object
  const activeInspectedClient = useMemo(() => {
    return clients.find(c => c.id === selectedClientId) || null;
  }, [clients, selectedClientId]);

  // Appointment Creator State
  const [aptClientName, setAptClientName] = useState('');
  const [aptPhone, setAptPhone] = useState('');
  const [aptType, setAptType] = useState<'agency' | 'assistance' | 'refund' | 'commercial'>('agency');
  const [aptDate, setAptDate] = useState('2026-06-24');
  const [aptTime, setAptTime] = useState('11:00');
  const [aptNotes, setAptNotes] = useState('');

  const handleCreateAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissions.createAppointments) {
      triggerToast('🔒 Droits requis : Création de rendez-vous désactivée par le PDG.');
      return;
    }
    const newApt: Appointment = {
      id: `a-${Date.now()}`,
      clientName: aptClientName,
      phone: aptPhone,
      type: aptType,
      date: aptDate,
      time: aptTime,
      notes: aptNotes,
      status: 'scheduled'
    };
    setAppointments(prev => [newApt, ...prev]);
    
    // Add internal notes to client
    const clientUserObj = allUsers.find(u => u.phone === aptPhone || u.name === aptClientName);
    if (clientUserObj) {
      setUsers(prev => prev.map(u => u.id === clientUserObj.id ? {
        ...u,
        internalNotes: [`[Rdv Programmé le ${aptDate} à ${aptTime}] Type: ${aptType}. Notes: ${aptNotes}`, ...(u.internalNotes || [])]
      } : u));
    }

    triggerToast(`📅 Rendez-vous programmé pour ${aptClientName}.`);
    setAptClientName('');
    setAptPhone('');
    setAptNotes('');
  };

  // Claims Creator State
  const [claimClientName, setClaimClientName] = useState('');
  const [claimPhone, setClaimPhone] = useState('');
  const [claimCategory, setClaimCategory] = useState<'client_claim' | 'deposit_error' | 'lost_card' | 'processing_delay' | 'withdrawal_issue'>('client_claim');
  const [claimTitle, setClaimTitle] = useState('');
  const [claimNotes, setClaimNotes] = useState('');

  const handleCreateClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissions.createClaims) {
      triggerToast('🔒 Droits requis : Dépôt de réclamation désactivé par le PDG.');
      return;
    }
    const newClaim: Claim = {
      id: `cl-${Date.now()}`,
      clientName: claimClientName,
      phone: claimPhone,
      category: claimCategory,
      title: claimTitle,
      notes: claimNotes,
      status: 'open',
      createdAt: new Date().toISOString().substring(0, 10)
    };
    setClaims(prev => [newClaim, ...prev]);

    // Add internal notes to client
    const clientUserObj = allUsers.find(u => u.phone === claimPhone || u.name === claimClientName);
    if (clientUserObj) {
      setUsers(prev => prev.map(u => u.id === clientUserObj.id ? {
        ...u,
        internalNotes: [`[Réclamation Ouverte] ${claimTitle}. Notes: ${claimNotes}`, ...(u.internalNotes || [])]
      } : u));
    }

    triggerToast(`📝 Réclamation "${claimTitle}" enregistrée.`);
    setClaimClientName('');
    setClaimPhone('');
    setClaimTitle('');
    setClaimNotes('');
  };

  // Campaigns State
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignZone, setCampaignZone] = useState('Zone A - Massina');
  const [campaignMsg, setCampaignMsg] = useState('');

  const handleSendCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissions.sendSms) {
      triggerToast('🔒 Droits requis : Envoi de SMS en masse bloqué par le PDG.');
      return;
    }
    const targetClients = clients.filter(c => c.zone === campaignZone);
    const newLog = {
      id: `cam-${Date.now()}`,
      title: campaignTitle,
      target: campaignZone,
      count: targetClients.length,
      message: campaignMsg,
      date: new Date().toISOString().substring(0, 10)
    };
    setCampaignLogs(prev => [newLog, ...prev]);
    triggerToast(`📢 Campagne envoyée avec succès à ${targetClients.length} clients.`);
    setCampaignTitle('');
    setCampaignMsg('');
  };

  // Note Creator State (inside client file)
  const [newInternalNoteText, setNewInternalNoteText] = useState('');
  const handleAddInternalNote = (clientId: string) => {
    if (!newInternalNoteText.trim()) return;
    setUsers(prev => prev.map(u => u.id === clientId ? {
      ...u,
      internalNotes: [`[Note du Call Center] ${newInternalNoteText}`, ...(u.internalNotes || [])]
    } : u));
    setNewInternalNoteText('');
    triggerToast('✓ Note de suivi ajoutée.');
  };

  // SMS Individual Composer
  const [smsClientName, setSmsClientName] = useState<string | null>(null);
  const [smsPhone, setSmsPhone] = useState('');
  const [smsText, setSmsText] = useState('');

  const sendSingleSms = () => {
    if (!permissions.sendSms) {
      triggerToast('🔒 Droits requis : Envoi de SMS désactivé.');
      return;
    }
    triggerToast(`✓ SMS envoyé à ${smsClientName || smsPhone}.`);
    
    const clientUserObj = allUsers.find(u => u.phone === smsPhone || u.name === smsClientName);
    if (clientUserObj) {
      setUsers(prev => prev.map(u => u.id === clientUserObj.id ? {
        ...u,
        internalNotes: [`[SMS envoyé] ${smsText}`, ...(u.internalNotes || [])]
      } : u));
    }

    setSmsClientName(null);
    setSmsText('');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 text-slate-800 dark:text-slate-100 font-sans min-h-screen">
      
      {/* LEFT STATIC MENU / SIDEBAR */}
      <aside className="w-full lg:w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex flex-col justify-between shrink-0 h-fit space-y-6">
        <div>
          {/* Active Call Center Agent Profile */}
          <div className="flex items-center gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className={`w-10 h-10 rounded-2xl ${selectedTheme.primary} flex items-center justify-center text-white font-black text-sm relative`}>
              <PhoneCall className="w-5 h-5" />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-widest font-black text-indigo-505 dark:text-indigo-400 font-mono">CONSEILLER RELATION</span>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">{agent.name}</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">{agent.email}</p>
            </div>
          </div>

          {/* MENUS STRIP */}
          <nav className="space-y-1.5 mt-5">
            {[
              { id: 'dashboard', label: 'Tableau de Bord', icon: <Activity className="w-4.5 h-4.5" /> },
              { id: 'calls', label: 'Appels', icon: <Phone className="w-4.5 h-4.5" />, badge: callsTodayCount },
              { id: 'clients', label: 'Clients', icon: <Users className="w-4.5 h-4.5" /> },
              { id: 'inactivity', label: 'Clients Inactifs', icon: <AlertTriangle className="w-4.5 h-4.5" />, badge: inactiveClients.length, isAlert: true },
              { id: 'cards-progress', label: 'Suivi Cartes', icon: <CheckCircle2 className="w-4.5 h-4.5" />, badge: progress90.length },
              { id: 'assistance', label: 'Assistance', icon: <HeartHandshake className="w-4.5 h-4.5" />, badge: pendingAssistances.length },
              { id: 'claims', label: 'Réclamations', icon: <AlertCircle className="w-4.5 h-4.5" />, badge: claimsCount },
              { id: 'appointments', label: 'Rendez-vous', icon: <Calendar className="w-4.5 h-4.5" />, badge: appointmentsCount },
              { id: 'campaigns', label: 'Campagnes SMS', icon: <Megaphone className="w-4.5 h-4.5" /> },
              { id: 'suivi-commercial', label: 'Suivi Commercial', icon: <Briefcase className="w-4.5 h-4.5" /> },
              { id: 'reports', label: 'Rapports d\'activité', icon: <BarChart2 className="w-4.5 h-4.5" /> }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setActiveMenu(m.id);
                  setSelectedClientId(null);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-black flex items-center justify-between transition-all cursor-pointer ${
                  activeMenu === m.id 
                    ? `${selectedTheme.primary} text-white shadow-md` 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {m.icon}
                  <span>{m.label}</span>
                </div>
                {m.badge !== undefined && m.badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold ${m.isAlert ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300'}`}>
                    {m.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* PROUD BRAND FOOTER */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850/40 text-center">
          <span className="block text-[9px] font-black uppercase text-indigo-550 dark:text-indigo-400 font-mono">CALL CENTER MODULE</span>
          <span className="block text-[8px] text-slate-450 mt-0.5">MOBIKISSI Relation Client</span>
        </div>
      </aside>

      {/* RIGHT DETAIL WORKSPACE */}
      <section className="flex-grow space-y-6">

        {/* SIMULATED TOAST MESSAGE */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-5 right-5 z-50 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 text-xs font-bold"
            >
              <Activity className="w-4.5 h-4.5 text-indigo-400 animate-spin" />
              <span>{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DIAL WINDOW POPUP MODAL */}
        <AnimatePresence>
          {dialingClient && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl w-full max-w-md shadow-2xl space-y-4"
              >
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto animate-pulse">
                    <PhoneCall className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-emerald-500 font-black">Appel Sortant En Cours...</span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">{dialingClient.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">{dialingClient.phone}</p>
                  </div>
                </div>

                <div className="space-y-3.5 pt-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 font-mono mb-1.5">Note de conversation</label>
                    <textarea
                      placeholder="Saisissez un résumé de l'appel (Ex: Absent, Promesse de versement, Changement d'adresse...)"
                      value={dialingNotes}
                      onChange={(e) => setDialingNotes(e.target.value)}
                      className="w-full h-24 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 font-mono mb-1.5">Statut de l'appel</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'completed', label: 'Abouti', bg: 'bg-emerald-50 border-emerald-500' },
                        { id: 'no_answer', label: 'Occupé/Pas de réponse', bg: 'bg-rose-50 border-rose-500' },
                        { id: 'callback_scheduled', label: 'À rappeler', bg: 'bg-amber-50 border-amber-500' }
                      ].map(st => (
                        <button
                          key={st.id}
                          onClick={() => setDialingStatus(st.id as any)}
                          className={`p-2.5 rounded-xl border text-[10px] font-bold text-center transition cursor-pointer ${
                            dialingStatus === st.id 
                              ? 'bg-indigo-500 text-white border-indigo-500' 
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setDialingClient(null)}
                    className="flex-grow py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={endSimulatedCall}
                    className="flex-grow py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer"
                  >
                    Enregistrer l'Appel
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* SMS MODAL */}
        <AnimatePresence>
          {smsClientName && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl w-full max-w-md shadow-2xl space-y-4"
              >
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-indigo-550" />
                    Envoyer SMS Individuel
                  </h3>
                  <button onClick={() => setSmsClientName(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-405 font-mono mb-1">Destinataire</label>
                    <input
                      type="text"
                      disabled
                      value={`${smsClientName} (${smsPhone})`}
                      className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2 px-3 text-xs font-bold text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-405 font-mono mb-1">Message SMS</label>
                    <textarea
                      placeholder="Saisissez votre message..."
                      value={smsText}
                      onChange={(e) => setSmsText(e.target.value)}
                      className="w-full h-32 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 rounded-xl p-3 text-xs focus:outline-none"
                    />
                    <div className="flex justify-between items-center mt-1 text-[10px] text-slate-400">
                      <span>{smsText.length} caractères</span>
                      <span>1 SMS (max 160)</span>
                    </div>
                  </div>

                  {/* Template triggers */}
                  <div>
                    <span className="block text-[9px] font-black uppercase text-slate-400 font-mono mb-1">Modèles rapides</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: 'Relance versement', text: 'Bonjour, nous constatons qu\'aucun versement n\'a été fait cette semaine. Un agent est à votre disposition.' },
                        { label: 'Rappel Rendez-vous', text: 'Bonjour, nous vous confirmons votre rendez-vous à l\'agence demain pour votre suivi.' },
                        { label: 'Assistance Éligible', text: 'Félicitations, vous êtes éligible pour un accompagnement entrepreneurial de projet MOBIKISSI. Contactez-nous !' }
                      ].map((tmpl, i) => (
                        <button
                          key={i}
                          onClick={() => setSmsText(tmpl.text)}
                          className="px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[9px] font-semibold border border-slate-100 dark:border-slate-700 cursor-pointer"
                        >
                          {tmpl.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setSmsClientName(null)}
                    className="flex-grow py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={sendSingleSms}
                    className="flex-grow py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black cursor-pointer"
                  >
                    Envoyer le SMS
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 1. VIEW: TABLEAU DE BORD (HUD MAIN) */}
        {activeMenu === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Header banner */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[9px] tracking-widest uppercase font-black text-indigo-400 font-mono">MOBIKISSI CALL CENTER</span>
                <h1 className="text-xl font-black uppercase tracking-tight text-white mt-1">Supervision relation client</h1>
                <p className="text-xs text-slate-400 mt-1">Assurer le lien social, relancer les adhérents et accélérer l'accès aux micro-financements.</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono bg-slate-800/40 border border-slate-800 px-3 py-1.5 rounded-xl">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Simulé: 2026-06-23</span>
              </div>
            </div>

            {/* DENSE GRID HUD STATISTICS */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center flex flex-col justify-between h-24">
                <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Appels du jour</span>
                <span className="text-xl font-black text-indigo-600 font-mono block">{callsTodayCount}</span>
                <span className="text-[8px] text-slate-450 font-medium">Entrants / Sortants</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center flex flex-col justify-between h-24">
                <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Clients Contactés</span>
                <span className="text-xl font-black text-purple-600 font-mono block">{contactedClientsCount}</span>
                <span className="text-[8px] text-slate-450 font-medium">Numéros Uniques</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center flex flex-col justify-between h-24">
                <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Rdv Planifiés</span>
                <span className="text-xl font-black text-emerald-600 font-mono block">{appointmentsCount}</span>
                <span className="text-[8px] text-slate-450 font-medium">En agence ou projet</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center flex flex-col justify-between h-24">
                <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Réclamations</span>
                <span className="text-xl font-black text-rose-600 font-mono block">{claimsCount}</span>
                <span className="text-[8px] text-slate-450 font-medium">Billets en attente</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center flex flex-col justify-between h-24">
                <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Clients Inactifs</span>
                <span className="text-xl font-black text-amber-500 font-mono block">{inactiveClients.length}</span>
                <span className="text-[8px] text-slate-450 font-medium">&gt; 7 jours d'arrêt</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center flex flex-col justify-between h-24 col-span-2 sm:col-span-1">
                <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Fin de cartes</span>
                <span className="text-xl font-black text-cyan-600 font-mono block">{progress90.length + progress80.length}</span>
                <span className="text-[8px] text-slate-450 font-medium">Progression &gt; 80%</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center flex flex-col justify-between h-24 col-span-2 sm:col-span-1">
                <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Crédits Assist.</span>
                <span className="text-xl font-black text-pink-505 font-mono block">{pendingAssistances.length}</span>
                <span className="text-[8px] text-slate-450 font-medium">Demandes en attente</span>
              </div>

            </div>

            {/* CORE CALL CENTER OBJECTIVES BANNER */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-950/20 dark:to-slate-900/40 p-5 rounded-3xl border border-indigo-100 dark:border-slate-850 flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-wider">Fidéliser • Éviter les abandons • Accompagner</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Le Call Center veille à ce que chaque client parrainé poursuive ses pointages réguliers. Relancez les comptes inactifs et facilitez la conversion de projets !
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setActiveMenu('calls')} className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase cursor-pointer">
                  Passer des appels
                </button>
                <button onClick={() => setActiveMenu('suivi-commercial')} className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-[10px] font-black uppercase cursor-pointer">
                  Pipeline commercial
                </button>
              </div>
            </div>

            {/* CRITICAL CALL CENTER TASKS (Staggered rows) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Critical alerts */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 lg:col-span-2 space-y-4">
                <span className="block text-[10px] font-black uppercase text-slate-400 font-mono">Tâches et rappels prioritaires</span>
                <div className="space-y-3">
                  {ccNotifications.map((notif, i) => (
                    <div key={i} className="p-3 bg-slate-550/5 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs font-bold">
                      <span>{notif}</span>
                      <button 
                        onClick={() => setCcNotifications(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-[10px] text-indigo-500 hover:underline cursor-pointer"
                      >
                        Fait
                      </button>
                    </div>
                  ))}
                  {ccNotifications.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-400">
                      Toutes les tâches urgentes sont complétées ! Excellent travail.
                    </div>
                  )}
                </div>
              </div>

              {/* Quick actions box */}
              <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 space-y-4">
                <span className="block text-[10px] font-black uppercase text-slate-400 font-mono">Création Express</span>
                <div className="space-y-2">
                  <button onClick={() => setActiveMenu('appointments')} className="w-full p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-left text-xs font-black flex justify-between items-center cursor-pointer">
                    <span>Programmer Rendez-vous</span>
                    <Plus className="w-4 h-4" />
                  </button>
                  <button onClick={() => setActiveMenu('claims')} className="w-full p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-left text-xs font-black flex justify-between items-center cursor-pointer">
                    <span>Créer Réclamation</span>
                    <Plus className="w-4 h-4" />
                  </button>
                  <button onClick={() => setActiveMenu('campaigns')} className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-left text-xs font-black flex justify-between items-center cursor-pointer">
                    <span>Diffuser SMS de Masse</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 2. VIEW: CENTRE D'APPELS */}
        {activeMenu === 'calls' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-1.5">
                  <Phone className="w-5 h-5 text-indigo-550" />
                  Centre de Relations Téléphoniques
                </h2>
                <p className="text-[10px] text-slate-500 mt-0.5">Appels du jour et planification des rappels pour le suivi d'épargne</p>
              </div>

              <button
                onClick={() => startSimulatedCall('Paul Samba', '+242 05 523 11 22')}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Simuler Appel Sortant</span>
              </button>
            </div>

            {/* Quick stats calls */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-center border border-slate-100 dark:border-slate-850">
                <span className="block text-[8px] font-black uppercase text-slate-400">Total</span>
                <span className="text-sm font-black text-slate-800 dark:text-white font-mono">{calls.length}</span>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl text-center border border-emerald-100 dark:border-emerald-950/50">
                <span className="block text-[8px] font-black uppercase text-emerald-500">Entrants</span>
                <span className="text-sm font-black text-emerald-600 font-mono">{calls.filter(c => c.type === 'incoming').length}</span>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl text-center border border-indigo-100 dark:border-indigo-950/50">
                <span className="block text-[8px] font-black uppercase text-indigo-500">Sortants</span>
                <span className="text-sm font-black text-indigo-600 font-mono">{calls.filter(c => c.type === 'outgoing').length}</span>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 rounded-xl text-center border border-rose-100 dark:border-rose-950/50">
                <span className="block text-[8px] font-black uppercase text-rose-500">Manqués</span>
                <span className="text-sm font-black text-rose-600 font-mono">{calls.filter(c => c.type === 'missed').length}</span>
              </div>
            </div>

            {/* Calls list table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase">
                    <th className="py-2">Client / Adhérent</th>
                    <th className="py-2">Type d'appel</th>
                    <th className="py-2">Heure / Durée</th>
                    <th className="py-2">Notes de conversation</th>
                    <th className="py-2 text-center">Résultat</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-850 text-[11px] font-bold">
                  {calls.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/10">
                      <td className="py-3">
                        <span className="block text-slate-900 dark:text-white font-extrabold">{c.clientName}</span>
                        <span className="block text-[9px] text-slate-400 font-mono">{c.phone}</span>
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase ${
                          c.type === 'incoming' ? 'text-emerald-500' :
                          c.type === 'outgoing' ? 'text-indigo-500' : 'text-rose-500'
                        }`}>
                          {c.type === 'incoming' && <PhoneIncoming className="w-3 h-3" />}
                          {c.type === 'outgoing' && <PhoneForwarded className="w-3 h-3" />}
                          {c.type === 'missed' && <PhoneMissed className="w-3 h-3" />}
                          {c.type === 'incoming' ? 'Entrant' : c.type === 'outgoing' ? 'Sortant' : 'Manqué'}
                        </span>
                      </td>
                      <td className="py-3 font-mono">
                        <span className="block">{c.time}</span>
                        {c.duration && <span className="block text-[9px] text-slate-450">{c.duration}</span>}
                      </td>
                      <td className="py-3 max-w-xs text-slate-500 font-medium leading-relaxed italic">
                        "{c.notes}"
                      </td>
                      <td className="py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          c.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                          c.status === 'callback_scheduled' ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-slate-50 text-slate-450'
                        }`}>
                          {c.status === 'completed' ? 'Abouti' : c.status === 'callback_scheduled' ? 'Rappel' : 'Sans réponse'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => startSimulatedCall(c.clientName, c.phone)}
                          className="p-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-650 rounded-lg text-slate-400 cursor-pointer"
                          title="Rappeler maintenant"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. VIEW: CLIENTS / DOSSIER CLIENT */}
        {activeMenu === 'clients' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
            
            {/* SWITCH IF DETAILED INSUREE VISITED */}
            {activeInspectedClient ? (
              <div className="space-y-6">
                
                {/* Back head row */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setSelectedClientId(null)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div>
                      <span className="text-[9px] font-mono font-black text-indigo-500 uppercase">Fiche relation client</span>
                      <h2 className="text-base font-black text-slate-905 dark:text-white uppercase tracking-tight">{activeInspectedClient.name}</h2>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => startSimulatedCall(activeInspectedClient.name, activeInspectedClient.phone)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Appeler</span>
                    </button>
                    <button
                      onClick={() => {
                        setSmsClientName(activeInspectedClient.name);
                        setSmsPhone(activeInspectedClient.phone);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>SMS</span>
                    </button>
                  </div>
                </div>

                {/* Main profile split layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Left profile box */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-4">
                    <span className="block text-[9px] font-black uppercase text-indigo-505 font-mono">Dossier Signalétique</span>
                    
                    {/* Mock Avatar */}
                    <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 font-black text-xl flex items-center justify-center">
                      {activeInspectedClient.name.charAt(0)}
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="block text-[9px] text-slate-400">Téléphone</span>
                        <strong className="font-mono text-slate-800 dark:text-white">{permissions.viewPersonalInfo ? activeInspectedClient.phone : '• • • • • • • •'}</strong>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-400">Quartier / Adresse</span>
                        <strong className="text-slate-800 dark:text-white">{permissions.viewPersonalInfo ? activeInspectedClient.zone : 'Zone restreinte'}</strong>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-400">Solde Épargne</span>
                        <strong className="font-mono text-indigo-650 dark:text-indigo-400">
                          {permissions.showBalance ? `${(activeInspectedClient.balance || 0).toLocaleString()} FCFA` : '🔒 Masqué'}
                        </strong>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-400">Dernier Versement</span>
                        <strong className="text-slate-800 dark:text-white">{activeInspectedClient.lastPointingDate ? new Date(activeInspectedClient.lastPointingDate).toLocaleDateString() : 'Aucun'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Middle internal notes list */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 md:col-span-2 space-y-4 flex flex-col justify-between">
                    <div>
                      <span className="block text-[9px] font-black uppercase text-indigo-505 font-mono">Fiche d'Échanges de Suivi (Visible PDG & Superviseurs)</span>
                      
                      <div className="space-y-2.5 max-h-48 overflow-y-auto pt-2">
                        {(activeInspectedClient.internalNotes || []).map((note, i) => (
                          <div key={i} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl text-xs font-semibold">
                            <span className="block text-[8px] text-slate-400 font-mono mb-0.5">Note de Suivi</span>
                            <p className="text-slate-650 dark:text-slate-300 leading-normal italic">"{note}"</p>
                          </div>
                        ))}
                        {(!activeInspectedClient.internalNotes || activeInspectedClient.internalNotes.length === 0) && (
                          <div className="p-6 text-center text-xs text-slate-400 italic">
                            Aucune note pour le moment. Utilisez l'outil ci-dessous pour ajouter la première note de suivi.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Note editor input */}
                    <div className="flex gap-2.5 pt-2">
                      <input
                        type="text"
                        placeholder="Renseigner une note de suivi (Ex: 'Veut une assistance vendredi'...)"
                        value={newInternalNoteText}
                        onChange={(e) => setNewInternalNoteText(e.target.value)}
                        className="flex-grow bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none text-slate-900 dark:text-white"
                      />
                      <button
                        onClick={() => handleAddInternalNote(activeInspectedClient.id)}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black cursor-pointer"
                      >
                        Enregistrer note
                      </button>
                    </div>
                  </div>

                </div>

                {/* Secondary widgets for inspect client (Appointments, claims) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                    <span className="block text-[9px] font-black uppercase text-slate-400 font-mono mb-2">Prendre un rendez-vous lié</span>
                    <button
                      onClick={() => {
                        setAptClientName(activeInspectedClient.name);
                        setAptPhone(activeInspectedClient.phone);
                        setActiveMenu('appointments');
                      }}
                      className="w-full py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      Planifier rendez-vous d'agence
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                    <span className="block text-[9px] font-black uppercase text-slate-400 font-mono mb-2">Déclarer un problème technique / Perte</span>
                    <button
                      onClick={() => {
                        setClaimClientName(activeInspectedClient.name);
                        setClaimPhone(activeInspectedClient.phone);
                        setActiveMenu('claims');
                      }}
                      className="w-full py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                      Créer ticket de réclamation
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white uppercase">Portefeuille des clients adhérents</h2>
                    <p className="text-[10px] text-slate-500">Sélectionnez une fiche client pour effectuer le suivi complet des versement et notes internes.</p>
                  </div>
                </div>

                {/* Quick Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Filtrer les clients par nom ou téléphone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-850 text-[10px] font-black text-slate-400 uppercase">
                        <th className="py-2">Client</th>
                        <th className="py-2">Contact</th>
                        <th className="py-2">Zone d'adhésion</th>
                        <th className="py-2 text-right">Fiche interne</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-850 text-[11px] font-bold">
                      {clients.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery)).map(c => (
                        <tr key={c.id} className="hover:bg-slate-550/5">
                          <td className="py-3 flex items-center gap-2">
                            <div className="w-7 h-7 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 font-black flex items-center justify-center text-xs">
                              {c.name.charAt(0)}
                            </div>
                            <span className="text-slate-900 dark:text-white font-black">{c.name}</span>
                          </td>
                          <td className="py-3 font-mono text-slate-500">{permissions.viewPersonalInfo ? c.phone : '••••••••'}</td>
                          <td className="py-3 text-slate-500 font-semibold">{c.zone}</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => setSelectedClientId(c.id)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-650 text-slate-650 rounded-lg text-[10px] font-extrabold uppercase transition cursor-pointer"
                            >
                              Ouvrir dossier
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* 4. VIEW: CLIENTS INACTIFS */}
        {activeMenu === 'inactivity' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white uppercase flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Détection Automatique d'Inactivité
              </h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Clients n'ayant effectué aucun versement depuis plusieurs jours. Effectuez une relance pour contrer l'abandon.</p>
            </div>

            {/* Split metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl text-center border border-amber-250">
                <span className="block text-[8px] font-black uppercase text-amber-600">Inactifs &gt; 7 jours</span>
                <span className="text-sm font-black text-amber-600 font-mono">{inactive7Days.length} clients</span>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-xl text-center border border-orange-250">
                <span className="block text-[8px] font-black uppercase text-orange-600 font-mono">Inactifs &gt; 15 jours</span>
                <span className="text-sm font-black text-orange-600 font-mono">{inactive15Days.length} clients</span>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 rounded-xl text-center border border-rose-250">
                <span className="block text-[8px] font-black uppercase text-rose-500">Inactifs &gt; 30 jours</span>
                <span className="text-sm font-black text-rose-600 font-mono">{inactive30Days.length} clients</span>
              </div>
            </div>

            {/* Inactives list */}
            <div className="space-y-3 pt-3">
              <span className="block text-[10px] font-black uppercase text-slate-400 font-mono">Clients à relancer d'urgence</span>
              
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {inactiveClients.map(({ client, diffDays }) => (
                  <div key={client.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900 dark:text-white">{client.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                          diffDays >= 30 ? 'bg-rose-100 text-rose-705' :
                          diffDays >= 15 ? 'bg-orange-100 text-orange-705' : 'bg-amber-100 text-amber-750'
                        }`}>
                          {diffDays} jours d'inactivité
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Dernière activité: {client.lastPointingDate ? new Date(client.lastPointingDate).toLocaleDateString() : 'Création du compte'}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => startSimulatedCall(client.name, client.phone)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Relancer</span>
                      </button>
                      <button
                        onClick={() => setSelectedClientId(client.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase cursor-pointer"
                      >
                        Fiche complet
                      </button>
                    </div>
                  </div>
                ))}
                {inactiveClients.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-450 italic">
                    Aucun client inactif détecté ! La mobilisation de l'épargne est optimale.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* 5. VIEW: SUIVI DES CARTES BIENTÔT TERMINÉES */}
        {activeMenu === 'cards-progress' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white uppercase flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-505" />
                Suivi du Remplissage des Cartes MOBIKISSI
              </h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Anticipez la clôture des enveloppes et préparez la suite ou l'assistance d'affaires avec les clients d'élite.</p>
            </div>

            {/* Matrix progress */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-center">
                <span className="block text-[8px] font-black uppercase text-slate-400">Progression &gt; 80%</span>
                <span className="text-sm font-black text-indigo-550 font-mono">{progress80.length} cartes</span>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 rounded-xl text-center">
                <span className="block text-[8px] font-black uppercase text-amber-500">Progression &gt; 90%</span>
                <span className="text-sm font-black text-amber-600 font-mono">{progress90.length} cartes</span>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 rounded-xl text-center animate-pulse">
                <span className="block text-[8px] font-black uppercase text-emerald-500">Terminées (30/30)</span>
                <span className="text-sm font-black text-emerald-600 font-mono">{progressCompleted.length} cartes</span>
              </div>
            </div>

            {/* List */}
            <div className="space-y-3 pt-3">
              <span className="block text-[10px] font-black uppercase text-slate-400 font-mono">Liste d'évaluation</span>
              
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {cardsCloseToFinish.filter(c => c.progressPercent >= 80).map(({ card, owner, progressPercent }) => (
                  <div key={card.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold">
                    <div>
                      <span className="font-black text-slate-900 dark:text-white">{owner?.name || 'Client Inconnu'}</span>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                        <span className="font-mono">Carte #{card.cardNumber.slice(-6)}</span>
                        <span>•</span>
                        <span>Valeur: {card.amount.toLocaleString()} FCFA</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Custom progress micro-bar */}
                      <div className="w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full ${card.isCompleted ? 'bg-emerald-500' : progressPercent >= 90 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-black shrink-0">{progressPercent}%</span>
                      
                      <button
                        onClick={() => startSimulatedCall(owner?.name || '', owner?.phone || '')}
                        className="px-3 py-1.5 bg-indigo-550 hover:bg-indigo-650 text-white rounded-xl text-[10px] font-black uppercase cursor-pointer"
                      >
                        Informer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 6. VIEW: ASSISTANCE */}
        {activeMenu === 'assistance' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white uppercase flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-indigo-550" />
                Accompagnement Social & Entrepreneurial
              </h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Suivi des micro-crédits et subventions accordés pour dynamiser l'activité de nos membres.</p>
            </div>

            {/* Split section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Eligible list */}
              <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3">
                <span className="block text-[9px] font-black uppercase text-emerald-600 font-mono">Clients éligibles (Seniorité &gt;= 2 sem)</span>
                
                <div className="space-y-2.5 max-h-72 overflow-y-auto">
                  {eligibleForAssistance.map(c => (
                    <div key={c.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl flex justify-between items-center text-xs font-bold">
                      <div>
                        <span className="block text-slate-900 dark:text-white">{c.name}</span>
                        <span className="block text-[9px] text-slate-400 font-mono">Solde: {c.balance.toLocaleString()} FCFA</span>
                      </div>
                      <button
                        onClick={() => {
                          setSmsClientName(c.name);
                          setSmsPhone(c.phone);
                          setSmsText(`Félicitations M./Mme ${c.name}, vous êtes éligible pour un crédit d'accompagnement de projet MOBIKISSI ! Contactez-nous au call center.`);
                        }}
                        className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase cursor-pointer"
                      >
                        Suggérer crédit
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending assistances */}
              <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3">
                <span className="block text-[9px] font-black uppercase text-indigo-555 font-mono">Dossiers de prêt en cours de traitement</span>
                
                <div className="space-y-2.5 max-h-72 overflow-y-auto">
                  {pendingAssistances.map(a => (
                    <div key={a.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl space-y-2 text-xs font-bold">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="block text-slate-900 dark:text-white">{a.clientName}</span>
                          <span className="block text-[9px] text-slate-450 uppercase">{a.domain}</span>
                        </div>
                        <span className="text-xs font-black text-indigo-500 font-mono">{a.amount.toLocaleString()} F</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium italic">" {a.notes || 'Aucune note explicative.'} "</p>
                      
                      <div className="flex gap-1 pt-1.5 border-t border-slate-50 dark:border-slate-800">
                        <button
                          onClick={() => startSimulatedCall(a.clientName, '+242 06 474 00 00')}
                          className="flex-grow py-1 bg-slate-100 text-slate-650 rounded text-[9px] font-black uppercase cursor-pointer"
                        >
                          Appeler client
                        </button>
                        <button
                          onClick={() => {
                            setAptClientName(a.clientName);
                            setAptType('assistance');
                            setAptNotes(`Entretien comité d'affaires pour accompagnement ${a.domain}`);
                            setActiveMenu('appointments');
                          }}
                          className="flex-grow py-1 bg-indigo-50 text-indigo-650 rounded text-[9px] font-black uppercase cursor-pointer"
                        >
                          Rdv d'agence
                        </button>
                      </div>
                    </div>
                  ))}
                  {pendingAssistances.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-400 italic">
                      Aucune demande de crédit en attente d'avis Call Center.
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 7. VIEW: RÉCLAMATIONS */}
        {activeMenu === 'claims' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-105 dark:border-slate-850">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white uppercase flex items-center gap-1.5">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                  Centre des Réclamations & Erreurs
                </h2>
                <p className="text-[10px] text-slate-500 mt-0.5">Enregistrer et suivre les réclamations, erreurs de versement de terrain ou pertes de carte.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Creator form */}
              <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3 lg:col-span-1">
                <span className="block text-[10px] font-black uppercase text-indigo-505 font-mono">Ouvrir un ticket</span>
                
                <form onSubmit={handleCreateClaimSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Nom du client</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Paul Samba"
                      value={claimClientName}
                      onChange={(e) => setClaimClientName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Téléphone de contact</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: +242 06 912 34 56"
                      value={claimPhone}
                      onChange={(e) => setClaimPhone(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Motif de réclamation</label>
                    <select
                      value={claimCategory}
                      onChange={(e) => setClaimCategory(e.target.value as any)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 focus:outline-none"
                    >
                      <option value="client_claim">Réclamation générale</option>
                      <option value="deposit_error">Erreur de versement terrain</option>
                      <option value="lost_card">Carte de pointage perdue</option>
                      <option value="processing_delay">Retard de traitement dossier</option>
                      <option value="withdrawal_issue">Problème de retrait de fonds</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Titre résumé</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carte physique égarée"
                      value={claimTitle}
                      onChange={(e) => setClaimTitle(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Description détaillée</label>
                    <textarea
                      required
                      placeholder="Expliquez précisément le problème rencontré..."
                      value={claimNotes}
                      onChange={(e) => setClaimNotes(e.target.value)}
                      className="w-full h-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black uppercase cursor-pointer"
                  >
                    Ouvrir le ticket
                  </button>
                </form>
              </div>

              {/* Active claims list */}
              <div className="lg:col-span-2 space-y-3">
                <span className="block text-[10px] font-black uppercase text-slate-400 font-mono">Suivi des tickets de réclamation</span>
                
                <div className="space-y-3">
                  {claims.map(cl => (
                    <div key={cl.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl text-xs font-bold space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-900 dark:text-white font-black">{cl.title}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                              cl.status === 'open' ? 'bg-rose-100 text-rose-700 animate-pulse' :
                              cl.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {cl.status === 'open' ? 'Ouverte' : cl.status === 'in_progress' ? 'En cours' : 'Résolue'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">Déclaré par: {cl.clientName} ({cl.phone}) • {cl.createdAt}</p>
                        </div>

                        {/* Status modifier dropdown */}
                        <select
                          value={cl.status}
                          onChange={(e) => {
                            setClaims(prev => prev.map(item => item.id === cl.id ? { ...item, status: e.target.value as any } : item));
                            triggerToast(`✓ Statut de la réclamation mis à jour.`);
                          }}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 text-[10px] focus:outline-none"
                        >
                          <option value="open">Ouverte</option>
                          <option value="in_progress">En cours</option>
                          <option value="resolved">Résolue</option>
                          <option value="closed">Fermée</option>
                        </select>
                      </div>

                      <p className="text-[10.5px] text-slate-500 font-medium italic">" {cl.notes} "</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 8. VIEW: RENDEZ-VOUS */}
        {activeMenu === 'appointments' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white uppercase flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-550" />
                Planification des Rendez-vous d'Agence
              </h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Optimisez les visites physiques des clients d'affaires, signatures de prêts assistances ou finalisations d'épargne.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Scheduler Form */}
              <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3 lg:col-span-1">
                <span className="block text-[10px] font-black uppercase text-indigo-505 font-mono">Planifier un horaire</span>
                
                <form onSubmit={handleCreateAppointmentSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Nom de l'interlocuteur</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Paul Samba"
                      value={aptClientName}
                      onChange={(e) => setAptClientName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Téléphone mobile</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: +242 05 523 11 22"
                      value={aptPhone}
                      onChange={(e) => setAptPhone(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Type de rendez-vous</label>
                    <select
                      value={aptType}
                      onChange={(e) => setAptType(e.target.value as any)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 focus:outline-none"
                    >
                      <option value="agency">Rendez-vous agence (général)</option>
                      <option value="assistance">Comité d'assistance sociale</option>
                      <option value="refund">Suivi de remboursement prêt</option>
                      <option value="commercial">Entretien commercial</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Date</label>
                      <input
                        type="date"
                        required
                        value={aptDate}
                        onChange={(e) => setAptDate(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Heure</label>
                      <input
                        type="time"
                        required
                        value={aptTime}
                        onChange={(e) => setAptTime(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Notes explicatives</label>
                    <textarea
                      placeholder="Détails du rendez-vous..."
                      value={aptNotes}
                      onChange={(e) => setAptNotes(e.target.value)}
                      className="w-full h-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase cursor-pointer"
                  >
                    Confirmer le créneau
                  </button>
                </form>
              </div>

              {/* Scheduled List */}
              <div className="lg:col-span-2 space-y-3">
                <span className="block text-[10px] font-black uppercase text-slate-400 font-mono">Calendrier des visites d'agence</span>
                
                <div className="space-y-3">
                  {appointments.map(apt => (
                    <div key={apt.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl text-xs font-bold space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-905 dark:text-white font-black">{apt.clientName}</span>
                            <span className="text-[10px] bg-indigo-50 text-indigo-605 px-2 py-0.5 rounded font-mono font-semibold uppercase">{apt.type}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">Tél: {apt.phone}</p>
                        </div>

                        <div className="flex items-center gap-1.5 text-right font-mono text-[10px] text-indigo-555">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Le {new Date(apt.date).toLocaleDateString()} à {apt.time}</span>
                        </div>
                      </div>

                      <p className="text-[10.5px] text-slate-500 font-medium italic">" {apt.notes} "</p>

                      <div className="flex gap-1 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => {
                            setAppointments(prev => prev.map(item => item.id === apt.id ? { ...item, status: 'done' } : item));
                            triggerToast('✓ Visite enregistrée comme complétée.');
                          }}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded text-[9px] font-extrabold uppercase cursor-pointer"
                        >
                          Honorer
                        </button>
                        <button
                          onClick={() => {
                            setAppointments(prev => prev.filter(item => item.id !== apt.id));
                            triggerToast('✕ Visite annulée.');
                          }}
                          className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded text-[9px] font-extrabold uppercase cursor-pointer"
                        >
                          Annuler rdv
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 9. VIEW: CAMPAGNES */}
        {activeMenu === 'campaigns' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white uppercase flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-550" />
                Campagnes de Communication SMS de Masse
              </h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Sensibilisez vos membres d'une même zone d'activités, informez des nouvelles opportunités ou faites des relances collectives d'épargne.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Composer Form */}
              <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-105 dark:border-slate-850 space-y-3 lg:col-span-1">
                <span className="block text-[10px] font-black uppercase text-indigo-505 font-mono">Diffuser SMS</span>
                
                <form onSubmit={handleSendCampaignSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Titre de la campagne</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Campagne Épargne Commerce"
                      value={campaignTitle}
                      onChange={(e) => setCampaignTitle(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl py-2 px-3 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Zone géographique ciblée</label>
                    <select
                      value={campaignZone}
                      onChange={(e) => setCampaignZone(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl py-2 px-3 focus:outline-none"
                    >
                      <option value="Zone A - Massina">Zone A - Massina</option>
                      <option value="Zone B - Ouenze">Zone B - Ouenze</option>
                      <option value="Zone C - Talangaï">Zone C - Talangaï</option>
                      <option value="Zone D - Poto-Poto">Zone D - Poto-Poto</option>
                      <option value="Zone E - Bacongo">Zone E - Bacongo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Corps du message (max 160)</label>
                    <textarea
                      required
                      placeholder="Rédigez le texte du SMS..."
                      value={campaignMsg}
                      onChange={(e) => setCampaignMsg(e.target.value)}
                      className="w-full h-32 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl font-black uppercase flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Lancer la diffusion</span>
                  </button>
                </form>
              </div>

              {/* History list */}
              <div className="lg:col-span-2 space-y-3">
                <span className="block text-[10px] font-black uppercase text-slate-400 font-mono">Historique des envois groupés</span>
                
                <div className="space-y-3">
                  {campaignLogs.map(cam => (
                    <div key={cam.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl text-xs font-bold space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-slate-900 dark:text-white font-black">{cam.title}</span>
                          <p className="text-[10px] text-slate-400 mt-0.5">Zone cible : {cam.target} • {cam.date}</p>
                        </div>
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-mono font-black text-[10px]">{cam.count} SMS envoyés</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">" {cam.message} "</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 10. VIEW: SUIVI COMMERCIAL (Pipeline Conversion) */}
        {activeMenu === 'suivi-commercial' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white uppercase flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-550" />
                  Tunnel de Suivi & Recrutement Commercial
                </h2>
                <p className="text-[10px] text-slate-500 mt-0.5">Suivez la conversion de vos prospects en clients adhérents MOBIKISSI.</p>
              </div>

              {/* Quick lead generator */}
              <button
                onClick={() => {
                  const newL: Lead = {
                    id: `l-${Date.now()}`,
                    name: 'Nouveau Contact ' + Math.floor(100 + Math.random() * 900),
                    phone: '+242 06 ' + Math.floor(100 + Math.random() * 900) + ' ' + Math.floor(10 + Math.random() * 89) + ' ' + Math.floor(10 + Math.random() * 89),
                    zone: 'Zone A - Massina',
                    status: 'lead',
                    notes: 'Demande de documentation rapide.',
                    createdAt: new Date().toISOString().substring(0, 10)
                  };
                  setLeads(prev => [...prev, newL]);
                  triggerToast('✓ Prospect ajouté au tunnel.');
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouveau Prospect</span>
              </button>
            </div>

            {/* Pipeline Columns Layout */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Column 1: Leads */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-3">
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-100 dark:border-slate-850">
                  <span className="text-[10px] font-black uppercase text-indigo-550 font-mono">Prospects</span>
                  <span className="bg-indigo-50 text-indigo-650 px-1.5 py-0.5 rounded text-[10px] font-bold">{leads.filter(l => l.status === 'lead').length}</span>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {leads.filter(l => l.status === 'lead').map(item => (
                    <div key={item.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2 text-xs font-bold shadow-xs">
                      <div>
                        <span className="block text-slate-900 dark:text-white">{item.name}</span>
                        <span className="block text-[9px] text-slate-400 font-mono">{item.phone}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium italic">" {item.notes} "</p>
                      
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            setLeads(prev => prev.map(l => l.id === item.id ? { ...l, status: 'interested' } : l));
                            triggerToast('✓ Étape mise à jour : Intéressé.');
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 rounded text-[9px] uppercase font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>Suivant</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: Interested */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-3">
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-100 dark:border-slate-850">
                  <span className="text-[10px] font-black uppercase text-amber-600 font-mono">Intéressés</span>
                  <span className="bg-amber-50 text-amber-650 px-1.5 py-0.5 rounded text-[10px] font-bold">{leads.filter(l => l.status === 'interested').length}</span>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {leads.filter(l => l.status === 'interested').map(item => (
                    <div key={item.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2 text-xs font-bold shadow-xs">
                      <div>
                        <span className="block text-slate-900 dark:text-white">{item.name}</span>
                        <span className="block text-[9px] text-slate-400 font-mono">{item.phone}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium italic">" {item.notes} "</p>
                      
                      <div className="flex justify-between pt-1">
                        <button
                          onClick={() => {
                            setLeads(prev => prev.map(l => l.id === item.id ? { ...l, status: 'lead' } : l));
                          }}
                          className="text-[9px] text-slate-450 uppercase font-bold cursor-pointer"
                        >
                          Retour
                        </button>
                        <button
                          onClick={() => {
                            setLeads(prev => prev.map(l => l.id === item.id ? { ...l, status: 'to_follow' } : l));
                            triggerToast('✓ Étape mise à jour : À relancer.');
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 rounded text-[9px] uppercase font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>Suivant</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: To follow up */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-3">
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-100 dark:border-slate-850">
                  <span className="text-[10px] font-black uppercase text-purple-650 font-mono">À relancer</span>
                  <span className="bg-purple-50 text-purple-655 px-1.5 py-0.5 rounded text-[10px] font-bold">{leads.filter(l => l.status === 'to_follow').length}</span>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {leads.filter(l => l.status === 'to_follow').map(item => (
                    <div key={item.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2 text-xs font-bold shadow-xs">
                      <div>
                        <span className="block text-slate-900 dark:text-white">{item.name}</span>
                        <span className="block text-[9px] text-slate-400 font-mono">{item.phone}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium italic">" {item.notes} "</p>
                      
                      <div className="flex justify-between pt-1">
                        <button
                          onClick={() => {
                            setLeads(prev => prev.map(l => l.id === item.id ? { ...l, status: 'interested' } : l));
                          }}
                          className="text-[9px] text-slate-450 uppercase font-bold cursor-pointer"
                        >
                          Retour
                        </button>
                        <button
                          onClick={() => {
                            // Convert! Add to main clients pool
                            const newClientId = `u-[cl]-${Date.now()}`;
                            const convertedClient: UserType = {
                              id: newClientId,
                              name: item.name,
                              role: 'CLIENT',
                              email: 'contact@mobikissi.cg',
                              phone: item.phone,
                              agency: 'Agence Centrale (Massina PK)',
                              zone: item.zone,
                              status: 'active',
                              balance: 500, // starting gift balance
                              createdAt: new Date().toISOString(),
                              seniorityWeeks: 1,
                              internalNotes: [`[Suivi Commercial] Prospect converti avec succès par le conseiller Call Center.`]
                            };
                            setUsers(prev => [convertedClient, ...prev]);
                            setLeads(prev => prev.map(l => l.id === item.id ? { ...l, status: 'converted' } : l));
                            triggerToast(`🎉 Félicitations ! ${item.name} a été converti en client actif !`);
                          }}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-650 text-white rounded text-[9px] uppercase font-bold flex items-center gap-1 cursor-pointer animate-pulse"
                        >
                          <span>Convertir !</span>
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 4: Converted */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-3">
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-100 dark:border-slate-850">
                  <span className="text-[10px] font-black uppercase text-emerald-600 font-mono">Convertis 🎉</span>
                  <span className="bg-emerald-50 text-emerald-650 px-1.5 py-0.5 rounded text-[10px] font-bold">{leads.filter(l => l.status === 'converted').length}</span>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {leads.filter(l => l.status === 'converted').map(item => (
                    <div key={item.id} className="p-3 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-xl space-y-1.5 text-xs font-bold shadow-xs">
                      <span className="block text-slate-900 dark:text-white">{item.name}</span>
                      <span className="block text-[9px] text-slate-400 font-mono">{item.phone}</span>
                      <div className="flex items-center gap-1 text-[9px] text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Client Actif MOBIKISSI</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 11. VIEW: RAPPORTS D'ACTIVITÉ */}
        {activeMenu === 'reports' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
            
            {/* CHECK PDG RAPPORTS PERMISSIONS LIMIT */}
            {!permissions.accessReports ? (
              <div className="p-12 text-center space-y-4">
                <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto animate-bounce" />
                <h3 className="text-base font-black text-slate-905 uppercase">Accès Limité / Sécurisé</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">L'administrateur de la plateforme MOBIKISSI a restreint l'accès aux rapports analytiques du Call Center.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white uppercase">Analyses de Performance & Taux de Satisfaction</h2>
                  <p className="text-[10px] text-slate-500 mt-0.5">Rapports temps réel des indicateurs clés d'appels, suivis, résolutions et conversion.</p>
                </div>

                {/* Grid charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Chart 1 */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                    <span className="block text-[9px] font-black uppercase text-slate-400 font-mono mb-4">Volume des Appels & Relances Mensuels</span>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: 'Jan', Entrants: 120, Sortants: 140 },
                          { name: 'Feb', Entrants: 150, Sortants: 180 },
                          { name: 'Mar', Entrants: 180, Sortants: 220 },
                          { name: 'Apr', Entrants: 210, Sortants: 260 },
                          { name: 'May', Entrants: 240, Sortants: 310 },
                          { name: 'Jun', Entrants: contactedClientsCount + 5, Sortants: callsTodayCount + 8 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                          <XAxis dataKey="name" fontSize={9} />
                          <YAxis fontSize={9} />
                          <Tooltip />
                          <Bar dataKey="Entrants" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Sortants" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 2 */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                    <span className="block text-[9px] font-black uppercase text-slate-400 font-mono mb-4">Résolution des réclamations (Taux de satisfaction)</span>
                    <div className="h-48 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <span className="text-4xl font-black text-emerald-500 font-mono">94.8%</span>
                        <span className="block text-xs text-slate-500 font-semibold">Taux de Satisfaction Client Moyen</span>
                        <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">Basé sur 184 fiches de réclamation résolues dans un délai moyen de 18 heures.</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Secondary stats row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl text-center">
                    <span className="block text-[8px] font-black uppercase text-slate-400">Taux de conversion</span>
                    <span className="text-base font-black text-indigo-600 font-mono">68%</span>
                    <span className="text-[9px] text-slate-500 block">Prospects convertis en actifs</span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl text-center">
                    <span className="block text-[8px] font-black uppercase text-slate-400">Rappels à temps</span>
                    <span className="text-base font-black text-amber-500 font-mono">98.2%</span>
                    <span className="text-[9px] text-slate-500 block">Délai moyen de rappel respecté</span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl text-center">
                    <span className="block text-[8px] font-black uppercase text-slate-400">Remboursements assistés</span>
                    <span className="text-base font-black text-emerald-600 font-mono">89.5%</span>
                    <span className="text-[9px] text-slate-500 block">Taux de recouvrement des micro-crédits</span>
                  </div>
                </div>

                {/* Data Export Button (Respect permissions) */}
                {permissions.exportData && (
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => triggerToast('✓ Données d\'activité Call Center exportées au format CSV.')}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Exporter les données relationnelles</span>
                    </button>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </section>

    </div>
  );
}
