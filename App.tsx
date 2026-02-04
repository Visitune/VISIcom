
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ContactList from './components/ContactList';
import ContactDetail from './components/ContactDetail';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Pipeline from './components/Pipeline';
import CalendarView from './components/CalendarView';
import DocumentsView from './components/DocumentsView';
import UserGuide from './components/UserGuide';
import { NewContactModal } from './components/Modals';
import { MOCK_CONTACTS } from './constants';
import { Contact, Toast, ContactStatus, calculateScore } from './types';
import { CheckCircle, AlertTriangle, Info, Menu } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showNewContactModal, setShowNewContactModal] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- Dynamic Configuration State ---
  const [pipelineStages, setPipelineStages] = useState<string[]>(() => {
    const saved = localStorage.getItem('consultai_pipeline');
    return saved ? JSON.parse(saved) : Object.values(ContactStatus);
  });

  const [interestOptions, setInterestOptions] = useState<string[]>(() => {
    const saved = localStorage.getItem('consultai_interests');
    return saved ? JSON.parse(saved) : ['IFS Food', 'BRCGS', 'FSSC 22000', 'ISO 9001', 'Audit Blanc', 'Formation', 'HACCP'];
  });

  // Save config changes
  useEffect(() => {
    localStorage.setItem('consultai_pipeline', JSON.stringify(pipelineStages));
  }, [pipelineStages]);

  useEffect(() => {
    localStorage.setItem('consultai_interests', JSON.stringify(interestOptions));
  }, [interestOptions]);

  // Initialize contacts with score calculation
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('consultai_contacts');
    let loadedContacts: Contact[] = [];
    try {
        loadedContacts = saved ? JSON.parse(saved) : MOCK_CONTACTS;
    } catch (e) {
        loadedContacts = MOCK_CONTACTS;
    }
    // Ensure scores are calculated on load
    return loadedContacts.map(c => ({
        ...c,
        score: calculateScore(c)
    }));
  });

  // Persist contacts
  useEffect(() => {
     localStorage.setItem('consultai_contacts', JSON.stringify(contacts));
  }, [contacts]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      const id = Date.now().toString();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
  };

  const handleUpdateContact = (updated: Contact) => {
      // Recalculate score before saving
      const scoredContact = { ...updated, score: calculateScore(updated) };
      
      setContacts(prev => prev.map(c => c.id === scoredContact.id ? scoredContact : c));
      
      if (selectedContact && selectedContact.id === scoredContact.id) {
          setSelectedContact(scoredContact);
      }
  };

  const handleCreateContact = (newContact: Contact) => {
      const scoredContact = { ...newContact, score: calculateScore(newContact) };
      setContacts(prev => [scoredContact, ...prev]);
      setShowNewContactModal(false);
      addToast("Nouveau contact créé", "success");
      setCurrentView('contacts');
  };

  const handleImportData = (importedData: Contact[]) => {
      const scoredData = importedData.map(c => ({ ...c, score: calculateScore(c) }));
      setContacts(scoredData);
      addToast("Données importées avec succès", "success");
  };

  const handleClearData = () => {
      setContacts([]); 
      setSelectedContact(null);
      addToast("Données supprimées. Le CRM est vide.", "success");
      setCurrentView('dashboard');
  };

  const renderContent = () => {
    if (selectedContact) {
      return (
        <ContactDetail 
          contact={selectedContact} 
          onBack={() => setSelectedContact(null)}
          onUpdate={handleUpdateContact}
          onNotify={addToast}
          pipelineStages={pipelineStages}
          interestOptions={interestOptions}
        />
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard contacts={contacts} />;
      case 'contacts':
        return (
            <ContactList 
                contacts={contacts} 
                onSelectContact={setSelectedContact} 
                onAddContact={() => setShowNewContactModal(true)}
                pipelineStages={pipelineStages}
            />
        );
      case 'pipeline':
          return (
              <Pipeline 
                contacts={contacts} 
                onUpdateContact={handleUpdateContact} 
                onSelectContact={setSelectedContact} 
                pipelineStages={pipelineStages}
              />
          );
      case 'documents':
          return <DocumentsView contacts={contacts} onNotify={addToast} />;
      case 'calendar':
          return <CalendarView contacts={contacts} />;
      case 'reports':
          return <Reports contacts={contacts} />;
      case 'guide':
          return <UserGuide />;
      case 'settings':
        return (
            <Settings 
                contacts={contacts} 
                onImportData={handleImportData} 
                onClearData={handleClearData}
                pipelineStages={pipelineStages}
                setPipelineStages={setPipelineStages}
                interestOptions={interestOptions}
                setInterestOptions={setInterestOptions}
            />
        );
      default:
        return <Dashboard contacts={contacts} />;
    }
  };

  return (
    <div className="flex h-[100dvh] w-full bg-slate-50 relative overflow-hidden">
      {/* Toast Container */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 md:translate-x-0 md:top-auto md:bottom-4 md:right-4 md:left-auto z-[60] flex flex-col gap-2 pointer-events-none w-[90%] md:w-auto">
          {toasts.map(toast => (
              <div key={toast.id} className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-xl text-white text-sm font-medium animate-in slide-in-from-top md:slide-in-from-right fade-in duration-300 ${
                  toast.type === 'success' ? 'bg-green-600' : 
                  toast.type === 'error' ? 'bg-red-600' : 'bg-slate-800'
              }`}>
                  {toast.type === 'success' && <CheckCircle size={18} className="flex-shrink-0" />}
                  {toast.type === 'error' && <AlertTriangle size={18} className="flex-shrink-0" />}
                  {toast.type === 'info' && <Info size={18} className="flex-shrink-0" />}
                  <span>{toast.message}</span>
              </div>
          ))}
      </div>

      {showNewContactModal && (
          <NewContactModal 
            onClose={() => setShowNewContactModal(false)}
            onSave={handleCreateContact}
            interestOptions={interestOptions}
          />
      )}
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-30 flex items-center px-4 justify-between pt-[env(safe-area-inset-top)]">
          <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                  <Menu size={24} />
              </button>
              <div className="flex items-center gap-2">
                <img 
                    src="https://raw.githubusercontent.com/M00N69/RAPPELCONSO/main/logo%2004%20copie.jpg" 
                    alt="Logo" 
                    className="w-8 h-8 rounded-md object-cover bg-slate-50"
                />
                <span className="font-bold text-slate-800 text-lg">VISIcom</span>
              </div>
          </div>
      </div>

      <Sidebar 
          currentView={currentView} 
          onChangeView={(view) => {
              setCurrentView(view);
              setSelectedContact(null);
          }} 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
      />
      
      <main 
        className="flex-1 h-[100dvh] overflow-hidden relative transition-all duration-300 md:ml-64 pt-14 md:pt-0"
        style={{
            height: '100dvh' // Force dynamic viewport height for mobile browsers
        }}
      >
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
