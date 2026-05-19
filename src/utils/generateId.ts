/**
 * Generate IBC Member ID (format: IBC-XXXXXX)
 */
export function generateMemberId(): string {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `IBC-${random}`;
}

/**
 * Generate IBC Partner ID (format: IBC-P-XXXXXX)
 */
export function generatePartnerId(): string {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `IBC-P-${random}`;
}
