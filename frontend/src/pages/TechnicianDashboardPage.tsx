import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useI18n, BRANDS } from '../i18n';
import { RepairStatus } from '../types';
import {
  Wrench,
  Search,
  Filter,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Package,
  ShoppingBag,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const TechnicianDashboardPage: React.FC = () => {
  const { t, formatDZD, locale } = useI18n();

  const [metrics, setMetrics] = useState<any | null>(null);
  const [repairs, setRepairs] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [brandFilter, setBrandFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, listRes] = await Promise.all([
        api.technician.getDashboard(),
        api.repairs.list({
          status: statusFilter || undefined,
          brand: brandFilter || undefined,
          search: searchQuery || undefined,
          page: pagination.page,
          limit: pagination.limit,
        }),
      ]);
      setMetrics(dashRes.metrics);
      setRepairs(listRes.items || []);
      setPagination(listRes.pagination);
    } catch (err: any) {
      console.error('Failed to load technician dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [statusFilter, brandFilter, pagination.page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchDashboardData();
  };

  const exportCsv = () => {
    if (repairs.length === 0) return;
    const headers = ['Reference', 'Client', 'Telephone', 'Marque', 'Modele', 'Panne', 'Statut', 'Prix_DZD', 'Date'];
    const rows = repairs.map((r) => [
      r.reference_number,
      `"${r.customer_name}"`,
      r.customer_phone,
      r.brand,
      `"${r.model}"`,
      `"${r.main_issue_category}"`,
      r.current_status,
      r.total_price_dzd || 0,
      r.created_at,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reparations_phonetech_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Atelier & Tableau de Bord Technique
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Supervision du flux de diagnostic, validation des devis et suivi des réparations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="Rafraîchir"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-semibold"
          >
            <Download className="w-4 h-4 text-brand-400" />
            <span>{t('exportCsv')}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block font-medium">Total</span>
            <span className="text-xl font-black text-white mt-0.5 block">{metrics.total}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-blue-500/30 text-center bg-blue-500/5">
            <span className="text-[11px] text-blue-400 block font-medium">Nouveaux</span>
            <span className="text-xl font-black text-blue-300 mt-0.5 block">{metrics.new}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-indigo-500/30 text-center bg-indigo-500/5">
            <span className="text-[11px] text-indigo-400 block font-medium">En Diagnostic</span>
            <span className="text-xl font-black text-indigo-300 mt-0.5 block">{metrics.underDiagnosis}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/30 text-center bg-amber-500/5">
            <span className="text-[11px] text-amber-400 block font-medium">Devis En Attente</span>
            <span className="text-xl font-black text-amber-300 mt-0.5 block">{metrics.quotePending}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/30 text-center bg-emerald-500/5">
            <span className="text-[11px] text-emerald-400 block font-medium">Devis Approuvé</span>
            <span className="text-xl font-black text-emerald-300 mt-0.5 block">{metrics.quoteAccepted}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-cyan-500/30 text-center bg-cyan-500/5">
            <span className="text-[11px] text-cyan-400 block font-medium">En Réparation</span>
            <span className="text-xl font-black text-cyan-300 mt-0.5 block">{metrics.inRepair}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-teal-500/30 text-center bg-teal-500/5">
            <span className="text-[11px] text-teal-400 block font-medium">Prêts au Retrait</span>
            <span className="text-xl font-black text-teal-300 mt-0.5 block">{metrics.readyPickup}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-red-500/30 text-center bg-red-500/5">
            <span className="text-[11px] text-red-400 block font-medium">Irréparables</span>
            <span className="text-xl font-black text-red-300 mt-0.5 block">{metrics.unrepairable}</span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par référence, modèle, client ou téléphone..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
            >
              <option value="">Tous les statuts</option>
              <option value="NEW">Nouvelle demande</option>
              <option value="UNDER_DIAGNOSIS">En cours de diagnostic</option>
              <option value="REPAIRABLE">Réparable</option>
              <option value="UNREPAIRABLE">Irréparable</option>
              <option value="QUOTE_PENDING">Devis en attente</option>
              <option value="QUOTE_ACCEPTED">Devis approuvé</option>
              <option value="IN_REPAIR">En réparation</option>
              <option value="READY_FOR_PICKUP">Prêt au retrait</option>
              <option value="DELIVERED">Restitué</option>
            </select>

            <select
              value={brandFilter}
              onChange={(e) => {
                setBrandFilter(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
            >
              <option value="">Toutes les marques</option>
              {BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-bold hover:bg-brand-600 transition-colors"
            >
              Filtrer
            </button>
          </div>
        </form>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/60 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Référence</th>
                <th className="py-3 px-4">Client & Contact</th>
                <th className="py-3 px-4">Appareil</th>
                <th className="py-3 px-4">Panne Déclarée</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Devis (DZD)</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Chargement des dossiers d'atelier...
                  </td>
                </tr>
              ) : repairs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Aucun dossier de réparation trouvé pour ces filtres.
                  </td>
                </tr>
              ) : (
                repairs.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-brand-400">
                        {r.reference_number}
                      </span>
                      <span className="block text-[10px] text-slate-500">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-white block">{r.customer_name}</span>
                      <span className="text-slate-400 text-[11px] block">{r.customer_phone}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-200">
                        {r.brand} {r.model}
                      </span>
                      {r.color && <span className="text-[10px] text-slate-500 block">{r.color}</span>}
                    </td>
                    <td className="py-3 px-4 max-w-[200px]">
                      <span className="text-slate-300 font-medium block truncate">
                        {r.main_issue_category}
                      </span>
                      <span className="text-slate-500 text-[10px] block truncate">
                        {r.symptom_description}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={r.current_status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-white">
                      {r.total_price_dzd ? formatDZD(r.total_price_dzd) : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        to={`/repairs/${r.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-semibold transition-colors"
                      >
                        <span>Diagnostiquer</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40">
          <span>
            Affichage de {repairs.length} sur {pagination.total} dossiers
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination((p) => ({ ...p, page: Math.max(p.page - 1, 1) }))}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold text-white">
              Page {pagination.page} / {pagination.totalPages || 1}
            </span>
            <button
              onClick={() =>
                setPagination((p) => ({ ...p, page: Math.min(p.page + 1, pagination.totalPages) }))
              }
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
