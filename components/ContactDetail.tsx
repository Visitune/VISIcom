
import React, { useState } from 'react';
import { Contact, Activity, Note, Proposal, getScoreColor } from '../types';
import { ArrowLeft, Phone, Mail, FileText, Paperclip, Send, Sparkles, Brain, Check, X, Edit2, Save, Building2, Briefcase, CalendarClock, CheckSquare, Square, FileImage, File, MessageSquareText, Download, ChevronRight, Folder, TrendingUp } from 'lucide-react';
import { generateEmailDraft, analyzeContactHistory, summarizeMeetingNotes, generateConsultingProposal, askDocument } from '../services/geminiService';
import { LogActivityModal, ProposalModal } from './Modals';

interface ContactDetailProps {
  contact: Contact;
  onBack: () => void;
  onUpdate: (updatedContact: Contact) => void;
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
  pipelineStages: string[];
  interestOptions: string[];
}

const ContactDetail: React.FC<ContactDetailProps> = ({ contact, onBack, onUpdate, onNotify, pipelineStages, interestOptions }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'proposals' | 'activity' | 'files'>('overview');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [emailInstruction, setEmailInstruction] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Contact>>({});
  
  const [logModalOpen, setLogModalOpen] = useState<'call' | 'email' | 'task' | null>(null);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);

  // File Chat State
  const [chatFile, setChatFile] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'ai', text: string}[]>([]);

  // Score Visuals
  const score = contact.score || 0;
  const scoreStyle = getScoreColor(score);

  // Initialize edit form when entering edit mode
  const startEditing = () => {
    setEditForm({ ...contact });
    setIsEditing(true);
  };

  const saveEditing = () => {
    onUpdate({ ...contact, ...editForm } as Contact);
    setIsEditing(false);
    onNotify("Contact mis à jour avec succès", "success");
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const initiateEmail = () => {
      window.location.href = `mailto:${contact.email}`;
      setLogModalOpen('email');
  };

  const handleLogActivity = (desc: string, dueDate?: string) => {
      if (!logModalOpen) return;
      const newActivity: Activity = {
          id: Date.now().toString(),
          type: logModalOpen,
          description: desc,
          date: new Date().toISOString(),
          dueDate: dueDate || undefined,
          isDone: false
      };
      onUpdate({
          ...contact,
          activities: [newActivity, ...contact.activities],
          lastContact: new Date().toISOString()
      });
      setLogModalOpen(null);
      onNotify("Activité enregistrée", "success");
  };

  const toggleTaskStatus = (activityId: string) => {
      const updatedActivities = contact.activities.map(a => 
          a.id === activityId ? { ...a, isDone: !a.isDone } : a
      );
      onUpdate({ ...contact, activities: updatedActivities });
  };

  const handleGenerateDraft = async () => {
    setIsAiLoading(true);
    setAiResponse(null);
    const draft = await generateEmailDraft(contact, emailInstruction || 'Suivi concernant notre dernière conversation.');
    setAiResponse(draft);
    setIsAiLoading(false);
    onNotify("Brouillon généré", "info");
  };

  const handleAnalyzeHistory = async () => {
    setIsAiLoading(true);
    setAiResponse(null);
    const analysis = await analyzeContactHistory(contact);
    setAiResponse(analysis);
    setIsAiLoading(false);
    onNotify("Analyse terminée", "info");
  }

  const handleAddNote = () => {
      if(!noteInput.trim()) return;
      
      const newNote: Note = {
          id: Date.now().toString(),
          content: noteInput,
          date: new Date().toISOString(),
          author: 'Moi'
      };
      
      const newActivity: Activity = {
          id: `act_${Date.now()}`,
          type: 'note',
          description: 'Note ajoutée',
          date: new Date().toISOString()
      };

      onUpdate({
          ...contact,
          notes: [newNote, ...contact.notes],
          activities: [newActivity, ...contact.activities]
      });
      setNoteInput('');
      onNotify("Note ajoutée", "success");
  };

  const handleSummarizeNote = async () => {
    if(!noteInput.trim()) return;
    setIsAiLoading(true);
    const result = await summarizeMeetingNotes(noteInput);
    setNoteInput(`${noteInput}\n\n--- Résumé AI ---\n${result.summary}\n\nActions:\n${result.actionItems.map(i => `- ${i}`).join('\n')}`);
    setIsAiLoading(false);
  }

  const handleCreateProposal = async (standard: string, needs: string, value: number) => {
      setIsAiLoading(true);
      const content = await generateConsultingProposal(contact, needs, standard);
      
      const newProposal: Proposal = {
          id: Date.now().toString(),
          title: `Accompagnement ${standard}`,
          content: content,
          value: value,
          status: 'Draft',
          createdAt: new Date().toISOString()
      };

      const newActivity: Activity = {
          id: `prop_${Date.now()}`,
          type: 'proposal',
          description: `Offre générée: ${standard}`,
          date: new Date().toISOString()
      };

      onUpdate({
          ...contact,
          proposals: [newProposal, ...(contact.proposals || [])],
          activities: [newActivity, ...contact.activities],
          contractValue: value // update estimated value
      });

      setIsAiLoading(false);
      setProposalModalOpen(false);
      setActiveTab('proposals');
      onNotify("Offre générée et ajoutée", "success");
  };

  const handleFileChat = async () => {
      if (!chatInput.trim() || !chatFile) return;
      
      const userMsg = chatInput;
      setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
      setChatInput('');
      
      const response = await askDocument(chatFile, userMsg);
      setChatHistory(prev => [...prev, { role: 'ai', text: response }]);
  };

  // Helper to render file icon
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') return <FileText size={20} className="text-red-500" />;
    if (['doc', 'docx'].includes(ext)) return <FileText size={20} className="text-blue-500" />;
    if (['xls', 'xlsx'].includes(ext)) return <FileText size={20} className="text-green-500" />;
    if (['png', 'jpg', 'jpeg'].includes(ext)) return <FileImage size={20} className="text-purple-500" />;
    return <File size={20} className="text-slate-500" />;
  };

  // Filter tasks for display
  const pendingTasks = contact.activities.filter(a => a.dueDate && !a.isDone).sort((a,b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  return (
    <div className="h-full flex flex-col bg-slate-50 relative overflow-hidden">
      {logModalOpen && (
          <LogActivityModal 
            type={logModalOpen} 
            onClose={() => setLogModalOpen(null)} 
            onSave={handleLogActivity} 
          />
      )}

      {proposalModalOpen && (
          <ProposalModal 
            onClose={() => setProposalModalOpen(false)}
            onGenerate={handleCreateProposal}
            isLoading={isAiLoading}
          />
      )}

      {/* File Chat Modal - RAG */}
      {chatFile && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg h-[80vh] flex flex-col animate-in zoom-in duration-200">
                  <div className="p-4 border-b flex justify-between items-center bg-indigo-50 rounded-t-xl">
                      <h3 className="font-bold text-indigo-900 flex items-center gap-2 truncate">
                          <FileText size={18} className="flex-shrink-0"/> 
                          <span className="truncate max-w-[200px]">{chatFile}</span>
                      </h3>
                      <button onClick={() => { setChatFile(null); setChatHistory([]); }} className="text-indigo-400 hover:text-indigo-600 p-2"><X size={24}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                      {chatHistory.length === 0 && (
                          <div className="text-center text-slate-400 mt-10">
                              <Sparkles className="mx-auto mb-2 opacity-50" size={32} />
                              <p>Posez une question sur ce document.<br/>Ex: "Quels sont les points critiques ?"</p>
                          </div>
                      )}
                      {chatHistory.map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'}`}>
                                  {msg.text}
                              </div>
                          </div>
                      ))}
                  </div>
                  <div className="p-3 border-t bg-white rounded-b-xl flex gap-2">
                      <input 
                        className="flex-1 border rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Votre question..."
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleFileChat()}
                      />
                      <button onClick={handleFileChat} className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700">
                          <Send size={20} />
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-start shadow-sm z-10 gap-4">
        <div className="flex items-start space-x-3 w-full">
          <button onClick={onBack} className="mt-1 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 flex-shrink-0">
            <ArrowLeft size={24} />
          </button>
          <div className="w-full">
             {isEditing ? (
                 <div className="space-y-3 w-full">
                     <input className="bg-white border border-slate-300 rounded px-2 py-2 text-lg text-slate-800 w-full font-bold" 
                        value={editForm.company} onChange={e => setEditForm({...editForm, company: e.target.value})} placeholder="Société" />
                     
                     <div className="grid grid-cols-2 gap-2">
                        <input className="bg-white border border-slate-300 rounded px-2 py-2 text-sm w-full" 
                            value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName: e.target.value})} placeholder="Prénom" />
                         <input className="bg-white border border-slate-300 rounded px-2 py-2 text-sm w-full" 
                            value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName: e.target.value})} placeholder="Nom" />
                     </div>
                 </div>
             ) : (
                 <>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex flex-wrap items-center gap-2">
                        <Building2 className="text-slate-400" size={24} />
                        {contact.company}
                    </h1>
                    <div className="mt-1 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                            {contact.firstName[0]}{contact.lastName[0]}
                        </div>
                        <span className="text-slate-700 font-medium">{contact.firstName} {contact.lastName}</span>
                    </div>
                 </>
             )}
             
             <div className="flex items-center space-x-2 mt-3 overflow-x-auto">
                {isEditing ? (
                    <select className="bg-white border border-slate-300 rounded text-sm px-2 py-1 w-full"
                        value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                        {pipelineStages.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                ) : (
                    <>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide flex-shrink-0 bg-indigo-100 text-indigo-700`}>
                            {contact.status}
                        </span>
                        
                        {/* Score Badge */}
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold ${scoreStyle.bg} ${scoreStyle.color} border border-opacity-20`}>
                            <TrendingUp size={14} />
                            <span>{scoreStyle.icon}</span>
                            <span>{score} pts</span>
                            <span className="hidden sm:inline">({scoreStyle.label})</span>
                        </div>
                    </>
                )}
             </div>
          </div>
        </div>
        
        <div className="flex flex-col w-full md:w-auto space-y-2 items-end">
            <div className="flex flex-wrap justify-end gap-2 w-full md:w-auto">
            {isEditing ? (
                <>
                    <button onClick={cancelEditing} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <X size={20} />
                    </button>
                    <button onClick={saveEditing} className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                        <Save size={18} /> <span>Enregistrer</span>
                    </button>
                </>
            ) : (
                <>
                     <button onClick={startEditing} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Modifier">
                        <Edit2 size={20} />
                    </button>
                    <button 
                        onClick={handleAnalyzeHistory}
                        disabled={isAiLoading}
                        className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-purple-50 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-100 border border-purple-200 transition-colors"
                    >
                        <Brain size={18} />
                        <span className="md:inline hidden">Insights</span>
                    </button>
                    <button onClick={initiateEmail} className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">
                        <Mail size={18} />
                    </button>
                    <button onClick={() => setLogModalOpen('call')} className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-white text-slate-700 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                        <Phone size={18} />
                    </button>
                </>
            )}
            </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel: Details (Collapsible or stacked on mobile) */}
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-200 bg-white p-4 md:p-6 overflow-y-auto max-h-[30vh] md:max-h-full">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Coordonnées</h3>
            
            <div className="space-y-4">
                <div className="flex items-center space-x-3 text-slate-700">
                    <Mail size={18} className="text-slate-400 flex-shrink-0" />
                    {isEditing ? (
                        <input className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                    ) : (
                        <span className="truncate text-sm md:text-base">{contact.email}</span>
                    )}
                </div>
                <div className="flex items-center space-x-3 text-slate-700">
                    <Phone size={18} className="text-slate-400 flex-shrink-0" />
                    {isEditing ? (
                        <input className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                    ) : (
                        <span className="text-sm md:text-base">{contact.phone}</span>
                    )}
                </div>
            </div>

            <div className="mt-4 md:mt-8 border-t border-slate-100 pt-4 md:pt-6">
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 md:mb-4">Opportunité Conseil</h3>
                 <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
                    <div>
                        <label className="text-xs text-slate-500 block">Intérêt</label>
                        {isEditing ? (
                            <>
                                <input 
                                    list="interest-options"
                                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm mt-1" 
                                    value={editForm.certificationInterest} 
                                    onChange={e => setEditForm({...editForm, certificationInterest: e.target.value})} 
                                />
                                <datalist id="interest-options">
                                    {interestOptions.map(opt => <option key={opt} value={opt} />)}
                                </datalist>
                            </>
                        ) : (
                            <div className="text-slate-800 font-medium text-sm">{contact.certificationInterest}</div>
                        )}
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 block">Valeur</label>
                        {isEditing ? (
                             <input type="number" className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm mt-1" value={editForm.contractValue} onChange={e => setEditForm({...editForm, contractValue: parseInt(e.target.value) || 0})} />
                        ) : (
                            <div className="text-slate-800 font-medium text-sm">€{(contact.contractValue || 0).toLocaleString()}</div>
                        )}
                    </div>
                 </div>
            </div>

            {/* AI Assistant Output Area */}
            {aiResponse && (
                <div className="mt-6 bg-purple-50 border border-purple-100 rounded-xl p-4 relative animation-fade-in">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center space-x-2 text-purple-700 font-semibold">
                            <Sparkles size={16} />
                            <span>Assistant Gemini</span>
                        </div>
                        <button onClick={() => setAiResponse(null)} className="text-purple-400 hover:text-purple-600"><X size={16}/></button>
                    </div>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {aiResponse}
                    </div>
                    <div className="mt-3 flex space-x-2">
                        <button className="text-xs bg-white border border-purple-200 text-purple-700 px-2 py-1 rounded hover:bg-purple-100" onClick={() => navigator.clipboard.writeText(aiResponse)}>
                            Copier
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* Right Panel: Workspace */}
        <div className="flex-1 flex flex-col bg-slate-50 h-full overflow-hidden">
            {/* Scrollable Tabs for Mobile */}
            <div className="flex border-b border-slate-200 bg-white px-2 md:px-6 overflow-x-auto no-scrollbar flex-shrink-0 gap-6">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`py-3 md:py-4 relative font-medium text-xs md:text-sm transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Notes & Tâches
                    {activeTab === 'overview' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>}
                </button>
                <button 
                    onClick={() => setActiveTab('proposals')}
                    className={`py-3 md:py-4 relative font-medium text-xs md:text-sm transition-colors whitespace-nowrap ${activeTab === 'proposals' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Offres
                     {activeTab === 'proposals' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>}
                </button>
                <button 
                    onClick={() => setActiveTab('activity')}
                    className={`py-3 md:py-4 relative font-medium text-xs md:text-sm transition-colors whitespace-nowrap ${activeTab === 'activity' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Historique
                     {activeTab === 'activity' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>}
                </button>
                <button 
                    onClick={() => setActiveTab('files')}
                    className={`py-3 md:py-4 relative font-medium text-xs md:text-sm transition-colors whitespace-nowrap ${activeTab === 'files' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Fichiers (RAG)
                     {activeTab === 'files' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
                {activeTab === 'overview' && (
                    <div className="space-y-6 max-w-3xl mx-auto">
                        
                        {/* Note Input */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                             <h4 className="font-semibold text-slate-700 mb-2 text-sm">Nouvelle Note / Compte Rendu</h4>
                             <textarea 
                                className="w-full bg-white border border-slate-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none h-24 md:h-32"
                                placeholder="Tapez vos notes ici..."
                                value={noteInput}
                                onChange={(e) => setNoteInput(e.target.value)}
                             />
                             <div className="flex justify-between mt-3">
                                 <button 
                                    onClick={handleSummarizeNote}
                                    disabled={!noteInput || isAiLoading}
                                    className="flex items-center space-x-1 md:space-x-2 text-purple-600 text-xs md:text-sm hover:bg-purple-50 px-2 md:px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                                >
                                     {isAiLoading ? <span className="animate-spin">⌛</span> : <Sparkles size={16} />}
                                     <span>Améliorer IA</span>
                                 </button>
                                 <button 
                                    onClick={handleAddNote}
                                    disabled={!noteInput}
                                    className="bg-slate-900 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                                >
                                     Enregistrer
                                 </button>
                             </div>
                        </div>

                         {/* Tasks Section */}
                         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                             <div className="flex justify-between items-center mb-4">
                                <h4 className="font-semibold text-slate-700 flex items-center gap-2 text-sm">
                                    <CheckSquare size={18} className="text-indigo-600" />
                                    <span>Tâches</span>
                                </h4>
                                <button onClick={() => setLogModalOpen('task')} className="text-xs text-indigo-600 font-medium">+ Ajouter</button>
                             </div>
                             
                             <div className="space-y-2 mb-4">
                                {pendingTasks.length === 0 && (
                                    <p className="text-sm text-slate-400 italic">Aucune tâche planifiée.</p>
                                )}
                                {pendingTasks.map(task => (
                                    <div key={task.id} className="flex items-start space-x-3 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                                        <button onClick={() => toggleTaskStatus(task.id)} className="text-indigo-400 hover:text-indigo-600 mt-0.5 p-1">
                                            <Square size={20} />
                                        </button>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-800">{task.description}</p>
                                            <p className="text-xs text-indigo-600 flex items-center mt-1">
                                                <CalendarClock size={12} className="mr-1" />
                                                {new Date(task.dueDate!).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                )}

                {activeTab === 'proposals' && (
                    <div className="max-w-3xl mx-auto space-y-6">
                        <div className="flex justify-between items-center">
                             <h4 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                                <Briefcase size={18} className="text-indigo-600"/>
                                Propositions Commerciales
                             </h4>
                             <button 
                                onClick={() => setProposalModalOpen(true)}
                                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-700 flex items-center gap-2"
                             >
                                 <Sparkles size={14} /> Nouvelle Offre
                             </button>
                        </div>

                        {(!contact.proposals || contact.proposals.length === 0) && (
                            <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl">
                                <FileText size={40} className="text-slate-300 mx-auto mb-2" />
                                <p className="text-slate-500 text-sm">Aucune offre pour ce contact.</p>
                            </div>
                        )}

                        <div className="space-y-3">
                            {contact.proposals?.map(proposal => (
                                <div key={proposal.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h5 className="font-bold text-slate-800">{proposal.title}</h5>
                                            <div className="text-xs text-slate-500 mt-1">{new Date(proposal.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-indigo-600">€{proposal.value.toLocaleString()}</div>
                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold mt-1 ${
                                                proposal.status === 'Sent' ? 'bg-blue-100 text-blue-700' : 
                                                proposal.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                                {proposal.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-slate-50 flex gap-2">
                                        <button className="text-slate-500 hover:text-indigo-600 text-xs flex items-center gap-1">
                                            <FileText size={14} /> Voir Contenu
                                        </button>
                                        <button className="text-slate-500 hover:text-green-600 text-xs flex items-center gap-1 ml-auto">
                                            <Download size={14} /> PDF
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="max-w-3xl mx-auto">
                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                             {contact.activities.map((activity, index) => (
                                 <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                     
                                     {/* Icon on timeline */}
                                     <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${
                                         activity.type === 'call' ? 'bg-green-100 text-green-600' : 
                                         activity.type === 'meeting' ? 'bg-purple-100 text-purple-600' :
                                         activity.type === 'email' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                                     }`}>
                                         {activity.type === 'call' && <Phone size={16} />}
                                         {activity.type === 'email' && <Mail size={16} />}
                                         {activity.type === 'meeting' && <Briefcase size={16} />}
                                         {activity.type === 'note' && <FileText size={16} />}
                                         {activity.type === 'proposal' && <Sparkles size={16} />}
                                         {activity.type === 'task' && <CheckSquare size={16} />}
                                     </div>

                                     {/* Card */}
                                     <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                         <div className="flex justify-between items-start mb-1">
                                             <span className="font-bold text-slate-800 text-sm capitalize">{activity.type}</span>
                                             <time className="text-[10px] text-slate-400">{new Date(activity.date).toLocaleDateString()} {new Date(activity.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</time>
                                         </div>
                                         <p className="text-slate-600 text-sm leading-relaxed">{activity.description}</p>
                                     </div>
                                 </div>
                             ))}
                        </div>
                    </div>
                )}

                {activeTab === 'files' && (
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center justify-between mb-4">
                             <h4 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                                <FileText size={18} className="text-indigo-600"/>
                                Documents & RAG
                             </h4>
                        </div>
                        
                        {contact.files.length === 0 ? (
                            <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl">
                                <Folder size={40} className="text-slate-300 mx-auto mb-2" />
                                <p className="text-slate-500 text-sm">Aucun document.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {contact.files.map((file, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                            {getFileIcon(file)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-slate-800 text-sm truncate" title={file}>{file}</div>
                                            <button 
                                                onClick={() => setChatFile(file)}
                                                className="mt-1 text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1"
                                            >
                                                <MessageSquareText size={12} /> Discuter avec l'IA
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDetail;
