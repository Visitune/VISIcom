
import React, { useState } from 'react';
import { Contact, Activity } from '../types';
import { Phone, ChevronLeft, ChevronRight, Mic, CheckCircle, XCircle, Clock, CalendarClock } from 'lucide-react';

interface CallModeProps {
  contacts: Contact[];
  onUpdateContact: (contact: Contact) => void;
  onExit: () => void;
}

const CallMode: React.FC<CallModeProps> = ({ contacts, onUpdateContact, onExit }) => {
  // Filter only Leads or Qualified for call list
  const callList = contacts.filter(c => c.status === 'Lead' || c.status === 'Qualified');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [note, setNote] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);

  const currentContact = callList[currentIndex];

  const handleNext = () => {
    if (currentIndex < callList.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setNote('');
        setIsCallActive(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
        setNote('');
        setIsCallActive(false);
    }
  };

  const logOutcome = (outcome: 'interested' | 'callback' | 'not-interested') => {
      if (!currentContact) return;

      let description = '';
      if (outcome === 'interested') description = "Appel : Intéressé - À suivre";
      if (outcome === 'callback') description = "Appel : À rappeler plus tard";
      if (outcome === 'not-interested') description = "Appel : Pas intéressé";

      if (note) description += ` | Note: ${note}`;

      const newActivity: Activity = {
          id: Date.now().toString(),
          type: 'call',
          description,
          date: new Date().toISOString(),
          isDone: true
      };

      const updatedContact = {
          ...currentContact,
          activities: [newActivity, ...currentContact.activities],
          lastContact: new Date().toISOString()
      };
      
      onUpdateContact(updatedContact);
      handleNext();
  };

  if (!currentContact) {
      return (
          <div className="h-full flex items-center justify-center flex-col p-4">
              <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
                  <h2 className="text-2xl font-bold text-slate-800 mb-4">Liste d'appel terminée !</h2>
                  <p className="text-slate-600 mb-6">Vous avez parcouru tous les contacts éligibles.</p>
                  <button onClick={onExit} className="w-full bg-slate-900 text-white px-6 py-3 rounded-lg font-medium">Retour au CRM</button>
              </div>
          </div>
      );
  }

  return (
    <div className="h-full bg-slate-900 text-white p-4 md:p-8 flex flex-col overflow-y-auto">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
            <button onClick={onExit} className="text-slate-400 hover:text-white flex items-center gap-2">
                <ChevronLeft size={20} /> <span className="hidden md:inline">Quitter le mode Focus</span> <span className="md:hidden">Retour</span>
            </button>
            <div className="text-slate-400 font-mono text-sm">
                {currentIndex + 1} / {callList.length}
            </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-8">
            {/* Top/Left Card: Contact Info */}
            <div className="w-full md:w-1/2 bg-slate-800 rounded-2xl p-6 md:p-8 flex flex-col justify-center items-center text-center shadow-2xl border border-slate-700 flex-shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-indigo-500 flex items-center justify-center text-3xl font-bold mb-4 md:mb-6">
                    {currentContact.firstName[0]}{currentContact.lastName[0]}
                </div>
                <h1 className="text-2xl md:text-4xl font-bold mb-2">{currentContact.firstName} {currentContact.lastName}</h1>
                <h2 className="text-xl md:text-2xl text-slate-400 mb-4 md:mb-6">{currentContact.company}</h2>
                
                <div className="bg-slate-900/50 rounded-xl p-4 md:p-6 w-full max-w-sm border border-slate-700 mb-6 md:mb-8">
                    <div className="flex items-center justify-center gap-3 text-2xl md:text-3xl font-mono text-green-400 mb-2">
                        <Phone size={24} className="md:w-7 md:h-7" />
                        {currentContact.phone}
                    </div>
                    <div className="text-slate-500 text-xs md:text-sm">Dernier contact: {new Date(currentContact.lastContact).toLocaleDateString()}</div>
                </div>

                {!isCallActive ? (
                    <button 
                        onClick={() => {
                            window.location.href = `tel:${currentContact.phone}`;
                            setIsCallActive(true);
                        }}
                        className="w-full max-w-xs bg-green-500 hover:bg-green-600 text-white py-3 md:py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-transform active:scale-95"
                    >
                        <Phone size={24} />
                        Lancer l'appel
                    </button>
                ) : (
                    <div className="animate-pulse text-green-400 font-bold text-xl flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        En communication...
                    </div>
                )}
            </div>

            {/* Bottom/Right Card: Actions & Script */}
            <div className="w-full md:w-1/2 flex flex-col gap-4 md:gap-6">
                <div className="bg-slate-800 rounded-xl p-4 md:p-6 border border-slate-700 flex-1">
                    <h3 className="text-slate-400 uppercase text-xs font-bold tracking-wider mb-2 md:mb-4">Script Suggéré</h3>
                    <p className="text-base md:text-lg leading-relaxed text-slate-200 mb-4">
                        "Bonjour {currentContact.firstName}, ici [Votre Nom] du cabinet ConsultAI. 
                        Je vous appelle concernant votre intérêt pour la certification {currentContact.certificationInterest || 'Qualité'}..."
                    </p>
                    <div className="mt-2 md:mt-6">
                        <label className="text-slate-400 text-sm block mb-2">Notes d'appel</label>
                        <textarea 
                            className="w-full h-24 md:h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 md:p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none text-base"
                            placeholder="Prendre des notes rapides ici..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <button onClick={() => logOutcome('not-interested')} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 p-3 md:p-4 rounded-xl flex flex-col items-center gap-2 transition-colors active:bg-red-500/30">
                        <XCircle size={24} />
                        <span className="font-bold text-xs md:text-base">Non</span>
                    </button>
                    <button onClick={() => logOutcome('callback')} className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 p-3 md:p-4 rounded-xl flex flex-col items-center gap-2 transition-colors active:bg-amber-500/30">
                        <Clock size={24} />
                        <span className="font-bold text-xs md:text-base">Rappel</span>
                    </button>
                    <button onClick={() => logOutcome('interested')} className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 p-3 md:p-4 rounded-xl flex flex-col items-center gap-2 transition-colors active:bg-green-500/30">
                        <CheckCircle size={24} />
                        <span className="font-bold text-xs md:text-base">Oui</span>
                    </button>
                </div>
                
                <div className="flex justify-between pb-8 md:pb-0">
                     <button onClick={handlePrev} disabled={currentIndex === 0} className="text-slate-500 hover:text-white disabled:opacity-30 p-2">
                        Précédent
                     </button>
                     <button onClick={handleNext} disabled={currentIndex === callList.length - 1} className="text-slate-500 hover:text-white disabled:opacity-30 p-2">
                        Passer
                     </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default CallMode;
