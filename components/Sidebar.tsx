
import React from 'react';
import { LayoutDashboard, Users, FileText, Settings, Kanban, CalendarDays, FolderOpen, X, BookOpen, CheckSquare } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'pipeline', label: 'Pipeline', icon: Kanban },
    { id: 'tasks', label: 'Tâches', icon: CheckSquare },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'documents', label: 'Documents (Drive)', icon: FolderOpen },
    { id: 'calendar', label: 'Calendrier', icon: CalendarDays },
    { id: 'reports', label: 'Rapports & Stats', icon: FileText },
    { id: 'guide', label: 'Guide Utilisateur', icon: BookOpen },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/80 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed top-0 left-0 bottom-0 z-50
        w-64 bg-slate-900 text-white flex flex-col h-[100dvh]
        transition-transform duration-300 ease-in-out border-r border-slate-800 shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        pb-[env(safe-area-inset-bottom)]
      `}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between pt-[max(1.5rem,env(safe-area-inset-top))]">
          <div className="flex items-center space-x-3">
             <img 
                src="https://raw.githubusercontent.com/M00N69/RAPPELCONSO/main/logo%2004%20copie.jpg" 
                alt="VISIcom Logo" 
                className="w-10 h-10 rounded-lg object-cover bg-white"
             />
            <span className="font-bold text-lg tracking-tight">VISIcom</span>
          </div>
          <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onChangeView(item.id);
                  onClose();
                }}
                className={`w-full flex items-center space-x-3 px-4 py-4 md:py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium text-base md:text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 pb-[calc(2rem+env(safe-area-inset-bottom))] md:pb-4">
          <div className="bg-slate-800 rounded-lg p-3 text-sm text-slate-400 border border-slate-700">
            <p className="font-semibold text-slate-300 mb-2 text-xs uppercase tracking-wider">État Système</p>
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></span>
              <span className="text-xs">Données: Actives</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></span>
              <span className="text-xs">IA Gemini: Prête</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
