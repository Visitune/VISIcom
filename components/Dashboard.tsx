
import React, { useState, useMemo } from 'react';
import { Contact, ContactStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, ArrowUpRight, ArrowDownRight, MoreHorizontal, Briefcase, CheckCircle2, ListTodo } from 'lucide-react';

interface DashboardProps {
  contacts: Contact[];
}

const Dashboard: React.FC<DashboardProps> = ({ contacts }) => {
  const [timeRange, setTimeRange] = useState<'month' | 'year'>('month');

  // --- Filtering Logic ---
  const filteredContacts = useMemo(() => {
      const now = new Date();
      return contacts.filter(c => {
          const contactDate = new Date(c.lastContact);
          if (timeRange === 'month') {
              return contactDate.getMonth() === now.getMonth() && contactDate.getFullYear() === now.getFullYear();
          }
          return contactDate.getFullYear() === now.getFullYear();
      });
  }, [contacts, timeRange]);

  // Calculate Metrics based on filtered view (or total for specific stats)
  const totalValue = filteredContacts.reduce((sum, c) => sum + (c.contractValue || 0), 0);
  
  // Leads count depends on the time range view for "New Leads" logic
  const newLeadsCount = filteredContacts.filter(c => c.status === ContactStatus.LEAD).length;
  
  // Proposals are usually relevant if they are active, regardless of date, but let's filter for the stats
  const pendingProposals = filteredContacts.filter(c => c.status === ContactStatus.PROPOSAL).length;
  
  // Conversion Rate (Global metric, usually)
  const activeClients = contacts.filter(c => c.status === ContactStatus.ACTIVE).length;
  const conversionRate = contacts.length > 0 ? Math.round((activeClients / contacts.length) * 100) : 0;

  // Chart Data - Dynamic based on visible contacts
  const statusData = [
    { name: 'Lead', value: filteredContacts.filter(c => c.status === ContactStatus.LEAD).length, color: '#94a3b8' },
    { name: 'Qualifié', value: filteredContacts.filter(c => c.status === ContactStatus.QUALIFIED).length, color: '#60a5fa' },
    { name: 'Offre', value: filteredContacts.filter(c => c.status === ContactStatus.PROPOSAL).length, color: '#f59e0b' },
    { name: 'Actif', value: filteredContacts.filter(c => c.status === ContactStatus.ACTIVE).length, color: '#10b981' },
    { name: 'Clos', value: filteredContacts.filter(c => c.status === ContactStatus.CLOSED).length, color: '#64748b' },
  ];

  // --- Activity Timeline (Filtered) ---
  const recentActivity = useMemo(() => {
      return contacts
        .flatMap(c => c.activities.map(a => ({ ...a, contactName: `${c.firstName} ${c.lastName}`, contactId: c.id })))
        .filter(a => {
            const date = new Date(a.date);
            const now = new Date();
            if (timeRange === 'month') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            return date.getFullYear() === now.getFullYear();
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 6);
  }, [contacts, timeRange]);

  // --- Tasks / Reminders (Always show upcoming, regardless of filter) ---
  const upcomingReminders = contacts
    .flatMap(c => c.activities
        .filter(a => a.dueDate && !a.isDone)
        .map(a => ({...a, contactName: `${c.firstName} ${c.lastName}`, company: c.company, contactId: c.id}))
    )
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  // --- Components ---

  const StatCard = ({ title, value, icon: Icon, trend, colorClass, delay }: any) => (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4`} style={{ animationDelay: delay }}>
      <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500 ${colorClass}`}>
        <Icon size={80} />
      </div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 text-opacity-100`}>
                <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
            </div>
            {trend && (
                <div className={`flex items-center text-xs font-bold ${trend > 0 ? 'text-green-600' : 'text-red-500'} bg-slate-50 px-2 py-1 rounded-full`}>
                    {trend > 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div className="text-3xl font-bold text-slate-800 tracking-tight mb-1">{value}</div>
        <div className="text-sm text-slate-500 font-medium">{title}</div>
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 text-white text-xs p-2 rounded-lg shadow-xl">
          <p className="font-bold mb-1">{label}</p>
          <p>{payload[0].value} contacts</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 h-full overflow-y-auto pb-24 bg-slate-50/50">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Tableau de Bord</h1>
            <p className="text-slate-500 mt-1">
                Aperçu de votre activité {timeRange === 'month' ? 'du mois' : 'de l\'année'}.
            </p>
        </div>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button 
                onClick={() => setTimeRange('month')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${timeRange === 'month' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                Ce Mois
            </button>
            <button 
                onClick={() => setTimeRange('year')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${timeRange === 'year' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                Cette Année
            </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
            title={timeRange === 'month' ? "CA (Est.) du Mois" : "CA (Est.) Annuel"}
            value={`€${totalValue.toLocaleString()}`} 
            icon={DollarSign} 
            colorClass="text-emerald-600 bg-emerald-600" 
            trend={timeRange === 'month' ? 12 : 45}
            delay="0ms"
        />
        <StatCard 
            title="Offres en cours" 
            value={pendingProposals} 
            icon={Briefcase} 
            colorClass="text-amber-500 bg-amber-500" 
            trend={5}
            delay="100ms"
        />
        <StatCard 
            title="Leads (Période)" 
            value={newLeadsCount}
            icon={Users} 
            colorClass="text-blue-500 bg-blue-500" 
            trend={-2}
            delay="200ms"
        />
        <StatCard 
            title="Taux de Conversion" 
            value={`${conversionRate}%`} 
            icon={TrendingUp} 
            colorClass="text-indigo-600 bg-indigo-600" 
            trend={8}
            delay="300ms"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Main Chart: Pipeline Overview */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Distribution du Pipeline {timeRange === 'month' ? '(Mois)' : '(Année)'}</h3>
            <button className="text-slate-400 hover:text-indigo-600"><MoreHorizontal size={20}/></button>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f1f5f9', radius: 4}} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                    {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TASK & REMINDERS PANEL */}
        <div className="bg-white p-0 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full min-h-[400px] overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-indigo-50/30">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <ListTodo size={20} className="text-indigo-600" />
                    <span>Tâches & Rappels</span>
                </h3>
                <span className="bg-indigo-100 text-indigo-600 text-xs font-bold px-2.5 py-1 rounded-full">{upcomingReminders.length}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {upcomingReminders.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
                        <CheckCircle2 size={48} className="mb-3 opacity-20 text-green-500" />
                        <p className="text-sm font-medium">Aucune tâche en attente</p>
                        <p className="text-xs">Profitez-en pour prospecter !</p>
                    </div>
                )}
                {upcomingReminders.map(reminder => {
                    const isLate = new Date(reminder.dueDate!) < new Date();
                    return (
                        <div key={reminder.id} className={`group p-3 rounded-xl border-l-4 transition-all hover:shadow-md cursor-pointer ${isLate ? 'bg-rose-50 border-rose-400 border-y border-r-0 border-rose-100' : 'bg-white border-indigo-400 border-y border-slate-100 border-r border-slate-100'}`}>
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${isLate ? 'bg-rose-100 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                    {isLate ? 'En Retard' : 'À Venir'}
                                </span>
                                <span className="text-xs font-semibold text-slate-500">
                                    {new Date(reminder.dueDate!).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                </span>
                            </div>
                            <p className={`text-sm font-bold mb-1 ${isLate ? 'text-rose-900' : 'text-slate-800'}`}>{reminder.description}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-2 pt-2 border-t border-black/5">
                                <Briefcase size={12} />
                                <span className="truncate">{reminder.company}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-3">
          <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Fil d'actualité</h3>
                <p className="text-xs text-slate-400">Dernières interactions {timeRange === 'month' ? 'ce mois-ci' : 'cette année'}</p>
              </div>
          </div>
          <div className="space-y-0">
            {recentActivity.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm">Aucune activité enregistrée pour cette période.</p>
                </div>
            ) : (
                recentActivity.map((item, index) => (
                <div key={item.id} className="flex gap-4 group">
                    {/* Timeline Line */}
                    <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full border-2 z-10 bg-white ${
                            item.type === 'call' ? 'border-blue-500' :
                            item.type === 'email' ? 'border-emerald-500' : 
                            item.type === 'proposal' ? 'border-amber-500' : 'border-purple-500'
                        }`} />
                        {index !== recentActivity.length - 1 && (
                            <div className="w-0.5 flex-1 bg-slate-100 group-hover:bg-slate-200 transition-colors my-1" />
                        )}
                    </div>
                    
                    {/* Content */}
                    <div className="pb-8 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 mb-1">
                            <div className="font-semibold text-slate-800 text-sm">
                                {item.contactName}
                                <span className="font-normal text-slate-500 mx-2">•</span> 
                                <span className="font-normal text-slate-500 text-xs uppercase tracking-wide">{item.type}</span>
                            </div>
                            <div className="text-xs text-slate-400 whitespace-nowrap">
                                {new Date(item.date).toLocaleDateString()} à {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 border border-slate-100 group-hover:bg-indigo-50/30 group-hover:border-indigo-100 transition-colors">
                            {item.description}
                        </div>
                    </div>
                </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
