
import React, { useState, useMemo } from 'react';
import { Contact } from '../types';
import { Folder, FileText, Search, FileImage, File, MessageSquareText, Sparkles, X, Send } from 'lucide-react';
import { askDocument } from '../services/geminiService';

interface DocumentsViewProps {
  contacts: Contact[];
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const DocumentsView: React.FC<DocumentsViewProps> = ({ contacts, onNotify }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  
  // Chat State
  const [chatFile, setChatFile] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'ai', text: string}[]>([]);

  // Collect all files from all contacts
  const allFiles = useMemo(() => {
    return contacts.flatMap(c => 
        c.files.map(f => ({
            fileName: f,
            contactId: c.id,
            company: c.company,
            contactName: `${c.firstName} ${c.lastName}`
        }))
    );
  }, [contacts]);

  // Filter Logic
  const filteredContacts = contacts.filter(c => 
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.files.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const displayedFiles = selectedContactId 
      ? allFiles.filter(f => f.contactId === selectedContactId)
      : allFiles.filter(f => 
            f.fileName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            f.company.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const handleFileChat = async () => {
      if (!chatInput.trim() || !chatFile) return;
      
      const userMsg = chatInput;
      setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
      setChatInput('');
      
      const response = await askDocument(chatFile, userMsg);
      setChatHistory(prev => [...prev, { role: 'ai', text: response }]);
  };

  const getFileIcon = (fileName: string) => {
      const ext = fileName.split('.').pop()?.toLowerCase() || '';
      if (ext === 'pdf') return <FileText size={24} className="text-red-500" />;
      if (['doc', 'docx'].includes(ext)) return <FileText size={24} className="text-blue-500" />;
      if (['xls', 'xlsx'].includes(ext)) return <FileText size={24} className="text-green-500" />;
      if (['png', 'jpg', 'jpeg'].includes(ext)) return <FileImage size={24} className="text-purple-500" />;
      return <File size={24} className="text-slate-500" />;
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-slate-50 relative overflow-hidden">
        
      {/* File Chat Modal - RAG (Duplicate from Detail View for now to keep self-contained) */}
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

      {/* Sidebar: Folders (Clients) */}
      <div className={`w-full md:w-80 bg-white border-r border-slate-200 flex flex-col h-full ${selectedContactId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Folder size={20} className="text-indigo-600" /> Documents
              </h2>
              <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input 
                      type="text" 
                      placeholder="Filtrer..." 
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <button 
                  onClick={() => setSelectedContactId(null)}
                  className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${selectedContactId === null ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedContactId === null ? 'bg-indigo-200' : 'bg-slate-100'}`}>
                      <Folder size={16} />
                  </div>
                  <span>Tous les fichiers</span>
                  <span className="ml-auto text-xs opacity-60">{allFiles.length}</span>
              </button>

              <div className="my-2 border-t border-slate-100 mx-2"></div>
              <p className="px-3 py-2 text-xs font-bold text-slate-400 uppercase">Dossiers Clients</p>

              {filteredContacts.map(contact => (
                  <button 
                      key={contact.id}
                      onClick={() => setSelectedContactId(contact.id)}
                      className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${selectedContactId === contact.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedContactId === contact.id ? 'bg-white border border-indigo-100' : 'bg-slate-100'}`}>
                          <span className="text-xs font-bold">{contact.company.substring(0,2).toUpperCase()}</span>
                       </div>
                      <span className="truncate flex-1">{contact.company}</span>
                      <span className="text-xs opacity-60 bg-slate-100 px-1.5 py-0.5 rounded">{contact.files.length}</span>
                  </button>
              ))}
          </div>
      </div>

      {/* Main Content: Files Grid */}
      <div className={`flex-1 flex flex-col h-full bg-slate-50 ${!selectedContactId ? 'hidden md:flex' : 'flex'}`}>
          {/* Mobile Header for Details */}
          <div className="md:hidden bg-white p-4 border-b border-slate-200 flex items-center gap-2">
              <button onClick={() => setSelectedContactId(null)} className="p-2 -ml-2 text-slate-500">
                  <X size={20} />
              </button>
              <span className="font-bold text-slate-800">
                  {selectedContactId ? contacts.find(c => c.id === selectedContactId)?.company : 'Tous les fichiers'}
              </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-8">
              {displayedFiles.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                      <Folder size={48} className="mb-4 opacity-20" />
                      <p>Aucun document trouvé.</p>
                  </div>
              ) : (
                  <div>
                      <h3 className="font-bold text-slate-800 mb-4 hidden md:block">
                          {selectedContactId ? contacts.find(c => c.id === selectedContactId)?.company : 'Récents'}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                          {displayedFiles.map((file, idx) => (
                              <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                                  <div className="flex items-start justify-between mb-3">
                                      <div className="p-3 bg-slate-50 rounded-xl">
                                          {getFileIcon(file.fileName)}
                                      </div>
                                      <button 
                                          onClick={() => setChatFile(file.fileName)}
                                          className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                                          title="Discuter avec l'IA"
                                      >
                                          <MessageSquareText size={16} />
                                      </button>
                                  </div>
                                  <h4 className="font-medium text-slate-800 text-sm truncate mb-1" title={file.fileName}>{file.fileName}</h4>
                                  <p className="text-xs text-slate-400 truncate">{file.company}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default DocumentsView;
