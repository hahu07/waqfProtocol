/**
 * Utility functions for formatting data in the Waqf Protocol
 * Includes enhanced error handling, documentation, and Islamic finance support
 */

/**
 * Formats a monetary amount as currency with support for Islamic finance currencies
 * @param amount - The amount to format (must be a valid number)
 * @param currency - ISO 4217 currency code (default: 'NGN' - Nigerian Naira)
 * @param locale - BCP 47 language tag (default: auto-selected based on currency)
 * @returns Formatted currency string
 * @throws Will throw error if amount is invalid
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'NGN',
  locale?: string
): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw new Error(`Invalid amount: ${amount}`);
  }

  // Auto-select locale based on currency if not provided
  const defaultLocale = locale || (currency === 'NGN' ? 'en-NG' : currency === 'USD' ? 'en-US' : 'en-US');

  // Special handling for Islamic finance currencies
  const islamicCurrencies = ['SAR', 'AED', 'QAR', 'KWD'];
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  };

  if (islamicCurrencies.includes(currency)) {
    options.currencyDisplay = 'name';
  }

  return new Intl.NumberFormat(defaultLocale, options).format(amount);
};

/**
 * Converts NGN to USD using the current exchange rate
 * @param amountNGN - Amount in Nigerian Naira
 * @param exchangeRate - Current NGN to USD rate (default: 1650)
 * @returns Amount in USD
 */
export const convertNGNtoUSD = (amountNGN: number, exchangeRate: number = 1650): number => {
  return amountNGN / exchangeRate;
};

/**
 * Converts USD to NGN using the current exchange rate
 * @param amountUSD - Amount in US Dollars
 * @param exchangeRate - Current NGN to USD rate (default: 1650)
 * @returns Amount in NGN
 */
export const convertUSDtoNGN = (amountUSD: number, exchangeRate: number = 1650): number => {
  return amountUSD * exchangeRate;
};

/**
 * Formats currency with both NGN and USD
 * @param amount - Amount in NGN
 * @param showUSD - Whether to show USD equivalent (default: true)
 * @param exchangeRate - Current exchange rate (default: 1650)
 * @returns Formatted string with NGN and optionally USD
 */
export const formatCurrencyDual = (
  amount: number,
  showUSD: boolean = true,
  exchangeRate: number = 1650
): { primary: string; secondary?: string } => {
  const primary = formatCurrency(amount, 'NGN');
  const secondary = showUSD ? formatCurrency(convertNGNtoUSD(amount, exchangeRate), 'USD') : undefined;
  
  return { primary, secondary };
};

/**
 * Formats a date string to locale-specific format
 * @param dateString - ISO format date string (YYYY-MM-DD)
 * @param locale - BCP 47 language tag (default: 'en-US')
 * @returns Formatted date string
 * @throws Will throw error if dateString is invalid
 */
export const formatDate = (dateString: string, locale: string = 'en-US'): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${dateString}`);
  }
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Formats a financial period string (e.g., converts "2024-Q1" to "Q1 2024")
 * @param period - The period string in format "YYYY-QN" or "YYYY-MM"
 * @returns Formatted period string
 * @throws Will throw error if period format is invalid
 */
export const formatPeriod = (period: string): string => {
  if (!/^(\d{4})-(Q\d|\d{2})$/.test(period)) {
    throw new Error(`Invalid period format: ${period}. Expected format: YYYY-QN or YYYY-MM`);
  }
  
  const [year, segment] = period.split('-');
  return segment.startsWith('Q') 
    ? `${segment} ${year}` // Quarterly format
    : new Date(`${year}-${segment}-01`).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      }); // Monthly format
};