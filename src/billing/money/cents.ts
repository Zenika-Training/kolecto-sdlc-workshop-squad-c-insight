/**
 * Integer minor units (cents). Never use floats for money (ENG-01).
 * Every helper here returns an integer.
 */
export type Minor = number;

export const sum = (amounts: Minor[]): Minor => amounts.reduce((total, a) => total + a, 0);

export const subtract = (a: Minor, b: Minor): Minor => a - b;

export const clampToZero = (a: Minor): Minor => Math.max(0, a);

/** Round half up to the cent, the rule finance uses for every computed amount. */
export const roundHalfUp = (value: number): Minor => Math.round(value);

/** `amount × percent / 100`, rounded half up. */
export const percentOf = (amount: Minor, percent: number): Minor => roundHalfUp((amount * percent) / 100);

/**
 * Simple annual interest over a number of days, on a 365-day year, rounded half up.
 * Used by the accounting export for late interest provisions.
 */
export const simpleInterest = (amount: Minor, annualRatePercent: number, days: number): Minor =>
  roundHalfUp((amount * annualRatePercent * days) / (100 * 365));

/** @deprecated Floats were used before BILL-88. Kept for `dunning-v0` only. */
export const toEuros = (amount: Minor): number => amount / 100;

/** @deprecated See `toEuros`. */
export const fromEuros = (euros: number): Minor => Math.round(euros * 100);
