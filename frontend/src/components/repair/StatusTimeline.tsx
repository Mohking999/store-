import React from 'react';
import { RepairStatus, StatusHistory } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { useI18n } from '../../i18n';
import { Check, Clock, AlertCircle } from 'lucide-react';

interface Props {
  currentStatus: RepairStatus;
  history?: StatusHistory[];
}

export const StatusTimeline: React.FC<Props> = ({ currentStatus, history = [] }) => {
  const { t, locale } = useI18n();

  const stages: Array<{ key: string; labelFr: string; labelAr: string; matches: RepairStatus[] }> = [
    { key: 'received', labelFr: 'Demande reçue', labelAr: 'استلام الطلب', matches: ['NEW'] },
    {
      key: 'diagnosis',
      labelFr: 'Diagnostic & Examen',
      labelAr: 'الفحص والتشخيص',
      matches: ['UNDER_DIAGNOSIS', 'REPAIRABLE', 'UNREPAIRABLE', 'REPAIR_NOT_ECONOMICAL', 'WAITING_FOR_PARTS'],
    },
    {
      key: 'quote',
      labelFr: 'Devis & Approbation',
      labelAr: 'المقايسة والموافقة',
      matches: ['QUOTE_PENDING', 'QUOTE_ACCEPTED', 'QUOTE_REJECTED'],
    },
    {
      key: 'repair',
      labelFr: 'En Réparation',
      labelAr: 'قيد الإصلاح',
      matches: ['IN_REPAIR', 'REPAIR_COMPLETED'],
    },
    {
      key: 'ready',
      labelFr: 'Prêt / Restitué',
      labelAr: 'جاهز / تم التسليم',
      matches: ['READY_FOR_PICKUP', 'DELIVERED'],
    },
  ];

  const getCurrentStageIndex = (): number => {
    for (let i = stages.length - 1; i >= 0; i--) {
      if (stages[i].matches.includes(currentStatus)) {
        return i;
      }
    }
    return 0;
  };

  const currentIdx = getCurrentStageIndex();
  const isCancelled = currentStatus === 'CANCELLED';

  return (
    <div className="space-y-6">
      {/* Visual Stepper */}
      <div className="relative">
        <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-slate-800 -z-0 rounded-full" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative z-10">
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentIdx;
            const isCurrent = idx === currentIdx;

            return (
              <div
                key={stage.key}
                className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                  isCurrent
                    ? 'bg-brand-500/10 border-brand-500/50 shadow-lg shadow-brand-500/10'
                    : isCompleted
                    ? 'bg-slate-900 border-emerald-500/30'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-brand-500 text-white ring-4 ring-brand-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-xs font-semibold ${isCurrent ? 'text-white' : isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>
                  {locale === 'ar' ? stage.labelAr : stage.labelFr}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {isCancelled && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Cette demande de réparation a été annulée.</span>
        </div>
      )}

      {/* History Log Timeline */}
      {history.length > 0 && (
        <div className="mt-6 border-t border-slate-800/80 pt-6">
          <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-400" />
            <span>Historique des étapes et interventions</span>
          </h4>
          <div className="space-y-3">
            {history.map((h, i) => (
              <div
                key={h.id || i}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs"
              >
                <div className="mt-0.5">
                  <StatusBadge status={h.to_status} size="sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 font-medium">{h.notes || 'Mise à jour du statut'}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                    {h.changed_by_name && <span>Par : {h.changed_by_name}</span>}
                    <span>{new Date(h.created_at).toLocaleString(locale === 'ar' ? 'ar-DZ' : 'fr-DZ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
