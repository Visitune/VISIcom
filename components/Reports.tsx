import React from 'react';
import { Contact, Activity } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ReportsProps {
  contacts: Contact[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Reports: React.FC<ReportsProps> = ({ contacts }) => {
  // Data Preparation: Activities Count
  const activityCounts = contacts.flatMap(c => c.activities).reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const activityData = Object.keys(activityCounts).map(type => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: activityCounts[type]
  }));

  // Data Preparation: Value by Tag (Certification Type)
  const valueByTag = contacts.reduce((acc, curr) => {
    // Take first tag as primary category for simplicity
    const tag = curr.tags[0] || 'Autre';
    acc[tag] = (acc[tag] || 0) + (curr.contractValue || 0);
    return acc;
  }, {} as Record<string, number>);

  const salesData = Object.keys(valueByTag).map(tag => ({
    name: tag,
    value: valueByTag[tag]
  }));

  return (
    <div className="p-8 h-full overflow-y-auto space-y-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-slate-800">Rapports & Statistiques</h1>
        <div className="flex space-x-2">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Exporter PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Value by Certification */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Chiffre d'Affaires Potentiel par Référentiel</h3>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{fontSize: 12}} />
                        <YAxis tick={{fontSize: 12}} />
                        <Tooltip 
                            formatter={(value: number) => `€${value.toLocaleString()}`}
                            contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0'}}
                        />
                        <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Chart 2: Activity Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Répartition des Activités</h3>
            <div className="h-72 flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={activityData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {activityData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Table: Top Opportunities */}
        <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="text-lg font-bold text-slate-800 mb-4">Top Opportunités (par Valeur)</h3>
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-3 font-semibold text-slate-600">Entreprise</th>
                            <th className="p-3 font-semibold text-slate-600">Contact</th>
                            <th className="p-3 font-semibold text-slate-600">Intérêt</th>
                            <th className="p-3 font-semibold text-slate-600">Statut</th>
                            <th className="p-3 font-semibold text-slate-600 text-right">Valeur</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contacts
                            .sort((a, b) => (b.contractValue || 0) - (a.contractValue || 0))
                            .slice(0, 5)
                            .map(contact => (
                                <tr key={contact.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="p-3 font-medium text-slate-800">{contact.company}</td>
                                    <td className="p-3 text-slate-600">{contact.firstName} {contact.lastName}</td>
                                    <td className="p-3 text-slate-600">{contact.certificationInterest}</td>
                                    <td className="p-3">
                                        <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600">{contact.status}</span>
                                    </td>
                                    <td className="p-3 text-right font-bold text-indigo-600">€{(contact.contractValue || 0).toLocaleString()}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
             </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;
