import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useI18n } from '../i18n';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  Smartphone,
  RefreshCw
} from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

export const AdminDashboardPage: React.FC = () => {
  const { t, formatDZD, locale } = useI18n();
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const res = await api.admin.getDashboard();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (isLoading) {
    return <div className="max-w-7xl mx-auto p-12 text-center text-xs text-slate-500">Chargement de la console d'administration...</div>;
  }

  const brandChartData = (data?.brandBreakdown || []).map((b: any) => ({
    name: b.brand,
    volume: b.count,
  }));

  const statusChartData = (data?.statusBreakdown || []).map((s: any) => ({
    name: s.current_status.replace(/_/g, ' '),
    value: s.count,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Console d'Administration & Pilotage Financier
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Revenus certifiés en DZD, volumétrie des marques et journal d'audit de sécurité
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          title="Rafraîchir"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Chiffre d'Affaires Réalisé</span>
            <DollarSign className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-2xl font-black text-white">
            {formatDZD(data?.totalRevenueDzd || 0)}
          </p>
          <span className="text-[11px] text-emerald-400 block">Sur les réparations clôturées et remises</span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Équipe Technique & Staff</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white">
            {data?.staff?.length || 0} Membres
          </p>
          <span className="text-[11px] text-slate-400 block">Ateliers Alger, Oran et Constantine</span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Activités d'Audit Enregistrées</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white">
            {data?.recentAuditLogs?.length || 0} Événements
          </p>
          <span className="text-[11px] text-slate-400 block">Traçabilité complète des actions</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Brands */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-brand-400" />
            <span>Volume de Réparations par Marque</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brandChartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Bar dataKey="volume" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Status Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Répartition par Statut</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {statusChartData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Staff and Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff Table */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Personnel & Techniciens Autorisés</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="py-2">Nom</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Rôle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(data?.staff || []).map((member: any) => (
                  <tr key={member.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 font-semibold text-white">{member.full_name}</td>
                    <td className="py-2.5 text-slate-400">{member.email}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {member.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Logs */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span>Journal d'Audit & Sécurité</span>
          </h3>
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {(data?.recentAuditLogs || []).length === 0 ? (
              <p className="text-xs text-slate-500 italic">Aucune anomalie signalée.</p>
            ) : (
              (data?.recentAuditLogs || []).map((log: any) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-brand-400">{log.action}</strong>
                    <span className="text-slate-500">{new Date(log.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-300">{log.details}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
