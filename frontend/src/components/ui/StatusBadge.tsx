import React from 'react';
import { RepairStatus } from '../../types';
import { useI18n } from '../../i18n';
import {
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Package,
  FileText,
  Wrench,
  ThumbsUp,
  ThumbsDown,
  ShoppingBag,
  CheckCheck,
  Ban
} from 'lucide-react';

interface Props {
  status: RepairStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'md', showIcon = true }) => {
  const { t } = useI18n();

  const config: Record<
    RepairStatus,
    { labelKey: any; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    NEW: {
      labelKey: 'status_NEW',
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      icon: Clock,
    },
    UNDER_DIAGNOSIS: {
      labelKey: 'status_UNDER_DIAGNOSIS',
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-400',
      border: 'border-indigo-500/30',
      icon: Search,
    },
    REPAIRABLE: {
      labelKey: 'status_REPAIRABLE',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      icon: CheckCircle2,
    },
    UNREPAIRABLE: {
      labelKey: 'status_UNREPAIRABLE',
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      border: 'border-red-500/30',
      icon: XCircle,
    },
    REPAIR_NOT_ECONOMICAL: {
      labelKey: 'status_REPAIR_NOT_ECONOMICAL',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      icon: AlertTriangle,
    },
    WAITING_FOR_PARTS: {
      labelKey: 'status_WAITING_FOR_PARTS',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
      icon: Package,
    },
    QUOTE_PENDING: {
      labelKey: 'status_QUOTE_PENDING',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      icon: FileText,
    },
    QUOTE_ACCEPTED: {
      labelKey: 'status_QUOTE_ACCEPTED',
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-300',
      border: 'border-emerald-500/40',
      icon: ThumbsUp,
    },
    QUOTE_REJECTED: {
      labelKey: 'status_QUOTE_REJECTED',
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      icon: ThumbsDown,
    },
    IN_REPAIR: {
      labelKey: 'status_IN_REPAIR',
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-400',
      border: 'border-cyan-500/30',
      icon: Wrench,
    },
    REPAIR_COMPLETED: {
      labelKey: 'status_REPAIR_COMPLETED',
      bg: 'bg-teal-500/10',
      text: 'text-teal-400',
      border: 'border-teal-500/30',
      icon: CheckCheck,
    },
    READY_FOR_PICKUP: {
      labelKey: 'status_READY_FOR_PICKUP',
      bg: 'bg-green-500/15',
      text: 'text-green-300',
      border: 'border-green-500/40',
      icon: ShoppingBag,
    },
    DELIVERED: {
      labelKey: 'status_DELIVERED',
      bg: 'bg-slate-500/15',
      text: 'text-slate-300',
      border: 'border-slate-500/30',
      icon: CheckCircle2,
    },
    CANCELLED: {
      labelKey: 'status_CANCELLED',
      bg: 'bg-zinc-500/10',
      text: 'text-zinc-400',
      border: 'border-zinc-500/20',
      icon: Ban,
    },
  };

  const item = config[status] || config.NEW;
  const IconComponent = item.icon;

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${item.bg} ${item.text} ${item.border} ${sizeStyles[size]}`}
    >
      {showIcon && <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{t(item.labelKey)}</span>
    </span>
  );
};
