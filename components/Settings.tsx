
import React, { useRef, useEffect, useState } from 'react';
import { Contact } from '../types';
import { Download, Upload, Database, CheckCircle, AlertTriangle, Sparkles, Key, Trash2, Eye, EyeOff, Save, RefreshCw, Kanban, Tag, Plus, X } from 'lucide-react';

interface SettingsProps {
  contacts: Contact[];
  onImportData: (data: Contact[]) => void;
  onClearData: () => void;
  pipelineStages: string[];
  setPipelineStages: (stages: string[]) => void;
  interestOptions: string[];
  setInterestOptions: (options: string[]) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
    contacts, 
    onImportData, 
    onClearData, 
    pipelineStages, 
    setPipelineStages,
    interestOptions,
    setInterestOptions
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [apiKey, setApiKey] = useState('');
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [showKey, setShowKey] = useState(false);
  
  const [newStage, setNewStage] = useState('');
  const [newInterest, setNewInterest] = useState('');

  // Confirmation state for data deletion (replaces window.confirm)
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    // Check if key exists in storage
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
        setIsKeySaved(true);
        setApiKey(savedKey);
    }
  }, []);

  const handleSaveKey = () => {
    if (!apiKey.trim()) return;
    localStorage.setItem('gemini_api_key', apiKey.trim());
    setIsKeySaved(true);
    alert("Clé API enregistrée avec succès !");
  };

  const handleDeleteKey = () => {
      localStorage.removeItem('gemini_api_key');
      setApiKey('');
      setIsKeySaved(false);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(contacts, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `consultai_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const json = JSON.parse(event.target?.result as string);
            if (Array.isArray(json)) {
                onImportData(json);
            } else {
                alert("Format de fichier invalide.");
            }
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la lecture du fichier JSON.");
        }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // --- List Management Handlers ---
  const addStage = () => {
      if(newStage && !pipelineStages.includes(newStage)) {
          setPipelineStages([...pipelineStages, newStage]);
          setNewStage('');
      }
  };
  const removeStage = (stage: string) => {
      setPipelineStages(pipelineStages.filter(s => s !== stage));
  };

  const addInterest = () => {
      if(newInterest && !interestOptions.includes(newInterest)) {
          setInterestOptions([...interestOptions, newInterest]);
          setNewInterest('');
      }
  };
  const removeInterest = (option: string) => {
      setInterestOptions(interestOptions.filter(o => o !== option));
  };

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6 text-slate-800">Paramètres & Données</h1>
        
        <div className="max-w-4xl space-y-8 pb-10">
            
            {/* Configuration CRM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Pipeline Stages Config */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 text-slate-800 flex items-center space-x-2">
                        <Kanban className="text-indigo-600" size={20} />
                        <span>Étapes du Pipeline</span>
                    </h2>
                    <div className="space-y-2 mb-4">
                        {pipelineStages.map(stage => (
                            <div key={stage} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100">
                                <span className="text-sm font-medium">{stage}</span>
                                <button onClick={() => removeStage(stage)} className="text-slate-400 hover:text-red-500">
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input 
                            className="flex-1 bg-white border border-slate-300 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Nouvelle étape..."
                            value={newStage}
                            onChange={e => setNewStage(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && addStage()}
                        />
                        <button onClick={addStage} className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                {/* Interests Config */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 text-slate-800 flex items-center space-x-2">
                        <Tag className="text-green-600" size={20} />
                        <span>Types de Mission / Intérêts</span>
                    </h2>
                    <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                        {interestOptions.map(option => (
                            <div key={option} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100">
                                <span className="text-sm font-medium">{option}</span>
                                <button onClick={() => removeInterest(option)} className="text-slate-400 hover:text-red-500">
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input 
                            className="flex-1 bg-white border border-slate-300 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Nouveau référentiel..."
                            value={newInterest}
                            onChange={e => setNewInterest(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && addInterest()}
                        />
                        <button onClick={addInterest} className="bg-green-600 text-white p-2 rounded hover:bg-green-700">
                            <Plus size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Configuration Section */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold mb-4 text-slate-800 flex items-center space-x-2">
                    <Sparkles className="text-purple-600" size={20} />
                    <span>Configuration IA (Gemini)</span>
                </h2>
                <div className="bg-purple-50 p-5 rounded-lg border border-purple-100 space-y-4">
                    <div className="flex flex-col space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center justify-between">
                            <span className="flex items-center gap-2"><Key size={16} /> Clé API Gemini</span>
                            {isKeySaved && <span className="text-green-600 text-xs flex items-center gap-1"><CheckCircle size={12}/> Clé active</span>}
                        </label>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <input 
                                    type={showKey ? "text" : "password"}
                                    value={apiKey}
                                    onChange={(e) => {
                                        setApiKey(e.target.value);
                                        if(isKeySaved) setIsKeySaved(false); // Reset saved status on edit
                                    }}
                                    placeholder="Collez votre clé ici (AIza...)"
                                    className="w-full bg-white border border-slate-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                                <button 
                                    onClick={() => setShowKey(!showKey)}
                                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                                >
                                    {showKey ? <EyeOff size={16}/> : <Eye size={16}/>}
                                </button>
                            </div>
                            <button 
                                onClick={handleSaveKey}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
                            >
                                <Save size={16} />
                                <span className="hidden md:inline">Sauvegarder</span>
                            </button>
                        </div>
                    </div>
                    {isKeySaved && (
                        <div className="flex justify-end">
                            <button onClick={handleDeleteKey} className="text-red-500 text-xs hover:text-red-700 flex items-center gap-1">
                                <Trash2 size={12} /> Supprimer la clé
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* BYOD Section */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold mb-4 text-slate-800 flex items-center space-x-2">
                    <Database className="text-indigo-600" size={20} />
                    <span>Gestion des Données (BYOD)</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-slate-200 rounded-lg p-5 bg-slate-50 flex flex-col items-center text-center">
                        <Download className="text-slate-500 mb-3" size={32} />
                        <h3 className="font-semibold text-slate-800">Exporter les données</h3>
                        <p className="text-xs text-slate-500 mb-4 mt-1">Sauvegarder un fichier .json</p>
                        <button 
                            onClick={handleExport}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors w-full"
                        >
                            Télécharger Backup
                        </button>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-5 bg-slate-50 flex flex-col items-center text-center">
                        <Upload className="text-slate-500 mb-3" size={32} />
                        <h3 className="font-semibold text-slate-800">Importer les données</h3>
                        <p className="text-xs text-slate-500 mb-4 mt-1">Restaurer un backup</p>
                        <input 
                            type="file" 
                            accept=".json" 
                            ref={fileInputRef} 
                            className="hidden" 
                            onChange={handleFileChange}
                        />
                        <button 
                            onClick={handleImportClick}
                            className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors w-full"
                        >
                            Charger un fichier
                        </button>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
                            <div>
                                <h4 className="text-red-900 font-bold text-sm">Zone de danger</h4>
                                <p className="text-red-700 text-xs">Supprime toutes les données. Cette action est irréversible.</p>
                            </div>
                        </div>
                        
                        {!confirmDelete ? (
                            <button 
                                onClick={() => setConfirmDelete(true)}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 whitespace-nowrap w-full md:w-auto justify-center"
                            >
                                <Trash2 size={16} />
                                Effacer TOUT
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <span className="text-xs font-bold text-red-800">Sûr ?</span>
                                <button 
                                    onClick={() => { onClearData(); setConfirmDelete(false); }}
                                    className="bg-red-600 text-white px-3 py-2 rounded text-xs font-bold hover:bg-red-700"
                                >
                                    OUI
                                </button>
                                <button 
                                    onClick={() => setConfirmDelete(false)}
                                    className="bg-white text-slate-600 border border-slate-300 px-3 py-2 rounded text-xs font-bold hover:bg-slate-50"
                                >
                                    NON
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Settings;
