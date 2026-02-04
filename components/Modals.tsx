
import React, { useState } from 'react';
import { Contact, ContactStatus, Proposal } from '../types';
import { X, Save, Phone, Mail, Sparkles, CalendarClock } from 'lucide-react';

// --- Base Modal Component ---
interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center flex-shrink-0">
        <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X size={20} />
        </button>
      </div>
      <div className="p-6 overflow-y-auto flex-1">
        {children}
      </div>
    </div>
  </div>
);

// --- New Contact Modal ---
interface NewContactModalProps {
  onClose: () => void;
  onSave: (contact: Contact) => void;
  interestOptions: string[];
}

export const NewContactModal: React.FC<NewContactModalProps> = ({ onClose, onSave, interestOptions }) => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', company: '', email: '', phone: '', interest: '',
    siret: '', address: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newContact: Contact = {
      id: Date.now().toString(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      company: formData.company,
      email: formData.email,
      phone: formData.phone,
      siret: formData.siret,
      address: formData.address,
      status: ContactStatus.LEAD, // Default to Lead
      tags: [],
      lastContact: new Date().toISOString(),
      notes: [],
      activities: [],
      files: [],
      proposals: [],
      certificationInterest: formData.interest,
      contractValue: 0
    };
    onSave(newContact);
  };

  return (
    <Modal title="Nouveau Contact / Entreprise" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-4">
            <h4 className="text-sm font-bold text-indigo-900 mb-3 uppercase tracking-wide">Détails Entreprise</h4>
            <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-indigo-900 mb-1">Nom Société</label>
                  <input required type="text" className="w-full bg-white border border-indigo-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-indigo-900 mb-1">SIRET</label>
                        <input type="text" className="w-full bg-white border border-indigo-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                            value={formData.siret} onChange={e => setFormData({...formData, siret: e.target.value})} placeholder="ex: 123 456 789 00012" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-indigo-900 mb-1">Adresse Siège</label>
                        <input type="text" className="w-full bg-white border border-indigo-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                            value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="ex: 10 Rue de l'Industrie..." />
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Interlocuteur Principal</h4>
            <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
                <input required type="text" className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                <input required type="text" className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
            </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input required type="email" className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                <input type="tel" className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
            </div>
            <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Intérêt</label>
            <input 
                list="interest-options-new"
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                value={formData.interest} 
                onChange={e => setFormData({...formData, interest: e.target.value})} 
            />
            <datalist id="interest-options-new">
                {interestOptions.map(opt => <option key={opt} value={opt} />)}
            </datalist>
            </div>
        </div>
        
        <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100 mt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium">Annuler</button>
          <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center space-x-2">
            <Save size={18} />
            <span>Enregistrer</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

// --- Log Activity / Reminder Modal ---
interface LogActivityModalProps {
    type: 'call' | 'email' | 'task';
    onClose: () => void;
    onSave: (description: string, dueDate?: string) => void;
}

export const LogActivityModal: React.FC<LogActivityModalProps> = ({ type, onClose, onSave }) => {
    const [desc, setDesc] = useState('');
    const [dueDate, setDueDate] = useState('');

    const getTitle = () => {
        switch(type) {
            case 'call': return 'Enregistrer un appel';
            case 'email': return 'Enregistrer un email';
            case 'task': return 'Planifier une tâche';
            default: return 'Activité';
        }
    }

    return (
        <Modal title={getTitle()} onClose={onClose}>
            <div className="space-y-4">
                <p className="text-sm text-slate-600">
                    {type === 'call' && "Décrivez le résultat de l'appel téléphonique."}
                    {type === 'email' && "L'email a été ouvert dans votre client. Enregistrez une copie du sujet ici."}
                    {type === 'task' && "Définissez la tâche à effectuer."}
                </p>
                <textarea 
                    className="w-full h-32 bg-white border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    placeholder="Détails..."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    autoFocus
                />
                
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                        <CalendarClock size={14} />
                        <span>Rappel / Date d'échéance (Optionnel)</span>
                    </label>
                    <input 
                        type="datetime-local" 
                        className="w-full bg-white border border-slate-300 rounded p-2 text-sm"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                    <button onClick={onClose} className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium">Ignorer</button>
                    <button 
                        onClick={() => onSave(desc, dueDate)} 
                        disabled={!desc}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:opacity-50"
                    >
                        Enregistrer
                    </button>
                </div>
            </div>
        </Modal>
    )
}

// --- Proposal Generator Modal ---
interface ProposalModalProps {
    onClose: () => void;
    onGenerate: (standard: string, needs: string, value: number) => void;
    isLoading: boolean;
}

export const ProposalModal: React.FC<ProposalModalProps> = ({ onClose, onGenerate, isLoading }) => {
    const [standard, setStandard] = useState('');
    const [needs, setNeeds] = useState('');
    const [value, setValue] = useState<number>(0);

    const handleGenerate = () => {
        onGenerate(standard, needs, value);
    }

    return (
        <Modal title="Générer une Offre Commerciale" onClose={onClose}>
            <div className="space-y-4">
                <div className="bg-purple-50 p-3 rounded-lg flex items-start space-x-3 text-sm text-purple-800 border border-purple-100 mb-4">
                    <Sparkles className="flex-shrink-0 mt-0.5" size={16} />
                    <p>L'IA va rédiger une proposition complète (Contexte, Méthodologie, Planning) basée sur ces informations.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Référentiel Cible</label>
                    <select 
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                        value={standard}
                        onChange={(e) => setStandard(e.target.value)}
                    >
                        <option value="">Sélectionner...</option>
                        <option value="IFS Food v8">IFS Food v8</option>
                        <option value="BRCGS Food v9">BRCGS Food v9</option>
                        <option value="FSSC 22000 v6">FSSC 22000 v6</option>
                        <option value="ISO 9001:2015">ISO 9001:2015</option>
                        <option value="Audit Blanc">Audit Blanc (Diagnostic)</option>
                        <option value="Formation HACCP">Formation HACCP</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Besoins Spécifiques & Contexte</label>
                    <textarea 
                        className="w-full h-24 bg-white border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 resize-none"
                        placeholder="Ex: L'entreprise souhaite passer la certification sous 6 mois. Ils ont déjà le manuel qualité mais pas l'analyse de risques..."
                        value={needs}
                        onChange={(e) => setNeeds(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Budget Estimatif (€)</label>
                    <input 
                        type="number" 
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                        value={value}
                        onChange={(e) => setValue(Number(e.target.value))}
                        placeholder="5000"
                    />
                </div>

                <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
                    <button onClick={onClose} disabled={isLoading} className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium">Annuler</button>
                    <button 
                        onClick={handleGenerate} 
                        disabled={!standard || !needs || isLoading}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <span>Génération en cours...</span>
                        ) : (
                            <>
                                <Sparkles size={18} />
                                <span>Générer l'offre</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
