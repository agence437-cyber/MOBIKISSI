import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Users, CreditCard, Coins, Map, User, Plus, Search, ArrowLeft, Check, CheckCircle2,
  History, Sparkles, TrendingUp, HeartHandshake, MapPin, Phone, FileText, ChevronRight,
  Bell, LogOut, Filter, Clock, Smartphone, Settings, Award, AlertCircle, Briefcase, Percent,
  ShieldCheck, Mail, Save, Send, ShieldAlert, CheckCircle, HelpCircle, ArrowUpRight
} from 'lucide-react';
import { User as UserType, Card, Transaction, SystemSetting, Assistance } from '../types';

interface AgentDashboardProps {
  agent: UserType;
  clients: UserType[];
  cards: Card[];
  transactions: Transaction[];
  assistances: Assistance[];
  settings: SystemSetting;
  selectedTheme: any;
  onCreateClient: (clientData: any) => void;
  onUpdateClient: (clientId: string, clientData: any) => void;
  onCreateCard: (clientId: string, amount: number) => void;
  onRecordDeposit: (clientId: string, cardId: string, amount: number) => void;
  setAssistances?: React.Dispatch<React.SetStateAction<Assistance[]>>;
  setTransactions?: React.Dispatch<React.SetStateAction<Transaction[]>>;
  setCards?: React.Dispatch<React.SetStateAction<Card[]>>;
  setUsers?: React.Dispatch<React.SetStateAction<UserType[]>>;
}

interface TerrainNote {
  id: string;
  clientId: string;
  clientName: string;
  type: string;
  content: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

export default function AgentDashboard({
  agent,
  clients,
  cards,
  transactions,
  assistances = [],
  settings,
  selectedTheme,
  onCreateClient,
  onUpdateClient,
  onCreateCard,
  onRecordDeposit,
  setAssistances,
  setTransactions,
  setCards,
  setUsers
}: AgentDashboardProps) {

  // Multi-Screen Router State
  const [currentScreen, setCurrentScreen] = useState<string>('dashboard');
  const [navHistory, setNavHistory] = useState<string[]>(['dashboard']);

  // Selected Items State
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedAssistanceId, setSelectedAssistanceId] = useState<string | null>(null);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  // Search & Filter state
  const [clientSearch, setClientSearch] = useState('');
  const [clientFilter, setClientFilter] = useState<'all' | 'active' | 'inactive' | 'assistance'>('all');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Forms State
  const [newClient, setNewClient] = useState({ name: '', phone: '', address: '', profession: '', note: '' });
  const [pointingAmount, setPointingAmount] = useState<string>('');
  const [newCardValue, setNewCardValue] = useState<number>(1000);
  const [assistanceForm, setAssistanceForm] = useState({ amount: '50000', domain: 'Commerce' as any, notes: '' });
  const [newNote, setNewNote] = useState({ type: 'Absent', content: '', priority: 'medium' as any });

  // Confirmation/Transient States
  const [justCreatedClient, setJustCreatedClient] = useState<UserType | null>(null);
  const [justCreatedCard, setJustCreatedCard] = useState<Card | null>(null);
  const [justRecordedTx, setJustRecordedTx] = useState<Transaction | null>(null);

  // Local Storage Persistent States (Terrain Notes & Tour Visited States)
  const [terrainNotes, setTerrainNotes] = useState<TerrainNote[]>(() => {
    const saved = localStorage.getItem('mobikissi_agent_notes');
    return saved ? JSON.parse(saved) : [
      { id: 'note-1', clientId: 'u-client-1', clientName: 'Fatou Diop', type: 'Absent', content: 'Cliente absente au marché, repasser demain matin.', createdAt: new Date(Date.now() - 3600000).toISOString(), priority: 'medium' },
      { id: 'note-2', clientId: 'u-client-2', clientName: 'Amadou Touré', type: 'Activité Florissante', content: 'Très bonne vente de légumes ce jour, a demandé un carnet additionnel.', createdAt: new Date(Date.now() - 7200000).toISOString(), priority: 'low' }
    ];
  });

  const [tourVisits, setTourVisits] = useState<Record<string, { status: 'visited' | 'absent' | 'deferred', time: string }>>(() => {
    const saved = localStorage.getItem('mobikissi_agent_tour');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('mobikissi_agent_notes', JSON.stringify(terrainNotes));
  }, [terrainNotes]);

  useEffect(() => {
    localStorage.setItem('mobikissi_agent_tour', JSON.stringify(tourVisits));
  }, [tourVisits]);

  // NAVIGATION CORE
  const navigateTo = (screen: string, clientId?: string, cardId?: string, assistanceId?: string, txId?: string) => {
    if (clientId) setSelectedClientId(clientId);
    if (cardId) setSelectedCardId(cardId);
    if (assistanceId) setSelectedAssistanceId(assistanceId);
    if (txId) setSelectedTxId(txId);

    setNavHistory(prev => [...prev, screen]);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    if (navHistory.length > 1) {
      const newHist = navHistory.slice(0, -1);
      setNavHistory(newHist);
      setCurrentScreen(newHist[newHist.length - 1]);
    } else {
      setCurrentScreen('dashboard');
    }
  };

  const resetToHome = () => {
    setNavHistory(['dashboard']);
    setCurrentScreen('dashboard');
  };

  // DATA COMPUTATION
  const agentClients = useMemo(() => {
    return clients.filter(c => c.role === 'CLIENT' && (c.zone === agent.zone || agent.zone === 'Toutes Zones' || agent.zone === 'Toutes les Zones'));
  }, [clients, agent.zone]);

  const agentCards = useMemo(() => {
    return cards.filter(c => agentClients.some(ac => ac.id === c.clientId));
  }, [cards, agentClients]);

  const collectorTx = useMemo(() => {
    return transactions.filter(t => t.agentId === agent.id);
  }, [transactions, agent.id]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTx = useMemo(() => {
    return collectorTx.filter(t => t.createdAt.startsWith(todayStr));
  }, [collectorTx, todayStr]);

  const stats = useMemo(() => {
    const todayCollected = todayTx.reduce((sum, t) => sum + t.amount, 0);
    const monthCollected = collectorTx.reduce((sum, t) => sum + t.amount, 0);
    const activeCardsCount = agentCards.filter(c => !c.isCompleted).length;
    const endingCardsCount = agentCards.filter(c => !c.isCompleted && c.filledCells.length >= 26).length;
    
    const goalPercent = Math.min(100, Math.round((monthCollected / 500000) * 100)) || 0;
    const dailyGoalPercent = Math.min(100, Math.round((todayCollected / 5000) * 100)) || 0;

    return {
      todayCollected,
      monthCollected,
      activeCardsCount,
      endingCardsCount,
      goalPercent,
      dailyGoalPercent
    };
  }, [todayTx, collectorTx, agentCards]);

  // Selected details
  const currentClient = useMemo(() => {
    return clients.find(c => c.id === selectedClientId) || null;
  }, [clients, selectedClientId]);

  const currentCard = useMemo(() => {
    return cards.find(c => c.id === selectedCardId) || null;
  }, [cards, selectedCardId]);

  const currentAssistance = useMemo(() => {
    return assistances.find(a => a.id === selectedAssistanceId) || null;
  }, [assistances, selectedAssistanceId]);

  const currentTransaction = useMemo(() => {
    return transactions.find(t => t.id === selectedTxId) || null;
  }, [transactions, selectedTxId]);

  // TOURNEE GENERATION
  const dailyTourList = useMemo(() => {
    return agentClients.map((client, index) => {
      const clientCards = cards.filter(c => c.clientId === client.id && !c.isCompleted);
      const isPriority = clientCards.some(c => c.filledCells.length >= 25);
      const needsRelance = !transactions.some(t => t.clientId === client.id && t.createdAt.slice(0, 10) >= new Date(Date.now() - 4 * 86400000).toISOString().slice(0, 10));
      
      let priority: 'URGENT' | 'Normal' | 'Relance' = 'Normal';
      let advice = 'Passage habituel en après-midi.';
      
      if (isPriority) {
        priority = 'URGENT';
        advice = 'Carte presque remplie ! Prête pour l\'assistance.';
      } else if (needsRelance) {
        priority = 'Relance';
        advice = 'Inactif depuis plus de 4 jours. À visiter absolument.';
      } else if (index % 3 === 0) {
        advice = 'A demandé un passage en fin de matinée.';
      }

      return {
        client,
        priority,
        advice,
        activeCards: clientCards
      };
    });
  }, [agentClients, cards, transactions]);

  const tourProgressPercent = useMemo(() => {
    if (dailyTourList.length === 0) return 0;
    const visitedCount = Object.keys(tourVisits).length;
    return Math.round((visitedCount / dailyTourList.length) * 100);
  }, [tourVisits, dailyTourList]);

  // FORM SUBMISSIONS
  const handleCreateClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !newClient.phone) return;

    const dummyId = `cli-${Date.now()}`;
    const clientData = {
      id: dummyId,
      name: newClient.name,
      phone: newClient.phone,
      email: `${newClient.name.toLowerCase().replace(/\s/g, '')}@mobikissi.org`,
      zone: agent.zone !== 'Toutes Zones' && agent.zone !== 'Toutes les Zones' ? agent.zone : 'Zone A - Massina',
      agency: agent.agency,
      balance: 0,
      streakDays: 0,
      createdAt: new Date().toISOString(),
      role: 'CLIENT' as any,
      status: 'active' as any,
      seniorityWeeks: 1
    };

    onCreateClient(clientData);

    // Seed automatic audit and initial fee transaction
    const feeTx: Transaction = {
      id: `tx-frais-${Date.now()}`,
      type: 'frais_ouverture',
      clientId: dummyId,
      clientName: clientData.name,
      amount: 500,
      agentId: agent.id,
      agentName: agent.name,
      createdAt: new Date().toISOString(),
      status: 'validated',
      zone: clientData.zone,
      agency: clientData.agency
    };

    if (setTransactions) {
      setTransactions(prev => [feeTx, ...prev]);
    }

    setJustCreatedClient(clientData);
    setNewClient({ name: '', phone: '', address: '', profession: '', note: '' });
    navigateTo('confirm-create-client', dummyId);
  };

  const handleCreateCardSubmit = (clientId: string) => {
    onCreateCard(clientId, newCardValue);
    
    // Simulate finding the card we just created
    setTimeout(() => {
      const clientCards = cards.filter(c => c.clientId === clientId);
      const latestCard = clientCards[clientCards.length - 1] || {
        id: `card-${Date.now()}`,
        clientId,
        cardNumber: `MKB-${Math.floor(100000 + Math.random() * 900000)}`,
        amount: newCardValue,
        filledCells: [],
        isCompleted: false,
        rule31Applied: 'pending'
      };
      setJustCreatedCard(latestCard);
    }, 100);

    navigateTo('client-dossier', clientId);
  };

  const handlePointingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !selectedCardId || !pointingAmount) return;

    const amt = Number(pointingAmount);
    onRecordDeposit(selectedClientId, selectedCardId, amt);

    // Generate mock receipt instantly for smooth client feedback
    const txId = `tx-depot-${Date.now()}`;
    const tempTx: Transaction = {
      id: txId,
      type: 'depot',
      clientId: selectedClientId,
      clientName: currentClient?.name || 'Client',
      amount: amt,
      agentId: agent.id,
      agentName: agent.name,
      createdAt: new Date().toISOString(),
      status: 'pending',
      zone: currentClient?.zone || agent.zone,
      agency: currentClient?.agency || agent.agency,
      cardId: selectedCardId
    };

    setJustRecordedTx(tempTx);
    setPointingAmount('');
    navigateTo('confirm-pointing', selectedClientId, selectedCardId, undefined, txId);
  };

  const handleApplyAssistanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return;

    const amount = Number(assistanceForm.amount);
    const interestRate = settings.defaultInterestRate || 22;
    const repaymentAmount = Math.round(amount * (1 + interestRate / 100));

    const newAst: Assistance = {
      id: `ast-${Date.now()}`,
      clientId: selectedClientId,
      clientName: currentClient?.name || 'Adhérent',
      amount,
      domain: assistanceForm.domain,
      status: 'pending',
      interestRate,
      repaymentAmount,
      repaidAmount: 0,
      createdAt: new Date().toISOString(),
      durationMonths: 4,
      notes: assistanceForm.notes
    };

    if (setAssistances) {
      setAssistances(prev => [newAst, ...prev]);
    }

    setAssistanceForm({ amount: '50000', domain: 'Commerce', notes: '' });
    navigateTo('assistances');
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !newNote.content) return;

    const noteItem: TerrainNote = {
      id: `note-${Date.now()}`,
      clientId: selectedClientId,
      clientName: currentClient?.name || 'Client',
      type: newNote.type,
      content: newNote.content,
      priority: newNote.priority,
      createdAt: new Date().toISOString()
    };

    setTerrainNotes(prev => [noteItem, ...prev]);
    setNewNote({ type: 'Absent', content: '', priority: 'medium' });
    navigateTo('client-dossier', selectedClientId);
  };

  const toggleTourVisit = (clientId: string, status: 'visited' | 'absent' | 'deferred') => {
    setTourVisits(prev => {
      const updated = { ...prev };
      if (updated[clientId] && updated[clientId].status === status) {
        delete updated[clientId];
      } else {
        updated[clientId] = {
          status,
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };
      }
      return updated;
    });
  };

  // CLIENTS FILTERING
  const filteredClients = useMemo(() => {
    return agentClients.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
                            c.phone.includes(clientSearch) ||
                            (c.id && c.id.toLowerCase().includes(clientSearch.toLowerCase()));
      
      if (!matchesSearch) return false;

      if (clientFilter === 'active') {
        return cards.some(card => card.clientId === c.id && !card.isCompleted);
      }
      if (clientFilter === 'inactive') {
        return !cards.some(card => card.clientId === c.id && !card.isCompleted);
      }
      if (clientFilter === 'assistance') {
        return cards.some(card => card.clientId === c.id && card.isCompleted);
      }
      return true;
    });
  }, [agentClients, clientSearch, clientFilter, cards]);

  // GLOBAL SEARCH ENGINE
  const globalSearchResults = useMemo(() => {
    if (!globalSearchQuery) return { clients: [], cards: [], transactions: [], assistances: [] };
    const query = globalSearchQuery.toLowerCase();

    return {
      clients: agentClients.filter(c => c.name.toLowerCase().includes(query) || c.phone.includes(query) || c.id.toLowerCase().includes(query)),
      cards: agentCards.filter(c => c.cardNumber.toLowerCase().includes(query) || c.id.toLowerCase().includes(query)),
      transactions: collectorTx.filter(t => t.clientName.toLowerCase().includes(query) || t.amount.toString().includes(query) || t.id.toLowerCase().includes(query)),
      assistances: assistances.filter(a => a.clientName.toLowerCase().includes(query) || a.amount.toString().includes(query))
    };
  }, [globalSearchQuery, agentClients, agentCards, collectorTx, assistances]);

  // DYNAMIC NOTIFICATIONS
  const systemNotifications = useMemo(() => {
    const list = [
      { id: 'n-1', title: 'Objectif journalier', desc: `Vous êtes à ${stats.todayCollected.toLocaleString()} FCFA sur votre objectif de 5 000 FCFA.`, icon: <TrendingUp className="text-blue-500" />, time: 'À l\'instant' }
    ];

    const nearingCard = agentCards.find(c => !c.isCompleted && c.filledCells.length >= 28);
    if (nearingCard) {
      const owner = clients.find(cl => cl.id === nearingCard.clientId);
      list.push({
        id: `n-card-${nearingCard.id}`,
        title: 'Fiche presque pleine',
        desc: `La fiche #${nearingCard.cardNumber.slice(-6)} de ${owner?.name || 'Adhérent'} a atteint ${nearingCard.filledCells.length} cases ! Éligible assistance sous peu.`,
        icon: <Award className="text-amber-500" />,
        time: 'Il y a 5 min'
      });
    }

    return list;
  }, [stats.todayCollected, agentCards, clients, transactions]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100 font-sans flex flex-col justify-between">
      
      {/* 1. TOP HEADER BRAND BAR */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 shadow-xs">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full ${selectedTheme.primary} flex items-center justify-center text-white font-black text-sm shadow-md`}>
              MK
            </div>
            <div>
              <h1 className="text-xs font-black uppercase tracking-tight text-slate-800 dark:text-white">
                MOBIKISSI FIELD
              </h1>
              <p className="text-[9px] text-slate-450 font-mono">
                Portail Recouvreur • {agent.agency}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigateTo('notifications')}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 text-slate-600 dark:text-slate-300 relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {systemNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white dark:border-slate-900" />
              )}
            </button>
            <button 
              onClick={() => navigateTo('search-global')}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. CORE WORKSPACE ROUTER */}
      <main className="flex-grow max-w-2xl mx-auto w-full px-4 py-6 space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18 }}
            className="w-full"
          >
            
            {/* SCREEN 1: TABLEAU DE BORD (DASHBOARD) */}
            {currentScreen === 'dashboard' && (
              <div className="space-y-6">
                
                {/* Profile Hero Block */}
                <div className={`p-5 rounded-3xl text-white shadow-xl ${selectedTheme.primary} relative overflow-hidden`}>
                  <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center font-black text-white text-lg">
                      {agent.name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-white/80 block">Conseiller Terrain</span>
                      <h2 className="text-base font-black tracking-tight">{agent.name}</h2>
                      <p className="text-[10px] text-white/90 font-medium flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> Zone : {agent.zone}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-white/15">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-white/70 block">Collecte du Jour</span>
                      <span className="text-lg font-black font-mono">{stats.todayCollected.toLocaleString()} F</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-white/70 block">Collecte du Mois</span>
                      <span className="text-lg font-black font-mono">{stats.monthCollected.toLocaleString()} F</span>
                    </div>
                  </div>
                </div>

                {/* Progress Gauges Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Objectif Mensuel</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-base font-black font-mono text-indigo-650 dark:text-indigo-400">{stats.monthCollected.toLocaleString()} F</span>
                      <span className="text-xs font-black text-slate-500">/500 000 F</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-850 h-2 rounded-full mt-2.5 overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${stats.goalPercent}%` }} />
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold block mt-1.5">{stats.goalPercent}% Atteint</span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Objectif Journalier</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">{stats.todayCollected.toLocaleString()} F</span>
                      <span className="text-xs font-black text-slate-500">/50 000 F</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-850 h-2 rounded-full mt-2.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${stats.dailyGoalPercent}%` }} />
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold block mt-1.5">{stats.dailyGoalPercent}% Atteint</span>
                  </div>
                </div>

                {/* Quick Actions Hub 2x4 Bento Grid */}
                <div>
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2.5">Outils de Collecte</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => navigateTo('pointing-form')}
                      className="p-4 bg-orange-500/10 hover:bg-orange-500/15 border border-orange-500/15 dark:border-orange-500/10 rounded-2xl text-left flex flex-col justify-between h-24 transition cursor-pointer"
                    >
                      <Coins className="w-6 h-6 text-orange-500" />
                      <div>
                        <span className="font-black text-xs block text-slate-900 dark:text-white">Versement Rapide</span>
                        <span className="text-[9px] text-slate-400">Pointer une fiches</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => navigateTo('clients')}
                      className="p-4 bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/15 dark:border-blue-500/10 rounded-2xl text-left flex flex-col justify-between h-24 transition cursor-pointer"
                    >
                      <Users className="w-6 h-6 text-blue-500" />
                      <div>
                        <span className="font-black text-xs block text-slate-900 dark:text-white">Mes Clients</span>
                        <span className="text-[9px] text-slate-400">{agentClients.length} comptes actifs</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => navigateTo('create-client')}
                      className="p-4 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/15 dark:border-emerald-500/10 rounded-2xl text-left flex flex-col justify-between h-24 transition cursor-pointer"
                    >
                      <Plus className="w-6 h-6 text-emerald-500" />
                      <div>
                        <span className="font-black text-xs block text-slate-900 dark:text-white">Créer Client</span>
                        <span className="text-[9px] text-slate-400">Frais d'adhésion : 500 F</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => navigateTo('cards')}
                      className="p-4 bg-purple-500/10 hover:bg-purple-500/15 border border-purple-500/15 dark:border-purple-500/10 rounded-2xl text-left flex flex-col justify-between h-24 transition cursor-pointer"
                    >
                      <CreditCard className="w-6 h-6 text-purple-500" />
                      <div>
                        <span className="font-black text-xs block text-slate-900 dark:text-white">Mes Cartes</span>
                        <span className="text-[9px] text-slate-400">{agentCards.length} fiches assignées</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => navigateTo('daily-tour')}
                      className="p-4 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/15 dark:border-rose-500/10 rounded-2xl text-left flex flex-col justify-between h-24 transition cursor-pointer"
                    >
                      <Map className="w-6 h-6 text-rose-500" />
                      <div>
                        <span className="font-black text-xs block text-slate-900 dark:text-white">Tournée du Jour</span>
                        <span className="text-[9px] text-slate-400">{tourProgressPercent}% complété</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => navigateTo('assistances')}
                      className="p-4 bg-teal-500/10 hover:bg-teal-500/15 border border-teal-500/15 dark:border-teal-500/10 rounded-2xl text-left flex flex-col justify-between h-24 transition cursor-pointer"
                    >
                      <HeartHandshake className="w-6 h-6 text-teal-500" />
                      <div>
                        <span className="font-black text-xs block text-slate-900 dark:text-white">Prêts & Assistances</span>
                        <span className="text-[9px] text-slate-400">Suivre les subventions</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => navigateTo('field-notes')}
                      className="p-4 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/15 dark:border-amber-500/10 rounded-2xl text-left flex flex-col justify-between h-24 transition cursor-pointer"
                    >
                      <FileText className="w-6 h-6 text-amber-500" />
                      <div>
                        <span className="font-black text-xs block text-slate-900 dark:text-white">Notes de Terrain</span>
                        <span className="text-[9px] text-slate-400">{terrainNotes.length} observations</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => navigateTo('performances')}
                      className="p-4 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/15 dark:border-indigo-500/10 rounded-2xl text-left flex flex-col justify-between h-24 transition cursor-pointer"
                    >
                      <TrendingUp className="w-6 h-6 text-indigo-500" />
                      <div>
                        <span className="font-black text-xs block text-slate-900 dark:text-white">Performances</span>
                        <span className="text-[9px] text-slate-400">Mes statistiques commission</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Tour Preview Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">Aperçu Tournée Terrain</span>
                    <button 
                      onClick={() => navigateTo('daily-tour')}
                      className="text-[10px] text-indigo-650 dark:text-indigo-400 font-extrabold uppercase hover:underline"
                    >
                      Voir tout
                    </button>
                  </div>
                  <div className="pt-3 divide-y divide-slate-50 dark:divide-slate-800">
                    {dailyTourList.slice(0, 2).map(({ client, priority, advice }) => {
                      const isVisited = !!tourVisits[client.id];
                      return (
                        <div key={client.id} className="py-2.5 flex items-center justify-between">
                          <div>
                            <span className="font-black text-xs block text-slate-900 dark:text-white">{client.name}</span>
                            <span className="text-[10px] text-slate-400">{client.phone} • {client.zone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isVisited ? (
                              <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-400 text-[10px] font-black rounded-full uppercase">Visité</span>
                            ) : (
                              <span className={`px-2.5 py-0.5 text-[9px] font-black rounded-full uppercase ${
                                priority === 'URGENT' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}>{priority}</span>
                            )}
                            <button 
                              onClick={() => navigateTo('client-dossier', client.id)}
                              className="p-1 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100"
                            >
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* SCREEN 2: MES CLIENTS */}
            {currentScreen === 'clients' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <button onClick={goBack} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                  </button>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Mes Clients</h2>
                    <p className="text-[10px] text-slate-400">Liste exhaustive des comptes rattachés à votre secteur</p>
                  </div>
                </div>

                {/* Filters and search block */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 space-y-3 shadow-xs">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input 
                      type="text" 
                      placeholder="Rechercher par nom, téléphone, ID..."
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-450 font-bold"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      { key: 'all', label: 'Tous' },
                      { key: 'active', label: 'Fiches Actives' },
                      { key: 'inactive', label: 'Aucune Fiche' },
                      { key: 'assistance', label: 'Éligibles Prêts' }
                    ].map(btn => (
                      <button
                        key={btn.key}
                        onClick={() => setClientFilter(btn.key as any)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition cursor-pointer ${
                          clientFilter === btn.key 
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950' 
                            : 'bg-slate-50 dark:bg-slate-850 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clients Roster list */}
                <div className="space-y-3">
                  {filteredClients.map(client => {
                    const clientCardsList = cards.filter(c => c.clientId === client.id);
                    const activeCards = clientCardsList.filter(c => !c.isCompleted);

                    return (
                      <div 
                        key={client.id}
                        onClick={() => navigateTo('client-dossier', client.id)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl flex items-center justify-between shadow-xs hover:border-indigo-400 cursor-pointer transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-55 dark:bg-slate-800 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 bg-slate-100">
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-black text-xs block text-slate-900 dark:text-white">{client.name}</span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                              <MapPin className="w-3 h-3 text-rose-500" /> {client.zone}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black font-mono text-slate-800 dark:text-white block">{client.balance.toLocaleString()} F</span>
                          <span className="text-[9px] text-slate-400 block font-bold uppercase">
                            {activeCards.length} fiches actives
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* SCREEN 3: DOSSIER CLIENT */}
            {currentScreen === 'client-dossier' && currentClient && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <button onClick={goBack} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
                      <ArrowLeft className="w-4 h-4 text-slate-500" />
                    </button>
                    <div>
                      <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Dossier Adhérent</h2>
                      <p className="text-[10px] text-slate-400">ID : {currentClient.id}</p>
                    </div>
                  </div>

                  <a 
                    href={`tel:${currentClient.phone}`}
                    className="px-3.5 py-1.5 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" /> Appeler
                  </a>
                </div>

                {/* Client Main Summary Banner */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl space-y-4 shadow-xs">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-black text-lg text-indigo-600 dark:text-indigo-400">
                      {currentClient.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">{currentClient.name}</h3>
                      <p className="text-[10px] text-slate-400">{currentClient.phone} • Quartier : {currentClient.zone}</p>
                      <span className="inline-block mt-1 px-2.5 py-0.5 bg-slate-100 dark:bg-slate-880 text-[9px] font-bold rounded">
                        Membre depuis le {new Date(currentClient.createdAt || Date.now()).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-center font-mono">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-sans">Solde Cumulé</span>
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{currentClient.balance.toLocaleString()} F</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-sans">Fiches Actives</span>
                      <span className="text-sm font-black text-slate-800 dark:text-white">
                        {cards.filter(c => c.clientId === currentClient.id && !c.isCompleted).length}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-sans">Assistance</span>
                      <span className="text-xs font-black text-teal-600 dark:text-teal-400 uppercase">
                        {assistances.find(a => a.clientId === currentClient.id)?.status || 'Aucune'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grid of full screen quick actions for this client */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      const firstActiveCard = cards.find(c => c.clientId === currentClient.id && !c.isCompleted);
                      if (firstActiveCard) {
                        navigateTo('pointing-form', currentClient.id, firstActiveCard.id);
                      } else {
                        navigateTo('pointing-form', currentClient.id);
                      }
                    }}
                    className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-center font-black uppercase text-[10px] tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Coins className="w-4 h-4" /> Faire un Pointage
                  </button>

                  <button
                    onClick={() => {
                      navigateTo('pointing-form', currentClient.id); 
                    }}
                    className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 rounded-2xl text-center font-black uppercase text-[10px] tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Nouvelle Fiche
                  </button>
                </div>

                {/* Sublist A: Client Cards */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Fiches de l'Adhérent</h4>
                  {cards.filter(c => c.clientId === currentClient.id).length === 0 ? (
                    <div className="p-4 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 text-xs">
                      Aucune fiche n'est enregistrée pour ce client.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {cards.filter(c => c.clientId === currentClient.id).map(card => {
                        const filledCount = card.filledCells.length;
                        const percent = Math.round((filledCount / 31) * 100);
                        return (
                          <div 
                            key={card.id}
                            onClick={() => navigateTo('card-detail', currentClient.id, card.id)}
                            className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-between shadow-xs hover:border-indigo-500 cursor-pointer transition"
                          >
                            <div className="space-y-1.5 flex-grow mr-4">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] px-1.5 py-0.5 bg-orange-100 text-orange-600 dark:bg-orange-950/30 font-black rounded uppercase">
                                  #{card.cardNumber.slice(-6)}
                                </span>
                                <span className="text-xs font-black text-slate-800 dark:text-white">
                                  {card.amount.toLocaleString()} F / jour
                                </span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-slate-855 h-2 rounded-full overflow-hidden">
                                <div className="bg-orange-500 h-full rounded-full" style={{ width: `${percent}%` }} />
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[11px] font-black font-mono text-slate-800 dark:text-white block">
                                {filledCount} / 31 cases
                              </span>
                              <span className="text-[9px] text-slate-400 font-bold uppercase">{percent}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Actions Hub Row B */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => navigateTo('assistances')}
                    className="p-3 border border-teal-500/25 bg-teal-500/5 hover:bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-2xl text-center font-black uppercase text-[10px] tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <HeartHandshake className="w-4 h-4" /> Prêt d'Assistance
                  </button>

                  <button 
                    onClick={() => {
                      setNewNote({ type: 'Absent', content: '', priority: 'medium' });
                      navigateTo('field-notes', currentClient.id);
                    }}
                    className="p-3 border border-amber-500/25 bg-amber-500/5 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl text-center font-black uppercase text-[10px] tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" /> Ajouter Note
                  </button>
                </div>

                {/* Sublist B: Client History Ledger */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Dernières transactions</h4>
                  {transactions.filter(t => t.clientId === currentClient.id).length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-4">Aucune transaction.</p>
                  ) : (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 divide-y divide-slate-100 dark:divide-slate-800">
                      {transactions.filter(t => t.clientId === currentClient.id).slice(0, 4).map(tx => (
                        <div 
                          key={tx.id} 
                          onClick={() => navigateTo('receipts', currentClient.id, undefined, undefined, tx.id)}
                          className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between cursor-pointer hover:bg-slate-50/50"
                        >
                          <div>
                            <span className="text-xs font-black block text-slate-850 dark:text-white uppercase text-[10px]">
                              {tx.type === 'depot' ? 'Pointage Épargne' : tx.type === 'frais_ouverture' ? "Frais d'Adhésion" : 'Retrait Cash'}
                            </span>
                            <span className="text-[9px] text-slate-400">
                              {new Date(tx.createdAt).toLocaleDateString('fr-FR')} • par {tx.agentName}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs font-mono font-black block ${tx.type === 'retrait' ? 'text-rose-500' : 'text-emerald-600'}`}>
                              {tx.type === 'retrait' ? '-' : '+'}{tx.amount.toLocaleString()} F
                            </span>
                            <span className={`text-[9px] uppercase font-black ${
                              tx.status === 'validated' ? 'text-emerald-500' : tx.status === 'pending' ? 'text-amber-500' : 'text-rose-500'
                            }`}>{tx.status === 'validated' ? 'Validé' : tx.status === 'pending' ? 'Attente' : 'Réfusé'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* SCREEN 4: CRÉER CLIENT */}
            {currentScreen === 'create-client' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2.5">
                  <button onClick={goBack} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                  </button>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Ajouter Adhérent</h2>
                    <p className="text-[10px] text-slate-400">Enregistrer un nouveau prospect terrain dans MOBIKISSI</p>
                  </div>
                </div>

                <form onSubmit={handleCreateClientSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-xs">
                  <div>
                    <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-1">Nom complet</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Jean Mabiala"
                      value={newClient.name}
                      onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-450 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-1">Téléphone principal</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="Ex: +242 06 123 4567"
                      value={newClient.phone}
                      onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-450 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-1">Adresse ou Quartier</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Talangaï, Rond-point de l'Urbain"
                      value={newClient.address}
                      onChange={(e) => setNewClient(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-450"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-1">Profession / Secteur Commercial</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Maraîcher, Vendeuse de pagnes"
                      value={newClient.profession}
                      onChange={(e) => setNewClient(prev => ({ ...prev, profession: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-450 font-medium"
                    />
                  </div>

                  <div className="p-4 bg-orange-500/10 border border-orange-500/15 rounded-2xl space-y-1">
                    <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-black text-xs uppercase">
                      <ShieldCheck className="w-4 h-4" /> Frais de dossier réglementaires
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      L'ouverture d'un compte MOBIKISSI applique automatiquement des **frais d'adhésion de 500 FCFA** prélevés au titre de la caisse centrale de l'agence.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button 
                      type="button" 
                      onClick={goBack} 
                      className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850 text-xs font-black uppercase rounded-xl transition cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button 
                      type="submit" 
                      className="flex-grow py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase rounded-xl transition cursor-pointer shadow-md"
                    >
                      Créer le Client
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SCREEN 5: CONFIRMATION CRÉATION CLIENT */}
            {currentScreen === 'confirm-create-client' && justCreatedClient && (
              <div className="space-y-6 text-center">
                <div className="p-4 bg-emerald-500/15 border border-emerald-500/20 rounded-full w-20 h-20 mx-auto flex items-center justify-center animate-bounce">
                  <CheckCircle className="w-12 h-12 text-emerald-500" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Adhérent Créé avec Succès !</h2>
                  <p className="text-xs text-slate-450 leading-relaxed max-w-sm mx-auto">
                    Le dossier de **{justCreatedClient.name}** a été provisionné avec succès sur les serveurs de microfinance MOBIKISSI.
                  </p>
                </div>

                {/* Receipt Card Summary */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 text-left space-y-3.5 max-w-sm mx-auto shadow-xs">
                  <div className="border-b border-dashed border-slate-100 dark:border-slate-800 pb-3">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase font-mono">Bénéficiaire</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{justCreatedClient.name}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase">ID Adhérent</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-white">{justCreatedClient.id}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase">Quartier / Zone</span>
                      <span className="font-bold text-slate-800 dark:text-white">{justCreatedClient.zone}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase">Frais d'Adhésion</span>
                      <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">500 FCFA</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase">Date d'effet</span>
                      <span className="font-bold text-slate-800 dark:text-white">Ce jour</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 max-w-sm mx-auto">
                  <button 
                    onClick={() => {
                      setSelectedClientId(justCreatedClient.id);
                      navigateTo('pointing-form', justCreatedClient.id);
                    }}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md cursor-pointer"
                  >
                    Ouvrir un carnet d'Épargne
                  </button>

                  <button 
                    onClick={() => navigateTo('client-dossier', justCreatedClient.id)}
                    className="w-full py-3 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black uppercase hover:bg-slate-50 cursor-pointer"
                  >
                    Accéder au dossier client
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 6: MES CARTES */}
            {currentScreen === 'cards' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <button onClick={goBack} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                  </button>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Fiches de Pointage</h2>
                    <p className="text-[10px] text-slate-400">Suivi des fiches d'épargne actives dans votre zone</p>
                  </div>
                </div>

                {/* Cards List Grid */}
                <div className="space-y-3">
                  {agentCards.map(card => {
                    const client = clients.find(c => c.id === card.clientId);
                    const filledCount = card.filledCells.length;
                    const percent = Math.round((filledCount / 31) * 100);

                    return (
                      <div 
                        key={card.id}
                        onClick={() => navigateTo('card-detail', card.clientId, card.id)}
                        className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-2 hover:border-indigo-500 cursor-pointer transition shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-black text-slate-900 dark:text-white block">
                              {client?.name || 'Adhérent inconnu'}
                            </span>
                            <span className="text-[9px] text-slate-400">Fiche #{card.cardNumber.slice(-6)} • {card.amount.toLocaleString()} F / jour</span>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-black font-mono text-indigo-650 dark:text-indigo-400 block">
                              {(card.amount * filledCount).toLocaleString()} F
                            </span>
                            <span className="text-[9px] text-slate-400 block font-bold uppercase">
                              {filledCount} / 31 cases
                            </span>
                          </div>
                        </div>

                        <div className="w-full bg-slate-100 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                          <div className="bg-orange-500 h-full rounded-full" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SCREEN 7: DÉTAIL CARTE */}
            {currentScreen === 'card-detail' && currentCard && (
              <div className="space-y-6">
                <div className="flex items-center gap-2.5">
                  <button onClick={goBack} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                  </button>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Fiche de Pointage</h2>
                    <p className="text-[10px] text-slate-400">Code unique : {currentCard.cardNumber}</p>
                  </div>
                </div>

                {/* Core Pointage Visual Grid */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-slate-455 block uppercase">Titulaire</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">{currentClient?.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-bold text-slate-455 block uppercase">Versement unitaire</span>
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono">{currentCard.amount.toLocaleString()} F / Jour</span>
                    </div>
                  </div>

                  {/* The grid of 31 cases */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Grille des 31 carreaux</span>
                    <div className="grid grid-cols-6 gap-2">
                      {Array.from({ length: 31 }).map((_, idx) => {
                        const cellNum = idx + 1;
                        const isFilled = currentCard.filledCells.includes(cellNum);
                        const isCompanyCell = cellNum === 31;

                        return (
                          <div 
                            key={cellNum}
                            className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative font-mono text-xs font-black transition-all ${
                              isFilled 
                                ? 'bg-emerald-500 border-emerald-600 text-white shadow-xs scale-98' 
                                : isCompanyCell
                                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-650 dark:text-amber-400'
                                  : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-400'
                            }`}
                          >
                            <span>{cellNum}</span>
                            {isCompanyCell && (
                              <span className="text-[7px] font-sans font-extrabold uppercase mt-0.5 tracking-tight">MKB</span>
                            )}
                            {isFilled && <Check className="w-3.5 h-3.5 absolute -bottom-1 -right-1 bg-white text-emerald-600 rounded-full border border-emerald-500 p-0.5" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigateTo('pointing-form', currentClient?.id, currentCard.id)}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-650 text-white text-xs font-black uppercase rounded-2xl tracking-wider shadow-md transition cursor-pointer"
                >
                  Effectuer un Versement sur cette Fiche
                </button>

              </div>
            )}

            {/* SCREEN 8: FORMULAIRE ENCAISSEMENT (POINTAGE) */}
            {currentScreen === 'pointing-form' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2.5">
                  <button onClick={goBack} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                  </button>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Faire un Pointage</h2>
                    <p className="text-[10px] text-slate-400">Enregistrer une cotisation d'épargne d'un bénéficiaire</p>
                  </div>
                </div>

                <form onSubmit={handlePointingSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-xs">
                  <div>
                    <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-1">Choisir l'Adhérent</label>
                    <select 
                      value={selectedClientId || ''}
                      onChange={(e) => {
                        const cid = e.target.value;
                        setSelectedClientId(cid);
                        const userCards = cards.filter(c => c.clientId === cid && !c.isCompleted);
                        if (userCards.length > 0) {
                          setSelectedCardId(userCards[0].id);
                        } else {
                          setSelectedCardId('');
                        }
                      }}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-450 font-bold text-slate-900 dark:text-white"
                    >
                      <option value="" disabled>-- Sélectionner un client --</option>
                      {agentClients.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.zone})</option>
                      ))}
                    </select>
                  </div>

                  {selectedClientId && (
                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-1">Associer à la Fiche</label>
                        {cards.filter(c => c.clientId === selectedClientId && !c.isCompleted).length === 0 ? (
                          <div className="p-3.5 bg-rose-500/10 border border-rose-500/15 rounded-2xl text-rose-600 dark:text-rose-450 space-y-2">
                            <p className="text-[10px] leading-relaxed">
                              Cet adhérent ne dispose d'aucune fiche de pointage active. Souhaitez-vous lui en ouvrir une immédiatement ?
                            </p>
                            <div className="flex gap-2">
                              <select 
                                value={newCardValue}
                                onChange={(e) => setNewCardValue(Number(e.target.value))}
                                className="px-2 py-1 bg-white dark:bg-slate-900 text-xs rounded border text-slate-900 dark:text-white"
                              >
                                <option value={500}>500 F / jour</option>
                                <option value={1000}>1 000 F / jour</option>
                                <option value={2000}>2 000 F / jour</option>
                                <option value={5000}>5 000 F / jour</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => handleCreateCardSubmit(selectedClientId)}
                                className="px-3 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black rounded uppercase"
                              >
                                Créer Fiche
                              </button>
                            </div>
                          </div>
                        ) : (
                          <select 
                            value={selectedCardId || ''}
                            onChange={(e) => {
                              setSelectedCardId(e.target.value);
                            }}
                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-450 font-mono text-slate-900 dark:text-white"
                          >
                            <option value="" disabled>-- Choisir un carnet --</option>
                            {cards.filter(c => c.clientId === selectedClientId && !c.isCompleted).map(c => (
                              <option key={c.id} value={c.id}>
                                Fiche #{c.cardNumber.slice(-6)} ({c.amount.toLocaleString()} F / jour) — {c.filledCells.length}/31 Cases
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {selectedCardId && currentCard && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-1.5">Saisir le Montant Reçu (FCFA)</label>
                            <div className="grid grid-cols-4 gap-2 mb-2 font-mono">
                              {[
                                { label: '1 Jour', val: currentCard.amount },
                                { label: '2 Jours', val: currentCard.amount * 2 },
                                { label: '5 Jours', val: currentCard.amount * 5 },
                                { label: '10 Jours', val: currentCard.amount * 10 }
                              ].map(p => (
                                <button
                                  type="button"
                                  key={p.label}
                                  onClick={() => setPointingAmount(p.val.toString())}
                                  className={`py-2 px-1 rounded-xl border text-[10px] font-bold ${
                                    pointingAmount === p.val.toString()
                                      ? 'bg-orange-500 border-orange-600 text-white'
                                      : 'bg-slate-50 border-slate-200 dark:bg-slate-850 dark:border-slate-800 text-slate-600'
                                  }`}
                                >
                                  {p.label}
                                </button>
                              ))}
                            </div>

                            <input 
                              type="number" 
                              required
                              placeholder="Entrez le montant en FCFA..."
                              value={pointingAmount}
                              onChange={(e) => setPointingAmount(e.target.value)}
                              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-450 font-mono font-black text-slate-900 dark:text-white"
                            />
                          </div>

                          <div className="flex gap-3 pt-3">
                            <button 
                              type="button" 
                              onClick={goBack}
                              className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 rounded-xl text-xs font-black uppercase transition cursor-pointer"
                            >
                              Annuler
                            </button>
                            <button 
                              type="submit"
                              className="flex-grow py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-95 text-white text-xs font-black uppercase rounded-xl transition cursor-pointer shadow-md"
                            >
                              Valider l'Encaissement
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* SCREEN 9: CONFIRMATION ENCAISSEMENT */}
            {currentScreen === 'confirm-pointing' && currentClient && (
              <div className="space-y-6 text-center">
                <div className="p-4 bg-emerald-500/15 border border-emerald-500/20 rounded-full w-20 h-20 mx-auto flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Versement Enregistré !</h2>
                  <p className="text-xs text-slate-455 leading-relaxed max-w-xs mx-auto">
                    Le pointage est stocké avec le statut **"En attente"** d'approbation par le caissier de l'agence.
                  </p>
                </div>

                <div className="flex flex-col gap-2 max-w-sm mx-auto">
                  <button 
                    onClick={() => {
                      if (justRecordedTx) {
                        navigateTo('receipts', currentClient.id, undefined, undefined, justRecordedTx.id);
                      }
                    }}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md cursor-pointer"
                  >
                    Voir le Reçu Numérique
                  </button>

                  <button 
                    onClick={() => navigateTo('client-dossier', currentClient.id)}
                    className="w-full py-3 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black uppercase hover:bg-slate-50 cursor-pointer"
                  >
                    Retour au dossier client
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 11: TOURNÉE DU JOUR */}
            {currentScreen === 'daily-tour' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <button onClick={goBack} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                  </button>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Tournée du Jour</h2>
                    <p className="text-[10px] text-slate-400">Routage dynamique pour optimiser vos collectes terrain</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">Progression d'activité</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {Object.keys(tourVisits).length} / {dailyTourList.length} clients visités
                      </span>
                    </div>
                    <span className="text-sm font-mono font-black text-indigo-650 dark:text-indigo-400">{tourProgressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${tourProgressPercent}%` }} />
                  </div>
                </div>

                <div className="space-y-3">
                  {dailyTourList.map(({ client, priority, advice, activeCards }) => {
                    const statusObj = tourVisits[client.id];
                    const activeCard = activeCards[0];

                    return (
                      <div 
                        key={client.id}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4.5 space-y-3 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-black text-xs text-slate-900 dark:text-white block">{client.name}</span>
                            <span className="text-[10px] text-slate-400">{client.phone} • {client.zone}</span>
                          </div>

                          <span className={`px-2.5 py-0.5 text-[9px] font-black rounded-full uppercase ${
                            statusObj 
                              ? 'bg-emerald-100 text-emerald-600'
                              : priority === 'URGENT' 
                                ? 'bg-rose-100 text-rose-600'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {statusObj ? 'Pointé' : priority}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl text-[10px] font-medium leading-relaxed">
                          <strong>Conseil :</strong> {advice}
                        </div>

                        <div className="flex gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                          <button 
                            onClick={() => navigateTo('client-dossier', client.id)}
                            className="px-3 py-2 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 rounded-xl text-[10px] font-black uppercase cursor-pointer"
                          >
                            Dossier
                          </button>

                          <button 
                            onClick={() => {
                              if (activeCard) {
                                navigateTo('pointing-form', client.id, activeCard.id);
                              } else {
                                navigateTo('pointing-form', client.id);
                              }
                            }}
                            className="px-3.5 py-2 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase flex-grow text-center cursor-pointer shadow-xs"
                          >
                            Pointage
                          </button>

                          <button 
                            onClick={() => toggleTourVisit(client.id, 'visited')}
                            className={`p-1.5 rounded-xl border cursor-pointer ${statusObj?.status === 'visited' ? 'bg-emerald-500 border-emerald-600 text-white' : 'border-slate-200 hover:bg-slate-100'}`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SCREEN 12: ASSISTANCES ET PRÊTS */}
            {currentScreen === 'assistances' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <button onClick={goBack} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                  </button>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Financements & Assistances</h2>
                    <p className="text-[10px] text-slate-400">Micro-financements accordés aux adhérents vertueux</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl space-y-4 shadow-xs">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-teal-600" />
                    <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white">Créer Demande de Financement</h3>
                  </div>

                  <form onSubmit={handleApplyAssistanceSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-1">Sélectionner l'Adhérent éligible</label>
                      <select 
                        required
                        value={selectedClientId || ''}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                      >
                        <option value="" disabled>-- Sélectionner --</option>
                        {agentClients.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-1">Montant Souhaité (FCFA)</label>
                        <input 
                          type="number"
                          required
                          value={assistanceForm.amount}
                          onChange={(e) => setAssistanceForm(prev => ({ ...prev, amount: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-black text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-1">Secteur / Projet</label>
                        <select 
                          value={assistanceForm.domain}
                          onChange={(e) => setAssistanceForm(prev => ({ ...prev, domain: e.target.value as any }))}
                          className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                        >
                          <option value="Commerce">Commerce / Étal</option>
                          <option value="Agriculture">Agriculture / Maraîcher</option>
                          <option value="Boutique">Boutique / Épicerie</option>
                        </select>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black uppercase shadow-xs transition cursor-pointer"
                    >
                      Soumettre la Demande
                    </button>
                  </form>
                </div>

                <div className="space-y-3 pt-2">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Demandes Actives</h3>
                  <div className="space-y-2.5">
                    {assistances.map(ast => (
                      <div 
                        key={ast.id}
                        className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-between shadow-xs"
                      >
                        <div>
                          <span className="font-black text-xs block text-slate-900 dark:text-white">{ast.clientName}</span>
                          <span className="text-[9px] text-slate-400">Projet : {ast.domain} • Taux : {ast.interestRate}%</span>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black font-mono block text-teal-650 dark:text-teal-400">
                            {ast.amount.toLocaleString()} FCFA
                          </span>
                          <span className={`text-[9px] uppercase font-black ${
                            ast.status === 'approved' ? 'text-emerald-500' : 'text-amber-500'
                          }`}>{ast.status === 'approved' ? 'Validé' : 'Attente'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 14: NOTES TERRAIN */}
            {currentScreen === 'field-notes' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <button onClick={goBack} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                  </button>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Journal des Notes Terrain</h2>
                    <p className="text-[10px] text-slate-400">Consigner des observations précieuses récoltées sur le terrain</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl space-y-4 shadow-xs">
                  <span className="text-xs font-black uppercase text-slate-800 dark:text-white flex items-center gap-1">
                    <FileText className="w-4 h-4 text-amber-500" /> Consigner une observation
                  </span>

                  <form onSubmit={handleAddNoteSubmit} className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-1">Cible Adhérent</label>
                        <select 
                          required
                          value={selectedClientId || ''}
                          onChange={(e) => setSelectedClientId(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                        >
                          <option value="" disabled>-- Choisir --</option>
                          {agentClients.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-1">Type d'incident</label>
                        <select 
                          value={newNote.type}
                          onChange={(e) => setNewNote(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                        >
                          <option value="Absent">Client absent</option>
                          <option value="Changement de Numéro">Nouveau numéro</option>
                          <option value="Veut Assistance">Demande de prêt</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-1">Note / Observation détaillée</label>
                      <textarea 
                        required
                        rows={2}
                        placeholder="Qu'avez-vous observé ou convenu avec l'adhérent ?"
                        value={newNote.content}
                        onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none text-slate-900 dark:text-white"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black uppercase transition cursor-pointer"
                    >
                      Enregistrer la Note Terrain
                    </button>
                  </form>
                </div>

                <div className="space-y-3 pt-2">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Observations Récentes</h3>
                  <div className="space-y-2.5">
                    {terrainNotes.map(n => (
                      <div key={n.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-2 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-2">
                          <div>
                            <span className="font-black text-xs text-slate-900 dark:text-white block">{n.clientName}</span>
                            <span className="text-[9px] text-slate-400">{new Date(n.createdAt).toLocaleString('fr-FR')}</span>
                          </div>
                          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black rounded uppercase">
                            {n.type}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                          {n.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 15: MES PERFORMANCES */}
            {currentScreen === 'performances' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2.5">
                  <button onClick={goBack} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                  </button>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Performances Agent</h2>
                    <p className="text-[10px] text-slate-400">Rapport de vos commissions de recouvrement (5%)</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-xs">
                    <TrendingUp className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                    <span className="text-[9px] text-slate-400 font-bold block uppercase font-sans">Com. Jour</span>
                    <span className="text-sm font-mono font-black text-slate-800 dark:text-white">
                      {Math.round(stats.todayCollected * 0.05).toLocaleString()} F
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-xs">
                    <Award className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                    <span className="text-[9px] text-slate-400 font-bold block uppercase font-sans">Com. Mois</span>
                    <span className="text-sm font-mono font-black text-indigo-650 dark:text-indigo-400">
                      {Math.round(stats.monthCollected * 0.05).toLocaleString()} F
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-xs">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                    <span className="text-[9px] text-slate-400 font-bold block uppercase font-sans">Pointages</span>
                    <span className="text-sm font-mono font-black text-slate-800 dark:text-white">
                      {collectorTx.length} ops
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl space-y-4 shadow-xs text-center text-slate-450 text-xs">
                  <Award className="w-12 h-12 text-indigo-500 mx-auto" />
                  <p className="font-bold">Excellent travail de recouvrement ce mois-ci ! Continuez ainsi.</p>
                </div>
              </div>
            )}

            {/* SCREEN 16: NOTIFICATIONS */}
            {currentScreen === 'notifications' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <button onClick={goBack} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                  </button>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Mes Alertes</h2>
                    <p className="text-[10px] text-slate-400">Rappels et notifications d'opportunités d'assistance</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {systemNotifications.map(n => (
                    <div 
                      key={n.id}
                      className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex items-start gap-3.5 shadow-xs"
                    >
                      <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-950 mt-0.5">
                        {n.icon}
                      </div>
                      <div className="flex-grow space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-tight">{n.title}</span>
                          <span className="text-[9px] text-slate-400 font-mono">{n.time}</span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 leading-relaxed font-medium">
                          {n.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SCREEN 17: ÉCRAN REÇU NUMÉRIQUE */}
            {currentScreen === 'receipts' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2.5">
                  <button onClick={goBack} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                  </button>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Preuve de Versement</h2>
                    <p className="text-[10px] text-slate-400">Reçu thermique officiel d'épargne MOBIKISSI</p>
                  </div>
                </div>

                <div className="bg-white text-slate-950 border border-slate-300 rounded-3xl p-6 space-y-5 max-w-sm mx-auto shadow-md font-mono text-xs">
                  <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300">
                    <h3 className="text-sm font-black tracking-widest">MOBIKISSI MICROFINANCE</h3>
                    <p className="text-[10px]">L'épargne en toute confiance</p>
                    <p className="text-[9px]">Secteur : {agent.zone}</p>
                  </div>

                  <div className="space-y-2 border-b border-dashed border-slate-300 pb-4">
                    <div className="flex justify-between">
                      <span>REÇU ID :</span>
                      <span className="font-bold">{selectedTxId ? selectedTxId.slice(-12) : `REC-${Date.now().toString().slice(-8)}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>DATE :</span>
                      <span>{new Date().toLocaleString('fr-FR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AGENT :</span>
                      <span>{agent.name}</span>
                    </div>
                  </div>

                  <div className="py-4 text-center space-y-1.5 bg-slate-50 rounded-2xl">
                    <span className="text-[10px] text-slate-500 block uppercase font-sans">Cotisation Reçue</span>
                    <span className="text-xl font-black">
                      {currentTransaction ? currentTransaction.amount.toLocaleString() : justRecordedTx ? justRecordedTx.amount.toLocaleString() : '1 000'} FCFA
                    </span>
                    <span className="text-[9px] text-emerald-600 block uppercase font-sans font-black">COTISATION EN ATTENTE DE CAISSE</span>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 18: RECHERCHE GLOBALE */}
            {currentScreen === 'search-global' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <button onClick={goBack} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                  </button>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Recherche Globale</h2>
                    <p className="text-[10px] text-slate-400">Rechercher n'importe quel dossier client, carte ou reçu</p>
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input 
                    type="text" 
                    placeholder="Saisissez un nom, un téléphone, ou un ID..."
                    value={globalSearchQuery}
                    onChange={(e) => setGlobalSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs focus:outline-none"
                  />
                </div>

                {globalSearchQuery && (
                  <div className="space-y-4 pt-2">
                    {globalSearchResults.clients.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Clients correspondants</span>
                        {globalSearchResults.clients.map(c => (
                          <div 
                            key={c.id}
                            onClick={() => navigateTo('client-dossier', c.id)}
                            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between cursor-pointer"
                          >
                            <span className="font-bold text-xs text-slate-850 dark:text-white">{c.name}</span>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SCREEN 19: PROFIL AGENT */}
            {currentScreen === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2.5">
                  <button onClick={goBack} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                  </button>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Mon Profil</h2>
                    <p className="text-[10px] text-slate-400">Mes informations professionnelles</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-xs text-center">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900 mx-auto flex items-center justify-center font-black text-indigo-650 text-2xl">
                    {agent.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">{agent.name}</h3>
                    <p className="text-xs text-slate-400">Agent Recouvreur Terrain</p>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-left space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Agence :</span>
                      <span className="font-bold">{agent.agency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Zone d'activité :</span>
                      <span className="font-bold">{agent.zone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Identifiant :</span>
                      <span className="font-mono font-bold">{agent.id}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* 3. PERMANENT 5-TAB BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-2.5 px-4 shadow-xl">
        <div className="max-w-md mx-auto flex items-center justify-between">
          
          <button 
            onClick={resetToHome}
            className={`flex flex-col items-center gap-1 cursor-pointer transition ${currentScreen === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase">Accueil</span>
          </button>

          <button 
            onClick={() => navigateTo('clients')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition ${currentScreen === 'clients' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase">Clients</span>
          </button>

          <button 
            onClick={() => navigateTo('pointing-form')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition ${currentScreen === 'pointing-form' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
          >
            <div className={`p-2 bg-indigo-600 text-white rounded-full -mt-6 shadow-md shadow-indigo-600/20 active:scale-95 transition`}>
              <Coins className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-black uppercase">Encaisser</span>
          </button>

          <button 
            onClick={() => navigateTo('daily-tour')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition ${currentScreen === 'daily-tour' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
          >
            <Map className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase">Tournée</span>
          </button>

          <button 
            onClick={() => navigateTo('profile')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition ${currentScreen === 'profile' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
          >
            <User className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase">Profil</span>
          </button>

        </div>
      </nav>

    </div>
  );
}
