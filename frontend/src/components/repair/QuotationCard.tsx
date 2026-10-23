import React, { useState } from 'react';
import { Quote } from '../../types';
import { useI18n } from '../../i18n';
import { Modal } from '../ui/Modal';
import {
  FileText,
  CheckCircle,
  XCircle,
  Calendar,
  AlertTriangle,
  Clock,
  Wrench,
  Package
} from 'lucide-react';

interface Props {
  quote: Quote;
  canApprove?: boolean;
  onApprove?: (quoteId: string) => Promise<void>;
  onReject?: (quoteId: string, reason?: string) => Promise<void>;
}

export const QuotationCard: React.FC<Props> = ({
  quote,
  canApprove = false,
  onApprove,
  onReject,
}) => {
  const { t, formatDZD, locale } = useI18n();
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    if (!onApprove) return;
    try {
      setIsSubmitting(true);
      await onApprove(quote.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!onReject) return;
    try {
      setIsSubmitting(true);
      await onReject(quote.id, rejectionReason);
      setIsRejectModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPending = quote.status === 'PENDING';
  const isAccepted = quote.status === 'ACCEPTED';
  const isRejected = quote.status === 'REJECTED';
  const isSuperseded = quote.status === 'SUPERSEDED';

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">{quote.quotation_number}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Version {quote.version}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Émis le {new Date(quote.created_at).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'fr-DZ')}
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div>
          {isPending && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>En attente de votre accord</span>
            </span>
          )}
          {isAccepted && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Devis Approuvé</span>
            </span>
          )}
          {isRejected && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" />
              <span>Devis Refusé</span>
            </span>
          )}
          {isSuperseded && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
              Remplacé par une nouvelle version
            </span>
          )}
        </div>
      </div>

      {/* Itemized Table */}
      <div className="p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-800/40 rounded-lg">
              <tr>
                <th className="py-2.5 px-3 rounded-l-lg">Type</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-right">Prix Unitaire</th>
                <th className="py-2.5 px-3 text-center">Qté</th>
                <th className="py-2.5 px-3 text-right rounded-r-lg">Sous-total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {quote.items && quote.items.length > 0 ? (
                quote.items.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-800/20">
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 font-semibold text-[11px]">
                        {item.item_type === 'PART' ? (
                          <>
                            <Package className="w-3 h-3 text-cyan-400" />
                            <span className="text-cyan-300">Pièce</span>
                          </>
                        ) : (
                          <>
                            <Wrench className="w-3 h-3 text-amber-400" />
                            <span className="text-amber-300">Main d'œuvre</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-white">{item.description}</td>
                    <td className="py-3 px-3 text-right">{formatDZD(item.unit_price_dzd)}</td>
                    <td className="py-3 px-3 text-center">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-bold text-white">
                      {formatDZD(item.total_price_dzd)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-500">
                    Forfait réparation global
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-700">
                <td colSpan={4} className="py-4 px-3 text-right font-bold text-slate-300 text-sm">
                  Total Devis Ferme :
                </td>
                <td className="py-4 px-3 text-right font-black text-brand-400 text-base">
                  {formatDZD(quote.total_price_dzd)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Technician Notes & Delay */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
          {quote.technician_notes && (
            <div>
              <span className="font-semibold text-slate-300">Remarques de l'atelier : </span>
              <span className="text-slate-400">{quote.technician_notes}</span>
            </div>
          )}
          {quote.estimated_completion_date && (
            <div className="flex items-center gap-2 text-slate-300">
              <Calendar className="w-4 h-4 text-brand-400" />
              <span>Délai d'achèvement prévu : <strong>{quote.estimated_completion_date}</strong></span>
            </div>
          )}
          {quote.expiration_date && (
            <div className="flex items-center gap-2 text-slate-400">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Ce devis est valable jusqu'au {new Date(quote.expiration_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Customer Decision Actions */}
        {canApprove && isPending && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => setIsRejectModalOpen(true)}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition-colors disabled:opacity-50"
            >
              Refuser le devis
            </button>
            <button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-500 text-white hover:bg-brand-600 text-xs font-bold shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Accepter le devis & lancer la réparation</span>
            </button>
          </div>
        )}
      </div>

      {/* Reject Confirmation Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Refuser le devis de réparation"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Êtes-vous certain de vouloir refuser ce devis ? Si vous refusez, aucune réparation ne sera entreprise et vous pourrez récupérer votre appareil sans frais de réparation.
          </p>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Motif du refus (facultatif) :
            </label>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ex: Prix supérieur à mon budget, achat d'un nouveau téléphone..."
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setIsRejectModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Annuler
            </button>
            <button
              onClick={handleRejectConfirm}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
            >
              Confirmer le refus
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
