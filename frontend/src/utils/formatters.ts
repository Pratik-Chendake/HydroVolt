export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatFlow(lpm: number): string {
  if (isNaN(lpm) || lpm === null || lpm === undefined) return '0.00 L/min';
  return `${lpm.toFixed(2)} L/min`;
}

export function formatVolume(liters: number): string {
  if (isNaN(liters) || liters === null || liters === undefined) return '0.0 L';
  if (liters >= 1000) {
    return `${(liters / 1000).toFixed(2)} kL (${liters.toFixed(0)} L)`;
  }
  return `${liters.toFixed(1)} L`;
}

export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return 'Never';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch {
    return isoString;
  }
}

export function formatTimeAgo(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return 'No signal';
  if (seconds < 2) return 'Live (Just now)';
  if (seconds < 60) return `${Math.round(seconds)}s ago`;
  const mins = Math.floor(seconds / 60);
  return `${mins}m ${Math.round(seconds % 60)}s ago`;
}
