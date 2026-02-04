import React from 'react';
import { BookOpen, Sparkles, Users, Plus, Edit2, CheckSquare, History, MousePointerClick, TrendingUp } from 'lucide-react';

const UserGuide: React.FC = () => {
  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-slate-50">
      <div className="max-w-4xl mx-auto pb-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
            <BookOpen size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Guide Utilisateur</h1>
            <p className="text-slate-500">Mode d&apos;emploi détaillé pour gérer votre activité de conseil.</p>
          </div>
        </div>

        <div className="grid gap-8">
            
            {/* Section 1: Gestion des Contacts (Création & Modification) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Users className="text-indigo-600" />
                        1. Gestion des Contacts
                    </h2>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <Plus size={18} className="text-green-600" /> Créer un nouveau contact
                        </h3>
                        <ol className="list-decimal list-inside text-sm text-slate-600 space-y-2 ml-2 bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <li>Allez dans le menu <strong>Contacts</strong> via la barre latérale.</li>
                            <li>Cliquez sur le bouton bleu <strong>+ Nouveau Contact</strong> en haut à droite.</li>
                            <li>Remplissez les informations essentielles :
                                <ul className="list-disc list-inside ml-4 mt-1 text-slate-500">
                                    <li><strong>Société :</strong> Nom de l&apos;entreprise cliente.</li>
                                    <li><strong>Interlocuteur :</strong> Prénom, Nom, Email (crucial pour l&apos;envoi d&apos;offres).</li>
                                    <li><strong>Intérêt :</strong> Le référentiel visé (ex: IFS, BRCGS, ISO 9001).</li>
                                </ul>
                            </li>
                            <li>Cliquez sur <strong>Enregistrer</strong>. Le contact est créé avec le statut "Lead".</li>
                        </ol>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <Edit2 size={18} className="text-blue-600" /> Modifier les informations
                        </h3>
                        <p className="text-sm text-slate-600 mb-2">
                            Pour corriger une erreur ou ajouter des détails (SIRET, Adresse, Changement de statut) :
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-600 ml-2 space-y-1">
                            <li>Ouvrez la fiche du contact en cliquant sur son nom.</li>
                            <li>Cliquez sur le bouton <strong>Crayon (Modifier)</strong> en haut à droite.</li>
                            <li>Les champs deviennent éditables. Modifiez les données ou changez le <strong>Statut</strong> via le menu déroulant.</li>
                            <li>Cliquez sur le bouton vert <strong>Enregistrer</strong> pour valider.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Section 2: Tâches, Notes & Suivi */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <CheckSquare className="text-indigo-600" />
                        2. Tâches, Notes & Rappels
                    </h2>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-bold text-slate-700 mb-2">Ajouter une Note / Compte-rendu</h3>
                            <p className="text-sm text-slate-600 mb-3">
                                Dans la fiche contact, onglet <strong>Notes & Tâches</strong> :
                            </p>
                            <ol className="list-decimal list-inside text-sm text-slate-600 space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <li>Tapez votre texte dans la zone "Nouvelle Note".</li>
                                <li>(Optionnel) Cliquez sur <strong>Améliorer IA</strong> pour structurer automatiquement des notes prises à la volée.</li>
                                <li>Cliquez sur <strong>Enregistrer</strong>. La note s&apos;ajoute à l&apos;historique.</li>
                            </ol>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-700 mb-2">Planifier un Rappel</h3>
                            <p className="text-sm text-slate-600 mb-3">
                                Pour ne pas oublier de relancer un client :
                            </p>
                            <ol className="list-decimal list-inside text-sm text-slate-600 space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <li>Dans la section "Tâches", cliquez sur <strong>+ Ajouter</strong>.</li>
                                <li>Décrivez l&apos;action (ex: "Relancer pour devis").</li>
                                <li>Définissez une <strong>Date d&apos;échéance</strong>.</li>
                                <li>La tâche apparaîtra dans votre Tableau de Bord et le Calendrier.</li>
                            </ol>
                        </div>
                    </div>
                    
                    <div className="border-t border-slate-100 pt-4">
                        <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <MousePointerClick size={18} /> Actions Rapides (Log d&apos;appels & Emails)
                        </h3>
                        <p className="text-sm text-slate-600">
                            En haut à droite de la fiche contact, utilisez les boutons d&apos;action :
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                            <div className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg">
                                <div className="p-2 bg-slate-100 rounded text-slate-600"><span className="font-bold">📞</span></div>
                                <div className="text-sm">
                                    <strong>Bouton Téléphone :</strong> Ouvre une fenêtre pour consigner le résumé d&apos;un appel (ex: "A répondu, intéressé par v8").
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg">
                                <div className="p-2 bg-indigo-100 rounded text-indigo-600"><span className="font-bold">✉️</span></div>
                                <div className="text-sm">
                                    <strong>Bouton Email :</strong> Ouvre votre logiciel de messagerie par défaut et vous permet de noter le sujet de l&apos;email envoyé pour le suivi.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 3: Historique */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <History className="text-indigo-600" />
                        3. Historique & Chronologie
                    </h2>
                </div>
                <div className="p-6">
                    <p className="text-sm text-slate-600 mb-4">
                        L&apos;onglet <strong>Historique</strong> dans une fiche contact centralise tout ce qui s&apos;est passé avec ce client. C&apos;est votre "mémoire".
                    </p>
                    <ul className="space-y-2 text-sm text-slate-600">
                        <li className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <strong>Appels :</strong> Résumés des conversations téléphoniques.
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <strong>Emails :</strong> Trace des emails envoyés (manuellement ou via l&apos;outil).
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                            <strong>Offres :</strong> Génération et envoi de propositions commerciales.
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                            <strong>Notes :</strong> Comptes-rendus internes.
                        </li>
                    </ul>
                    <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg flex items-start gap-2">
                        <Sparkles size={16} className="mt-0.5 shrink-0" />
                        <p>Astuce : Utilisez le bouton <strong>Insights</strong> en haut de la fiche contact pour demander à l&apos;IA d&apos;analyser cet historique et de vous suggérer la prochaine étape (ex: "Le client n&apos;a pas été contacté depuis 10 jours, relancez-le").</p>
                    </div>
                </div>
            </div>

            {/* Section 4: Lead Scoring */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-orange-50 to-white">
                    <h2 className="text-xl font-bold text-orange-900 flex items-center gap-2">
                        <TrendingUp className="text-orange-600" />
                        4. Notation des Prospects (Scoring)
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-600">
                        Le CRM attribue automatiquement des points à vos contacts pour vous aider à identifier les prospects les plus chauds.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3">
                            <span className="text-2xl">🔥</span>
                            <div>
                                <h4 className="font-bold text-red-900 text-sm">Hot (+50 pts)</h4>
                                <p className="text-xs text-red-700">À closer rapidement</p>
                            </div>
                        </div>
                        <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-3">
                            <span className="text-2xl">⛅</span>
                            <div>
                                <h4 className="font-bold text-amber-900 text-sm">Warm (20-50 pts)</h4>
                                <p className="text-xs text-amber-700">Intérêt confirmé</p>
                            </div>
                        </div>
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-3">
                            <span className="text-2xl">❄️</span>
                            <div>
                                <h4 className="font-bold text-blue-900 text-sm">Cold (&lt; 20 pts)</h4>
                                <p className="text-xs text-blue-700">À travailler</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-xs text-slate-500 mt-2 p-3 bg-slate-50 rounded">
                        <strong>Barème :</strong> Offre (+20), RDV (+15), Appel (+10), Email (+5), Note (+2).
                    </div>
                </div>
            </div>

            {/* Section 5: Intelligence Artificielle */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-white">
                    <h2 className="text-xl font-bold text-purple-900 flex items-center gap-2">
                        <Sparkles className="text-purple-600" />
                        5. Fonctionnalités IA Avancées
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 font-bold">A</div>
                        <div>
                            <h3 className="font-bold text-slate-800">Génération d&apos;Offres Commerciales</h3>
                            <p className="text-sm text-slate-600 mt-1">
                                Onglet <strong>Offres</strong> &gt; <strong>Nouvelle Offre</strong>. 
                                Sélectionnez le standard (IFS, BRCGS...), indiquez le budget estimé et une phrase de contexte (ex: "Besoin urgent audit à blanc"). 
                                L&apos;IA rédigera une lettre de mission complète.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 font-bold">B</div>
                        <div>
                            <h3 className="font-bold text-slate-800">Chat avec vos Documents (RAG)</h3>
                            <p className="text-sm text-slate-600 mt-1">
                                Onglet <strong>Fichiers (RAG)</strong>. Si des fichiers sont présents (simulés dans cette démo), cliquez sur "Discuter avec l&apos;IA". 
                                Posez des questions techniques sur le contenu du document sans avoir à le lire entièrement.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
        
        <div className="mt-8 text-center text-sm text-slate-400">
            VISIcom CRM v1.1.0 • Guide interactif
        </div>
      </div>
    </div>
  );
};

export default UserGuide;