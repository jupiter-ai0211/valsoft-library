export interface StatusBadgeProps {
  status: 'available' | 'borrowed';
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

  const statusClasses = {
    available: 'bg-green-100 text-green-800',
    borrowed: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`${baseClasses} ${statusClasses[status]} ${className}`}>
      {status === 'available' ? '✓ Available' : '✗ Borrowed'}
    </span>
  );
}
