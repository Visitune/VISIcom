
import React, { useState } from 'react';
import { Contact } from '../types';
import { MoreHorizontal, AlertCircle } from 'lucide-react';

interface PipelineProps {
  contacts: Contact[];
  onUpdateContact: (contact: Contact) => void;
  onSelectContact: (contact: Contact) => void;
  pipelineStages: string[];
}

const Pipeline: React.FC<PipelineProps> = ({ contacts, onUpdateContact, onSelectContact, pipelineStages }) => {
  const [draggedContactId, setDraggedContactId] = useState<string | null>(null);

  const getColumnColor = (index: number) => {
    // Defines a palette to cycle through for dynamic columns
    const palette = [
        'bg-blue-50 border-blue-200',
        'bg-indigo-50 border-indigo-200',
        'bg-purple-50 border-purple-200',
        'bg-amber-50 border-amber-200',
        'bg-green-50 border-green-200',
        'bg-teal-50 border-teal-200',
        'bg-rose-50 border-rose-200',
        'bg-slate-100 border-slate-200',
    ];
    return palette[index % palette.length];
  };

  const handleDragStart = (e: React.DragEvent, contactId: string) => {
    setDraggedContactId(contactId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (draggedContactId) {
      const contact = contacts.find(c => c.id === draggedContactId);
      if (contact && contact.status !== status) {
        onUpdateContact({ ...contact, status });
      }
      setDraggedContactId(null);
    }
  };

  return (
    <div className="h-full p-4 md:p-6 flex flex-col bg-slate-50 overflow-hidden">
       <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Pipeline</h1>
        <div className="md:hidden text-xs text-slate-500 italic">Glisser pour voir les étapes →</div>
      </div>
      
      {/* 
          Mobile: Horizontal scroll with snap (Carousel)
          Desktop: Flex layout 
      */}
      <div className="flex-1 flex gap-4 overflow-x-auto overflow-y-hidden snap-x snap-mandatory md:snap-none pb-2">
        {pipelineStages.map((status, index) => {
          const columnContacts = contacts.filter(c => c.status === status);
          const totalValue = columnContacts.reduce((acc, c) => acc + (c.contractValue || 0), 0);

          return (
            <div 
              key={status}
              className={`
                min-w-[85vw] md:min-w-[280px] md:flex-1 md:w-auto 
                snap-center flex-shrink-0 
                rounded-xl border flex flex-col h-full 
                ${getColumnColor(index)} 
                transition-colors
              `}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              {/* Column Header */}
              <div className="p-3 md:p-4 border-b border-black/5 bg-white/50 backdrop-blur-sm rounded-t-xl flex-shrink-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-slate-700 uppercase tracking-wide text-xs truncate max-w-[70%]" title={status}>{status}</h3>
                  <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold text-slate-500 shadow-sm">
                    {columnContacts.length}
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-600">
                  €{totalValue.toLocaleString()}
                </div>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {columnContacts.map(contact => {
                    // Check for overdue tasks
                    const hasOverdue = contact.activities.some(a => a.dueDate && new Date(a.dueDate) < new Date() && !a.isDone);
                    
                    return (
                        <div
                        key={contact.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, contact.id)}
                        onClick={() => onSelectContact(contact)}
                        className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative active:scale-[0.98]"
                        >
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-slate-800 text-sm truncate max-w-[85%]">{contact.company}</span>
                            <button className="text-slate-400 hover:text-slate-600 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal size={16} />
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mb-2 truncate">{contact.firstName} {contact.lastName}</p>
                        
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
                            <span className="font-bold text-indigo-600 text-xs">€{(contact.contractValue || 0).toLocaleString()}</span>
                            {hasOverdue && (
                                <div className="text-red-500 flex items-center gap-1" title="Tâche en retard">
                                    <AlertCircle size={12} />
                                </div>
                            )}
                        </div>
                        
                        {contact.certificationInterest && (
                            <div className="mt-2">
                                <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] truncate max-w-full">
                                    {contact.certificationInterest}
                                </span>
                            </div>
                        )}
                        </div>
                    );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pipeline;
