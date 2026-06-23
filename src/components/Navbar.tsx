/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Coins, Bell, User, Clock, Shield, Menu, X, Landmark, RefreshCw } from 'lucide-react';
import { User as UserType, SystemSetting } from '../types';

interface NavbarProps {
  currentUser: UserType;
  allUsers: UserType[];
  settings: SystemSetting;
  notifications: any[];
  onUserChange: (userId: string) => void;
  selectedTheme: any;
  onThemeChange: (themeId: string) => void;
  themesList: any[];
  onMarkNotificationsRead: () => void;
  onResetData?: () => void;
}

export default function Navbar({
  currentUser,
  allUsers,
  settings,
  notifications,
  onUserChange,
  selectedTheme,
  onThemeChange,
  themesList,
  onMarkNotificationsRead,
  onResetData
}: NavbarProps) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filter out client users vs staff for the role switcher
  const clients = allUsers.filter(u => u.role === 'CLIENT');
  const staff = allUsers.filter(u => u.role !== 'CLIENT');

  // Count unread notifications
  const unreadCount = notifications.filter(n => n.userId === currentUser.id && !n.isRead).length;
  const userNotifications = notifications.filter(n => n.userId === currentUser.id).slice(0, 5);

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl text-white ${selectedTheme.primary} shadow-md flex items-center justify-center transition-all duration-300`}>
              <Coins className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white uppercase">
                  {settings.platformName}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                  v1.2
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 italic">
                {settings.description.split('.')[0]}.
              </p>
            </div>
          </div>

          {/* Center Info - Congo / Kin Local Clock & Group Title */}
          <div className="hidden lg:flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
              <Clock className="h-4 w-4 text-emerald-500" />
              <span className="font-semibold font-mono">Brazzaville, Congo (GMT+1)</span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Propulsé par</span>
              <span className="text-xs font-extrabold text-[#ED1C24] dark:text-red-400">TO SOLOLA Group</span>
            </div>
          </div>

          {/* Right Controls - Theme, Notifications, Role Switcher */}
          <div className="flex items-center space-x-3">
            
            {/* Theme Selector Button */}
            <div className="relative">
              <button
                id="theme-menu-btn"
                onClick={() => {
                  setShowThemeMenu(!showThemeMenu);
                  setShowRoleMenu(false);
                  setShowNotificationMenu(false);
                }}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 font-medium text-xs flex items-center space-x-1.5"
                title="Changer de thème"
              >
                <span className={`w-3 h-3 rounded-full ${selectedTheme.primary} inline-block shadow-sm`} />
                <span className="hidden sm:inline text-[11px] uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300">
                  {selectedTheme.name}
                </span>
              </button>

              {showThemeMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2.5 z-50 animate-fadeIn text-sm">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    SÉLECTIONNER UN THÈME (10)
                  </div>
                  <div className="h-[240px] overflow-y-auto px-1">
                    {themesList.map((t) => (
                      <button
                        id={`theme-select-${t.id}`}
                        key={t.id}
                        onClick={() => {
                          onThemeChange(t.id);
                          setShowThemeMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs font-semibold ${
                          selectedTheme.id === t.id
                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <span className="flex items-center space-x-2">
                          <span className={`w-3.5 h-3.5 rounded-full ${t.primary} shadow-sm border border-white/25`} />
                          <span>{t.name}</span>
                        </span>
                        {selectedTheme.id === t.id && <span className="text-[10px] text-emerald-500 font-bold">ACTIF</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                id="notif-menu-btn"
                onClick={() => {
                  setShowNotificationMenu(!showNotificationMenu);
                  setShowRoleMenu(false);
                  setShowThemeMenu(false);
                  if (!showNotificationMenu) {
                    onMarkNotificationsRead();
                  }
                }}
                className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ED1C24] text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotificationMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-3 z-50 animate-fadeIn">
                  <div className="flex justify-between items-center px-4 pb-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                      Notifications ({unreadCount})
                    </span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={onMarkNotificationsRead}
                        className="text-[10px] font-bold text-blue-600 hover:underline"
                      >
                        Tout lire
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {userNotifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        Aucune notification disponible.
                      </div>
                    ) : (
                      userNotifications.map((n) => (
                        <div key={n.id} className="p-3 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase ${
                              n.type === 'deposit' ? 'bg-emerald-100 text-emerald-700' :
                              n.type === 'assistance' ? 'bg-purple-100 text-purple-700' :
                              'bg-indigo-100 text-indigo-700'
                            }`}>
                              {n.type === 'deposit' ? 'Pointage' : n.type === 'assistance' ? 'Assistance' : 'Info'}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              {new Date(n.createdAt).toLocaleDateString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{n.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SIMULATOR ROLE SWITCHER (Interactive and Essential for testing multiple roles) */}
            <div className="relative">
              <button
                id="role-menu-btn"
                onClick={() => {
                  setShowRoleMenu(!showRoleMenu);
                  setShowNotificationMenu(false);
                  setShowThemeMenu(false);
                }}
                className={`p-1.5 sm:p-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center space-x-2 transition-all cursor-pointer ${
                  currentUser.role === 'PDG' ? 'bg-slate-900 border-amber-500 text-amber-500' : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white'
                }`}
              >
                <div className={`p-1 rounded-md text-white ${selectedTheme.primary}`}>
                  <User className="h-4 w-4" />
                </div>
                <div className="hidden md:block text-left">
                  <span className="block text-xs font-bold leading-none">{currentUser.name}</span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 font-extrabold tracking-wider uppercase">
                    RÔLE: {currentUser.role}
                  </span>
                </div>
                <Shield className="h-3.5 w-3.5 text-amber-500 hidden sm:block" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-3 z-50 max-h-[450px] overflow-y-auto">
                  
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Recette & Profils de test
                    </p>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-tight mt-1">
                      Basculez entre les profils pour tester les parcours de l'application.
                    </p>
                  </div>

                  {/* PDG / Admin Option */}
                  <div className="px-3 py-1 bg-amber-50/50 dark:bg-amber-950/20 my-1">
                    <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider block px-2 mb-1">
                      Direction Générale & PDG
                    </span>
                    {staff.filter(s => s.role === 'PDG').map((u) => (
                      <button
                        id={`role-select-${u.id}`}
                        key={u.id}
                        onClick={() => {
                          onUserChange(u.id);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs font-bold border ${
                          currentUser.id === u.id
                            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-950 dark:text-amber-100 border-amber-500'
                            : 'border-transparent text-slate-700 dark:text-slate-300 hover:bg-amber-500/10'
                        }`}
                      >
                        <div>
                          <span>{u.name}</span>
                          <span className="block text-[8px] text-amber-600 dark:text-amber-400 font-semibold">PDG PRINCIPAL • CONTROLE TOTAL</span>
                        </div>
                        {currentUser.id === u.id && <span className="text-[9px] text-amber-600 font-bold uppercase">Actif</span>}
                      </button>
                    ))}
                  </div>

                  {/* Staff Options */}
                  <div className="px-3 py-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block px-2 mb-1">
                      Personnel Administratif
                    </span>
                    {staff.filter(s => s.role !== 'PDG').map((u) => {
                      if (u.role === 'PDG') return null;
                      return (
                        <button
                          id={`role-select-${u.id}`}
                          key={u.id}
                          onClick={() => {
                            onUserChange(u.id);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs font-bold ${
                            currentUser.id === u.id
                              ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                          }`}
                        >
                          <div>
                            <span>{u.name}</span>
                            <span className="block text-[8px] text-slate-500 dark:text-slate-400 font-medium">
                              {u.role === 'SUPERVISEUR' ? 'SUPERVISEUR • AUDIT & STATS' :
                               u.role === 'CAISSIER' ? 'GESTIONNAIRE DE CAISSE' :
                               u.role === 'CALL_CENTER' ? 'CONSEILLER CALL CENTER' :
                               'AGENT RECOUVREUR • COLLECTEUR'}
                            </span>
                          </div>
                          {currentUser.id === u.id && <span className="text-[9px] text-slate-500 font-bold uppercase">Actif</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Client Options */}
                  <div className="px-3 py-1 border-t border-slate-100 dark:border-slate-700 mt-2 pt-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block px-2 mb-1">
                      Clients (Pointage)
                    </span>
                    {clients.map((u) => (
                      <button
                        id={`role-select-${u.id}`}
                        key={u.id}
                        onClick={() => {
                          onUserChange(u.id);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs font-bold ${
                          currentUser.id === u.id
                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <div>
                          <span>{u.name}</span>
                          <span className="block text-[8px] text-emerald-500 font-medium">
                            Solde: {u.balance.toLocaleString()} FCFA • {u.seniorityWeeks} Sem. d'Ancienneté
                          </span>
                        </div>
                        {currentUser.id === u.id && <span className="text-[9px] text-emerald-500 font-bold uppercase">Actif</span>}
                      </button>
                    ))}
                  </div>

                  {onResetData && (
                    <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-700 mt-2">
                      <button
                        onClick={() => {
                          onResetData();
                          setShowRoleMenu(false);
                        }}
                        className="w-full text-center py-2 px-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Réinitialiser l'application
                      </button>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Mobile Menu Indicator Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-3.5">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Utilisateur Actuel</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm font-bold text-slate-950 dark:text-white">{currentUser.name}</span>
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded text-white ${selectedTheme.primary}`}>
                {currentUser.role}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-1">
              Brazzaville, Congo (GMT+1) | TO SOLOLA Group
            </p>
          </div>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setShowRoleMenu(true);
            }}
            className="w-full py-2 px-4 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-xs font-extrabold flex items-center justify-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Changer de Rôle ou de Compte</span>
          </button>
        </div>
      )}
    </header>
  );
}
