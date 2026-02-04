
import React, { useState } from 'react';
import { Contact, Activity } from '../types';
import { CheckSquare, Briefcase, Phone, Mail, Users, Plus, CheckCircle2, Circle } from 'lucide-react';
import { LogActivityModal } from './Modals';

interface TasksViewProps {
  contacts: Contact[];
  onUpdateContact: (contact: Contact) => void;
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const TasksView: React.FC<TasksViewProps> = ({ contacts, onUpdateContact, onNotify }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue' | 'done'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedContactForTask, setSelectedContactForTask] = useState<Contact | null>(null);

  // Flatten all tasks
  const allTasks = contacts.flatMap(c => 
    c.activities.filter(a => a.type === 'task' || a.dueDate).map(a => ({
        ...a,
        contactId: c.id,
        contactName: `${c.firstName} ${c.lastName}`,
        company: c.company,
        contact: c
    }))
  );

  const filteredTasks = allTasks.filter(task => {
      const isDone = !!task.isDone;
      const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() && !isDone : false;
      const matchesSearch = task.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            task.company.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      switch(filter) {
          case 'pending': return !isDone;
          case 'done': return isDone;
          case 'overdue': return isOverdue;
          default: return true;
      }
  }).sort((a, b) => {
      if (a.isDone !== b.isDone) return a.isDone ? 1 : -1;
      // Sort by due date (closest first)
      if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      return 0;
  });

  const toggleTask = (task: any) => {
      const contact = contacts.find(c => c.id === task.contactId);
      if (!contact) return;

      const updatedActivities = contact.activities.map(a => 
          a.id === task.id ? { ...a, isDone: !a.isDone } : a
      );
      
      onUpdateContact({ ...contact, activities: updatedActivities });
      onNotify(task.isDone ? "Tâche rouverte" : "Tâche terminée !", "success");
  };

  const handleAddTask = (desc: string, dueDate?: string) => {
      if (!selectedContactForTask) {
          // If no contact selected (e.g. generic task), we might need a dummy contact or force selection.
          // For now, let's attach to the first contact or handle generic tasks later.
          // In this simplified CRM, we attach to a contact.
          if (contacts.length > 0) {
             const contact = contacts[0]; // Fallback
             const newActivity: Activity = {
                  id: Date.now().toString(),
                  type: 'task',
                  description: desc,
                  date: new Date().toISOString(),
                  dueDate: dueDate,
                  isDone: false
              };
              onUpdateContact({ ...contact, activities: [newActivity, ...contact.activities] });
          }
      } else {
          const newActivity: Activity = {
              id: Date.now().toString(),
              type: 'task',
              description: desc,
              date: new Date().toISOString(),
              dueDate: dueDate,
              isDone: false
          };
          onUpdateContact({ ...selectedContactForTask, activities: [newActivity, ...selectedContactForTask.activities] });
      }
      setShowAddModal(false);
      onNotify("Tâche ajoutée", "success");
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 p-4 md:p-8">
        {showAddModal && (
            <LogActivityModal 
                type="task" 
                onClose={() => setShowAddModal(false)} 
                onSave={handleAddTask} 
            />
        )}

        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
                <CheckSquare className="text-indigo-600" size={32} />
                Tâches & Rappels
            </h1>
            <button 
                onClick={() => {
                    // For simplicity, select first contact or implement a selector inside modal
                    // Here we just open modal and let logic handle it (defaults to first contact for demo)
                    setSelectedContactForTask(contacts[0]); 
                    setShowAddModal(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors"
            >
                <Plus size={20} />
                <span className="hidden md:inline">Ajouter une tâche</span>
            </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Tout</button>
                <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === 'pending' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>À faire</button>
                <button onClick={() => setFilter('overdue')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === 'overdue' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}>En retard</button>
                <button onClick={() => setFilter('done')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === 'done' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>Terminé</button>
            </div>
            <div className="flex-1 w-full relative">
                <input 
                    type="text" 
                    placeholder="Rechercher une tâche..." 
                    className="w-full pl-4 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto space-y-3 pb-20">
            {filteredTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <CheckCircle2 size={64} className="mb-4 opacity-20" />
                    <p>Aucune tâche trouvée pour ce filtre.</p>
                </div>
            )}
            {filteredTasks.map(task => {
                const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() && !task.isDone : false;
                
                return (
                    <div key={task.id} className={`bg-white p-4 rounded-xl border shadow-sm transition-all hover:shadow-md flex items-start gap-4 ${task.isDone ? 'opacity-60 border-slate-200' : isOverdue ? 'border-rose-200 bg-rose-50/10' : 'border-slate-200'}`}>
                        <button 
                            onClick={() => toggleTask(task)}
                            className={`mt-1 flex-shrink-0 transition-colors ${task.isDone ? 'text-green-500' : 'text-slate-300 hover:text-indigo-500'}`}
                        >
                            {task.isDone ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className={`font-bold text-base ${task.isDone ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                                    {task.description}
                                </h3>
                                {task.dueDate && (
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${isOverdue ? 'bg-rose-100 text-rose-700' : task.isDone ? 'bg-slate-100 text-slate-500' : 'bg-indigo-50 text-indigo-700'}`}>
                                        {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-2">
                                <div className="flex items-center gap-1.5">
                                    <Briefcase size={14} />
                                    <span className="font-medium text-slate-700">{task.company}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs">
                                    <Users size={14} />
                                    <span>{task.contactName}</span>
                                </div>
                                <div className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded border capitalize ${
                                    task.type === 'call' ? 'bg-green-50 border-green-100 text-green-700' : 
                                    task.type === 'email' ? 'bg-blue-50 border-blue-100 text-blue-700' : 
                                    'bg-slate-50 border-slate-100 text-slate-600'
                                }`}>
                                    {task.type === 'call' && <Phone size={10} />}
                                    {task.type === 'email' && <Mail size={10} />}
                                    {task.type === 'task' && <CheckSquare size={10} />}
                                    {task.type}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default TasksView;
