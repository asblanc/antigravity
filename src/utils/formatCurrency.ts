/**
 * Format price as FCFA currency (e.g., 10000 → "10 000 FCFA")
 */
export function formatFCFA(amount: number): string {
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF', // West African CFA franc
    minimumFractionDigits: 0,
  }).format(amount);
  return formatted;
}

/**
 * Format price as short FCFA (e.g., 10000 → "10K FCFA")
 */
export function formatFCFAShort(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M FCFA`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K FCFA`;
  }
  return `${amount} FCFA`;
}
