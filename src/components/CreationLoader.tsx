import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Loader2, CheckCircle2, User, CreditCard, Sparkles, 
  ShieldCheck, Database, Cpu, ArrowRight, Check, Share2
} from 'lucide-react';

interface CreationLoaderProps {
  type: 'client' | 'card';
  data: any;
  onComplete: () => void;
}

export default function CreationLoader({ type, data, onComplete }: CreationLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const steps = type === 'client' 
    ? [
        { text: "Securing connection to TO SOLOLA Server...", icon: Cpu },
        { text: `Creating client entry for ${data.name || 'nouveau membre'}...`, icon: User },
        { text: "Generating referral code and opening fees voucher...", icon: Sparkles },
        { text: "Encrypting and syncing profile securely...", icon: Database },
        { text: "Account successfully opened! Welcome to MOBIKISSI.", icon: ShieldCheck }
      ]
    : [
        { text: "Fetching client savings profile...", icon: User },
        { text: `Initializing 31-cell pointing card at ${data.amount?.toLocaleString() || 1000} FCFA...`, icon: CreditCard },
        { text: "Applying TO SOLOLA administrative regulations...", icon: ShieldCheck },
        { text: "Generating custom pointing barcode...", icon: Cpu },
        { text: "Pointing card successfully created!", icon: ShieldCheck }
      ];

  useEffect(() => {
    // Speed of steps
    const timer = setInterval(() => {
      setProgress(oldProgress => {
        if (oldProgress >= 100) {
          clearInterval(timer);
          setIsFinished(true);
          return 100;
        }
        const diff = Math.random() * 8 + 4;
        const next = Math.min(oldProgress + diff, 100);
        
        // Map progress of 0-100 to steps
        const stepIndex = Math.min(Math.floor((next / 101) * steps.length), steps.length - 1);
        setCurrentStep(stepIndex);
        
        return next;
      });
    }, 150);

    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md text-white p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        {/* Particle and lighting accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-orange-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-slate-900 border border-slate-800 text-orange-500 animate-pulse">
            {type === 'client' ? <User className="w-8 h-8" /> : <CreditCard className="w-8 h-8" />}
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {type === 'client' ? "Création du Compte Client" : "Émission de la Nouvelle Carte"}
          </h2>
          <p className="text-sm text-slate-400">
            {type === 'client' 
              ? "Veuillez patienter pendant que nous initialisons le profil membre." 
              : "Configuration de la carte de versement journalier en cours."}
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
              {progress < 100 ? "TRAITEMENT SÉCURISÉ..." : "TERMINÉ"}
            </span>
            <span>{Math.floor(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <motion.div 
              className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500" 
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Dynamic Log Steps */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 space-y-3 mb-8 min-h-[160px] flex flex-col justify-center">
          {steps.map((step, idx) => {
            const IconComponent = step.icon;
            const isActive = idx === currentStep;
            const isPassed = idx < currentStep;
            
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ 
                  opacity: isActive || isPassed ? 1 : 0.3,
                  x: 0,
                  scale: isActive ? 1.02 : 1
                }}
                className={`flex items-start gap-3 text-xs ${
                  isActive ? 'text-slate-105 font-bold' : isPassed ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                <div className={`mt-0.5 p-1 rounded-md ${
                  isActive ? 'bg-orange-500/20 text-orange-400' : isPassed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'
                }`}>
                  {isPassed ? <Check className="w-3.5 h-3.5" /> : <IconComponent className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="leading-relaxed">{step.text}</p>
                  {isActive && (
                    <span className="inline-block text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                      En cours...
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Finish Panel Summary */}
        <AnimatePresence>
          {isFinished && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="space-y-6 pt-2 border-t border-slate-850"
            >
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-full">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-200">
                    {type === 'client' ? "Carte de membre ACTIVE" : "Carte à Pointage ACTIVÉE"}
                  </h4>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {type === 'client' 
                      ? `Client : ${data.name} • Zone ${data.zone}` 
                      : `Frais : ${data.amount?.toLocaleString() || 1000} FCFA / jour`}
                  </p>
                  {type === 'client' && data.referralCode && (
                    <span className="inline-block mt-1 bg-emerald-400/10 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded font-bold border border-emerald-500/20">
                      Code : {data.referralCode}
                    </span>
                  )}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={onComplete}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-orange-500/10 transition-all flex items-center justify-center gap-2"
              >
                <span>Accéder au Tableau de Bord</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
