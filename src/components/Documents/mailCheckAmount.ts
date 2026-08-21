export const MAX_LOB_CHECK_AMOUNT = 100;

export const checkAmountError = (raw: string): string | null => {
  const value = raw.trim();
  if (!value) return 'Enter the check amount.';
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) {
    return 'Enter a dollar amount with no more than two decimal places.';
  }
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return 'Check amount must be greater than $0.00.';
  if (amount > MAX_LOB_CHECK_AMOUNT) return 'Check amount cannot exceed $100.00.';
  return null;
};

export const normalizeCheckAmount = (raw: string): string => Number(raw).toFixed(2);

export const hasPositiveCheckAmount = (raw: unknown): boolean => {
  if (raw === null || raw === undefined) return false;
  const amount = Number(String(raw).trim());
  return Number.isFinite(amount) && amount > 0;
};
