
import React, { useState } from 'react';
import { Contact, getScoreColor } from '../types';
import { Search, Filter, Mail, Plus } from 'lucide-react';

interface ContactListProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  onAddContact: () => void;
  pipelineStages: string[];
}

const ContactList: React.FC<ContactListProps> = ({ contacts, onSelectContact, onAddContact, pipelineStages }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = 
      c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="h-full flex flex-col p-4 md:p-8 bg-slate-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Contacts</h1>
        <button 
            onClick={onAddContact}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 md:px-4 md:py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-sm"
        >
          <Plus size={20} />
          <span className="hidden md:inline">Nouveau Contact</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 md:top-3 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher nom, société..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="md:w-48 relative">
            <Filter className="absolute left-3 top-2.5 md:top-3 text-slate-400" size={16} />
            <select 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none text-slate-700 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">Tous les statuts</option>
              {pipelineStages.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
        </div>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden flex-1 overflow-y-auto space-y-3 pb-20">
         {filteredContacts.map(contact => {
             const score = contact.score || 0;
             const scoreStyle = getScoreColor(score);
             return (
                 <div 
                    key={contact.id} 
                    onClick={() => onSelectContact(contact)}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm active:scale-[0.99] active:bg-slate-50 transition-all cursor-pointer"
                 >
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                                {contact.firstName[0]}{contact.lastName[0]}
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-slate-800 text-sm truncate">{contact.firstName} {contact.lastName}</h3>
                                <p className="text-xs text-slate-500 truncate">{contact.company}</p>
                            </div>
                        </div>
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wide rounded-full shrink-0">
                            {contact.status}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-50 pt-3">
                        <div className="flex items-center gap-2">
                             <span title={`Score: ${score}`} className={`flex items-center gap-1 font-bold ${scoreStyle.color} bg-opacity-10 px-1.5 py-0.5 rounded-md bg-slate-100`}>
                                <span>{scoreStyle.icon}</span>
                                <span>{score}</span>
                             </span>
                        </div>
                        <div className="flex items-center gap-2 truncate pr-2">
                            <Mail size={14} className="shrink-0" />
                            <span className="truncate">{contact.email}</span>
                        </div>
                    </div>
                 </div>
             );
         })}
         {filteredContacts.length === 0 && (
             <div className="text-center text-slate-400 py-10">Aucun contact trouvé.</div>
         )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="p-4 font-semibold text-slate-600 text-sm border-b border-slate-200">Nom</th>
                <th className="p-4 font-semibold text-slate-600 text-sm border-b border-slate-200">Société</th>
                <th className="p-4 font-semibold text-slate-600 text-sm border-b border-slate-200">Statut</th>
                <th className="p-4 font-semibold text-slate-600 text-sm border-b border-slate-200">Intérêt</th>
                <th className="p-4 font-semibold text-slate-600 text-sm border-b border-slate-200">Score</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact) => {
                const score = contact.score || 0;
                const scoreStyle = getScoreColor(score);
                
                return (
                    <tr 
                      key={contact.id} 
                      onClick={() => onSelectContact(contact)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100 last:border-0"
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                            {contact.firstName[0]}{contact.lastName[0]}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{contact.firstName} {contact.lastName}</div>
                            <div className="text-xs text-slate-500">{contact.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-700">{contact.company}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700`}>
                          {contact.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-600">{contact.certificationInterest || '-'}</td>
                      <td className="p-4">
                         <div className={`flex items-center gap-1.5 font-bold text-sm ${scoreStyle.color}`}>
                             <span className="text-base">{scoreStyle.icon}</span>
                             <span>{score}</span>
                         </div>
                      </td>
                    </tr>
                );
              })}
              {filteredContacts.length === 0 && (
                 <tr>
                   <td colSpan={5} className="p-8 text-center text-slate-500">
                     Aucun contact trouvé.
                   </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContactList;
