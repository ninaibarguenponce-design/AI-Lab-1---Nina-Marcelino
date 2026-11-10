/**
 * Single source of truth for the D.C. rules and rates the app relies on.
 * Change a number here and every screen, the report and the AI prompt follow.
 *
 * Sources (checked November 2026):
 * - Lodging tax: D.C. Office of Tax and Revenue, Tax Notice 2023-01
 *   (14.95% raised to 15.95% from April 1, 2023 through March 30, 2027).
 * - Night cap, license fee, insurance, primary residence:
 *   D.C. Department of Licensing and Consumer Protection, short-term rental licensing page.
 */

/** Paid by the guest on top of the nightly rate; Airbnb collects and remits it. */
export const DC_LODGING_TAX_PERCENT = 15.95;

/** Nights per calendar year a home may be rented while the owner is away ("vacation rental"). */
export const VACATION_RENTAL_NIGHT_CAP = 90;

/** Longest single stay that still counts as a short-term rental. */
export const MAX_NIGHTS_PER_STAY = 30;

/** Minimum liability insurance D.C. asks hosts to show. */
export const MIN_LIABILITY_INSURANCE = 250000;

/** Fee for either short-term rental license, valid two years. */
export const LICENSE_FEE = 99;
export const LICENSE_TERM_YEARS = 2;

export const DAYS_IN_MONTH = 30.4;

export const SOURCES = {
  licensing: 'https://dlcp.dc.gov/node/1616736',
  tax: 'https://otr.cfo.dc.gov/release/otr-tax-notice-2023-01-sales-and-use-tax-rate-increase-transient-accommodations',
  data: 'https://insideairbnb.com/washington-dc/',
};
