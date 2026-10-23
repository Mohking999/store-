import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useI18n } from '../i18n';
import { useAuth } from '../lib/auth';
import { StatusBadge } from '../components/ui/StatusBadge';
import { StatusTimeline } from '../components/repair/StatusTimeline';
import { QuotationCard } from '../components/repair/QuotationCard';
import { Modal } from '../components/ui/Modal';
import { RepairDetails, RepairStatus, RepairabilityDecision, QuoteItemType } from '../types';
import {
  Smartphone,
  User,
  AlertTriangle,
  Wrench,
  FileText,
  Clock,
  CheckCircle,
  Plus,
  Trash2,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Send
} from 'lucide-react';

export const RepairDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, formatDZD, locale } = useI18n();

  const [details, setDetails] = useState<RepairDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Diagnosis Form State
  const [diagSymptoms, setDiagSymptoms] = useState('');
  const [diagFindings, setDiagFindings] = useState('');
  const [diagSuspected, setDiagSuspected] = useState('');
  const [diagConfirmed, setDiagConfirmed] = useState('');
  const [diagDecision, setDiagDecision] = useState<RepairabilityDecision>('REPAIRABLE');
  const [diagExplanation, setDiagExplanation] = useState('');
  const [diagSolution, setDiagSolution] = useState('');
  const [diagLabor, setDiagLabor] = useState(2000);
  const [diagParts, setDiagParts] = useState(3500);
  const [diagDuration, setDiagDuration] = useState(24);
  const [diagDate, setDiagDate] = useState('');
  const [isSavingDiag, setIsSavingDiag] = useState(false);

  // New Quote Modal State
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteItems, setQuoteItems] = useState<Array<{ itemType: QuoteItemType; description: string; unitPriceDzd: number; quantity: number }>>([
    { itemType: 'PART', description: 'Pièce de rechange d\'origine', unitPriceDzd: 4000, quantity: 1 },
    { itemType: 'LABOR', description: 'Main d\'œuvre & tests sous microscope', unitPriceDzd: 1500, quantity: 1 },
  ]);
  const [quoteNotes, setQuoteNotes] = useState('Garantie 3 mois pièces et main d\'œuvre incluse.');
  const [quoteDate, setQuoteDate] = useState('');
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);

  // Status Change Dialog
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<RepairStatus>('UNDER_DIAGNOSIS');
  const [statusNotes, setStatusNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.repairs.get(id);
      setDetails(res);

      if (res.diagnosis) {
        setDiagSymptoms(res.diagnosis.reported_symptoms || '');
        setDiagFindings(res.diagnosis.inspection_findings || '');
        setDiagSuspected(res.diagnosis.suspected_fault || '');
        setDiagConfirmed(res.diagnosis.confirmed_fault || '');
        setDiagDecision(res.diagnosis.repairability_decision || 'REPAIRABLE');
        setDiagExplanation(res.diagnosis.decision_explanation || '');
        setDiagSolution(res.diagnosis.recommended_solution || '');
        setDiagLabor(res.diagnosis.labor_estimate || 0);
        setDiagParts(res.diagnosis.parts_estimate || 0);
        setDiagDuration(res.diagnosis.estimated_repair_duration_hours || 24);
        setDiagDate(res.diagnosis.estimated_completion_date || '');
      } else {
        setDiagSymptoms(res.repair.symptom_description || '');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors du chargement des détails du dossier');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleSaveDiagnosis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSavingDiag(true);
    try {
      await api.diagnostics.save(id, {
        reportedSymptoms: diagSymptoms,
        inspectionFindings: diagFindings,
        suspectedFault: diagSuspected,
        confirmedFault: diagConfirmed,
        repairabilityDecision: diagDecision,
        decisionExplanation: diagExplanation,
        recommendedSolution: diagSolution,
        laborEstimate: Number(diagLabor),
        partsEstimate: Number(diagParts),
        additionalCosts: 0,
        estimatedRepairDurationHours: Number(diagDuration),
        estimatedCompletionDate: diagDate || undefined,
      });
      alert('Diagnostic enregistré avec succès ! Le statut a été synchronisé.');
      await fetchDetails();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l\'enregistrement du diagnostic');
    } finally {
      setIsSavingDiag(false);
    }
  };

  const handleCreateQuote = async () => {
    if (!id) return;
    if (quoteItems.length === 0) {
      alert('Veuillez ajouter au moins une ligne au devis');
      return;
    }
    setIsCreatingQuote(true);
    try {
      await api.quotes.create(id, {
        items: quoteItems,
        technicianNotes: quoteNotes,
        estimatedCompletionDate: quoteDate || undefined,
        expirationDays: 14,
      });
      alert('Devis créé et envoyé au client ! Statut passé à QUOTE_PENDING.');
      setIsQuoteModalOpen(false);
      await fetchDetails();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la création du devis');
    } finally {
      setIsCreatingQuote(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!id) return;
    setIsUpdatingStatus(true);
    try {
      await api.repairs.updateStatus(id, targetStatus, statusNotes);
      alert(`Statut mis à jour vers ${targetStatus}`);
      setIsStatusModalOpen(false);
      setStatusNotes('');
      await fetchDetails();
    } catch (err: any) {
      alert(err.message || 'Erreur lors du changement de statut');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const addQuoteItem = () => {
    setQuoteItems([
      ...quoteItems,
      { itemType: 'PART', description: '', unitPriceDzd: 1000, quantity: 1 },
    ]);
  };

  const removeQuoteItem = (idx: number) => {
    setQuoteItems(quoteItems.filter((_, i) => i !== idx));
  };

  const updateQuoteItem = (idx: number, field: string, val: any) => {
    const updated = [...quoteItems];
    (updated[idx] as any)[field] = val;
    setQuoteItems(updated);
  };

  const quoteTotal = quoteItems.reduce(
    (sum, it) => sum + (Number(it.unitPriceDzd) || 0) * (Number(it.quantity) || 1),
    0
  );

  if (isLoading) {
    return <div className="max-w-7xl mx-auto p-12 text-center text-xs text-slate-500">Chargement de l'atelier...</div>;
  }

  if (errorMessage || !details) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">Impossible d'accéder au dossier</h2>
        <p className="text-xs text-slate-400">{errorMessage || 'Dossier introuvable'}</p>
        <Link to="/technician" className="inline-block text-xs text-brand-400 font-semibold">
          ← Retour au tableau de bord
        </Link>
      </div>
    );
  }

  const { repair, diagnosis, quotes, history, attachments } = details;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Link
            to={user?.role === 'ADMIN' ? '/admin' : '/technician'}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-brand-400 font-bold text-sm">
                {repair.reference_number}
              </span>
              <h1 className="text-xl font-bold text-white">
                {repair.brand} {repair.model}
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Client : <strong className="text-slate-200">{repair.customer_name}</strong> •{' '}
              {repair.customer_phone} • Wilaya : {repair.wilaya || 'Alger'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={repair.current_status} size="lg" />

          <button
            onClick={() => {
              setTargetStatus(repair.current_status);
              setIsStatusModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold"
          >
            Changer Statut
          </button>

          <button
            onClick={() => setIsQuoteModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-lg shadow-brand-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Devis</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Technical Diagnostic Form & Quotations */}
        <div className="lg:col-span-2 space-y-8">
          {/* Photos from R2 if uploaded */}
          {attachments && attachments.length > 0 && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-brand-400" />
                <span>Photos de l'appareil (Stockage R2 Sécurisé)</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {attachments.map((att) => (
                  <a
                    key={att.id}
                    href={api.uploads.getUrl(att.file_key)}
                    target="_blank"
                    rel="noreferrer"
                    className="group block relative rounded-xl overflow-hidden border border-slate-800 aspect-video bg-slate-950 hover:border-brand-500 transition-colors"
                  >
                    <img
                      src={api.uploads.getUrl(att.file_key)}
                      alt={att.file_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[11px] text-white font-semibold">
                      Agrandir
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Technical Diagnosis Form (Workbench) */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Diagnostic Technique en Atelier</h3>
              </div>
              {diagnosis && (
                <span className="text-[11px] text-slate-400">
                  Dernière mise à jour par {diagnosis.technician_name || 'Technicien'}
                </span>
              )}
            </div>

            <form onSubmit={handleSaveDiagnosis} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Constatations physiques (Démontage / Inspection) *
                    </label>
                    <textarea
                      rows={3}
                      value={diagFindings}
                      onChange={(e) => setDiagFindings(e.target.value)}
                      placeholder="Ex: Traces d'oxydation sur rail VDD_MAIN, vitre tactile fissurée..."
                      required
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Panne confirmée au laboratoire *
                    </label>
                    <textarea
                      rows={3}
                      value={diagConfirmed}
                      onChange={(e) => setDiagConfirmed(e.target.value)}
                      placeholder="Ex: Circuit intégré de charge (PMIC) en court-circuit"
                      required
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Décision de réparabilité *
                    </label>
                    <select
                      value={diagDecision}
                      onChange={(e) => setDiagDecision(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="REPAIRABLE">REPAIRABLE — Appareil Réparable</option>
                      <option value="UNREPAIRABLE">UNREPAIRABLE — Irréparable</option>
                      <option value="REPAIR_NOT_ECONOMICAL">REPAIR_NOT_ECONOMICAL — Non Économique</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Solution technique recommandée *
                    </label>
                    <input
                      type="text"
                      value={diagSolution}
                      onChange={(e) => setDiagSolution(e.target.value)}
                      placeholder="Ex: Micro-soudure PMIC et nettoyage ultrason"
                      required
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Explication de la décision (Mandatoire si irréparable) *
                  </label>
                  <textarea
                    rows={2}
                    value={diagExplanation}
                    onChange={(e) => setDiagExplanation(e.target.value)}
                    placeholder="Détaillez la faisabilité technique ou la raison du refus pour le client..."
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Estimation Pièces (DZD)</label>
                    <input
                      type="number"
                      value={diagParts}
                      onChange={(e) => setDiagParts(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Estimation M.O. (DZD)</label>
                    <input
                      type="number"
                      value={diagLabor}
                      onChange={(e) => setDiagLabor(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Délai estimé (Heures)</label>
                    <input
                      type="number"
                      value={diagDuration}
                      onChange={(e) => setDiagDuration(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingDiag}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
                  >
                    {isSavingDiag ? 'Enregistrement...' : 'Enregistrer le Diagnostic & Mettre à jour le Statut'}
                  </button>
                </div>
            </form>
          </div>

          {/* Quotations List */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <span>Devis & Historique des Validations</span>
            </h3>

            {quotes && quotes.length > 0 ? (
              quotes.map((q) => (
                <QuotationCard
                  key={q.id}
                  quote={q}
                  canApprove={false}
                  onApprove={async (quoteId) => {
                    await api.quotes.approve(quoteId);
                    await fetchDetails();
                  }}
                  onReject={async (quoteId, reason) => {
                    await api.quotes.reject(quoteId, reason);
                    await fetchDetails();
                  }}
                />
              ))
            ) : (
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-500">
                Aucun devis n'a encore été émis pour cette réparation.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Device & Customer Dossier + Status Stepper */}
        <div className="space-y-6">
          {/* Dossier Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
              Dossier de l'Appareil
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Marque & Modèle :</span>
                <span className="text-white font-bold">{repair.brand} {repair.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Couleur :</span>
                <span className="text-slate-200">{repair.color || 'Non spécifié'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">IMEI / Série :</span>
                <span className="text-slate-200 font-mono">{repair.imei_serial || 'Non fourni'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">S'allume :</span>
                <span className={repair.is_powering_on ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {repair.is_powering_on ? 'Oui' : 'Non'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">A chuté :</span>
                <span className={repair.was_dropped ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                  {repair.was_dropped ? 'Oui' : 'Non'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Exposé à l'eau :</span>
                <span className={repair.liquid_exposure ? 'text-cyan-400 font-bold' : 'text-slate-300'}>
                  {repair.liquid_exposure ? 'Oui' : 'Non'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-slate-400 font-semibold block">Symptômes déclarés par le client :</span>
              <p className="text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                {repair.symptom_description}
              </p>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
              Évolution du Statut
            </h3>
            <StatusTimeline currentStatus={repair.current_status} history={history} />
          </div>
        </div>
      </div>

      {/* New Quote Builder Modal */}
      <Modal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        title="Créer un nouveau devis chiffré en DZD"
        maxWidth="xl"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-400">
            Détaillez les pièces de rechange et la main d'œuvre. La création de ce devis passera automatiquement le statut en <strong>QUOTE_PENDING</strong> et nécessitera l'approbation du client.
          </p>

          <div className="space-y-3">
            {quoteItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
                <select
                  value={item.itemType}
                  onChange={(e) => updateQuoteItem(idx, 'itemType', e.target.value)}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-white w-28 shrink-0"
                >
                  <option value="PART">Pièce</option>
                  <option value="LABOR">M.O.</option>
                  <option value="OTHER">Autre</option>
                </select>

                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateQuoteItem(idx, 'description', e.target.value)}
                  placeholder="Désignation (ex: Écran OLED)"
                  className="flex-1 p-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                />

                <input
                  type="number"
                  value={item.unitPriceDzd}
                  onChange={(e) => updateQuoteItem(idx, 'unitPriceDzd', e.target.value)}
                  placeholder="Prix DZD"
                  className="w-24 p-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-right"
                />

                <input
                  type="number"
                  value={item.quantity}
                  min={1}
                  onChange={(e) => updateQuoteItem(idx, 'quantity', e.target.value)}
                  placeholder="Qté"
                  className="w-14 p-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-center"
                />

                <button
                  type="button"
                  onClick={() => removeQuoteItem(idx)}
                  className="p-2 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addQuoteItem}
              className="px-3 py-1.5 rounded-lg border border-dashed border-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter une ligne</span>
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-300">Total Devis (DZD) :</span>
            <span className="text-base font-black text-brand-400">{formatDZD(quoteTotal)}</span>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Remarques pour le client :</label>
            <input
              type="text"
              value={quoteNotes}
              onChange={(e) => setQuoteNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              onClick={() => setIsQuoteModalOpen(false)}
              className="px-4 py-2 text-slate-400 hover:text-white"
            >
              Annuler
            </button>
            <button
              onClick={handleCreateQuote}
              disabled={isCreatingQuote}
              className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold"
            >
              {isCreatingQuote ? 'Envoi...' : 'Envoyer le Devis au Client'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Status Transition Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Changer le statut de la réparation"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Nouveau statut cible :</label>
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value as any)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
            >
              <option value="UNDER_DIAGNOSIS">UNDER_DIAGNOSIS (En cours de diagnostic)</option>
              <option value="REPAIRABLE">REPAIRABLE (Réparable)</option>
              <option value="UNREPAIRABLE">UNREPAIRABLE (Irréparable)</option>
              <option value="WAITING_FOR_PARTS">WAITING_FOR_PARTS (En attente de pièces)</option>
              <option value="IN_REPAIR">IN_REPAIR (En réparation)</option>
              <option value="REPAIR_COMPLETED">REPAIR_COMPLETED (Réparation terminée)</option>
              <option value="READY_FOR_PICKUP">READY_FOR_PICKUP (Prêt au retrait)</option>
              <option value="DELIVERED">DELIVERED (Restitué au client)</option>
              <option value="CANCELLED">CANCELLED (Annulé)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Note explicative :</label>
            <textarea
              rows={3}
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Ex: Écran reçu du fournisseur, début de l'assemblage sous hotte..."
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button onClick={() => setIsStatusModalOpen(false)} className="px-4 py-2 text-slate-400">
              Annuler
            </button>
            <button
              onClick={handleStatusUpdate}
              disabled={isUpdatingStatus}
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold"
            >
              {isUpdatingStatus ? 'Validation...' : 'Confirmer le changement'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
