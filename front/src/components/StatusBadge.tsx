import { RequestStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Clock, Loader2, CheckCircle, XCircle, Send } from 'lucide-react';

interface StatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

const statusConfig: Record<RequestStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode; color: string }> = {
  pending: {
    label: 'En attente',
    variant: 'outline',
    icon: <Clock className="w-3 h-3" />,
    color: 'text-warning',
  },
  in_progress: {
    label: 'En traitement',
    variant: 'secondary',
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
    color: 'text-info',
  },
  validated: {
    label: 'Validée',
    variant: 'default',
    icon: <CheckCircle className="w-3 h-3" />,
    color: 'text-success',
  },
  rejected: {
    label: 'Rejetée',
    variant: 'destructive',
    icon: <XCircle className="w-3 h-3" />,
    color: 'text-destructive',
  },
  transmitted: {
    label: 'Transmise',
    variant: 'default',
    icon: <Send className="w-3 h-3" />,
    color: 'text-primary',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={`gap-1 ${className}`}>
      <span className={config.color}>{config.icon}</span>
      {config.label}
    </Badge>
  );
};
