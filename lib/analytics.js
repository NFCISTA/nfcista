/**
 * NFCISTA Review Assistant Analytics & Timezone Utility
 *
 * Implements strict Asia/Kolkata (IST: UTC+05:30) date boundaries:
 * - "today": 00:00:00.000 IST today -> now
 * - "week": Monday 00:00:00.000 IST of current week -> now
 * - "month": 1st of current month 00:00:00.000 IST -> now
 * - "overall": No start date limit
 *
 * All dates are converted to exact ISO UTC strings for database queries.
 */

export const VALID_EVENT_TYPES = [
  "card_visit",
  "page_view",
  "draft_generated",
  "draft_copied",
  "google_click",
];

export const VALID_DATE_FILTERS = ["today", "week", "month", "overall"];

/**
 * Returns current timestamp components in Asia/Kolkata timezone.
 *
 * @param {Date} [nowDate]
 * @returns {{ year: number, month: number, day: number, hours: number, minutes: number, seconds: number, dayOfWeek: number }}
 */
export function getKolkataComponents(nowDate = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    weekday: "short",
    hour12: false,
  });

  const parts = formatter.formatToParts(nowDate);
  const map = {};
  for (const p of parts) {
    if (p.type !== "literal") {
      map[p.type] = p.value;
    }
  }

  // Day of week mapping: Sun=0, Mon=1, ..., Sat=6
  const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  return {
    year: parseInt(map.year, 10),
    month: parseInt(map.month, 10), // 1-12
    day: parseInt(map.day, 10),
    hours: parseInt(map.hour, 10) === 24 ? 0 : parseInt(map.hour, 10),
    minutes: parseInt(map.minute, 10),
    seconds: parseInt(map.second, 10),
    dayOfWeek: weekdayMap[map.weekday] ?? 0,
  };
}

/**
 * Returns the UTC ISO string for a given IST calendar date at 00:00:00.000.
 *
 * IST is UTC+05:30.
 * 00:00:00 IST on YYYY-MM-DD corresponds to YYYY-MM-(DD-1) 18:30:00 UTC.
 *
 * @param {number} year
 * @param {number} month - 1-12
 * @param {number} day - 1-31
 * @returns {string} ISO UTC string
 */
export function kolkataMidnightToUtc(year, month, day) {
  // Construct UTC timestamp representing IST midnight:
  // Date.UTC(year, month - 1, day, 0, 0, 0) minus 5 hours 30 minutes (19,800,000 ms)
  const istMidnightEpoch = Date.UTC(year, month - 1, day, 0, 0, 0, 0) - (5.5 * 60 * 60 * 1000);
  return new Date(istMidnightEpoch).toISOString();
}

/**
 * Calculates start and end timestamps (ISO UTC strings) for a given filter.
 *
 * @param {"today"|"week"|"month"|"overall"} filter
 * @param {Date} [referenceDate]
 * @returns {{ filter: string, startDate: string|null, endDate: string }}
 */
export function getKolkataDateRange(filter = "today", referenceDate = new Date()) {
  const normFilter = VALID_DATE_FILTERS.includes(filter) ? filter : "today";
  const nowUtc = referenceDate.toISOString();

  if (normFilter === "overall") {
    return {
      filter: "overall",
      startDate: null,
      endDate: nowUtc,
    };
  }

  const { year, month, day, dayOfWeek } = getKolkataComponents(referenceDate);

  if (normFilter === "today") {
    const startDate = kolkataMidnightToUtc(year, month, day);
    return { filter: "today", startDate, endDate: nowUtc };
  }

  if (normFilter === "month") {
    const startDate = kolkataMidnightToUtc(year, month, 1);
    return { filter: "month", startDate, endDate: nowUtc };
  }

  if (normFilter === "week") {
    // Week starts on Monday.
    // Sunday (0) -> 6 days back
    // Monday (1) -> 0 days back
    // Tuesday (2) -> 1 day back ... Saturday (6) -> 5 days back
    const daysSinceMonday = (dayOfWeek + 6) % 7;
    
    // We can compute the Monday date by rolling back days in UTC math safely
    const currentDayIstEpoch = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
    const mondayIstEpoch = currentDayIstEpoch - (daysSinceMonday * 24 * 60 * 60 * 1000);
    const mondayDate = new Date(mondayIstEpoch);

    const mondayYear = mondayDate.getUTCFullYear();
    const mondayMonth = mondayDate.getUTCMonth() + 1;
    const mondayDay = mondayDate.getUTCDate();

    const startDate = kolkataMidnightToUtc(mondayYear, mondayMonth, mondayDay);
    return { filter: "week", startDate, endDate: nowUtc };
  }

  return { filter: "today", startDate: kolkataMidnightToUtc(year, month, day), endDate: nowUtc };
}

/**
 * Aggregates raw event records into structured analytics metrics.
 *
 * Keeps distinct metrics separate:
 * - card_visits: Landing page visits via /r/[cardCode]
 * - page_views: Standalone assistant pageviews via /review/c/[cardCode]
 * - drafts_generated: Review draft generations
 * - drafts_copied: Successful clipboard copies
 * - google_clicks: Outbound Google Review clicks
 *
 * Conversion rates:
 * - review_intent_rate: (google_clicks / page_views) * 100
 * - draft_copy_rate: (drafts_copied / drafts_generated) * 100
 *
 * @param {Array<{ event_type: string, card_code?: string, created_at?: string }>} events
 * @returns {object}
 */
export function aggregateAnalyticsEvents(events = []) {
  const counts = {
    card_visits: 0,
    page_views: 0,
    drafts_generated: 0,
    drafts_copied: 0,
    google_clicks: 0,
  };

  const byCard = {};

  for (const ev of events) {
    const type = ev.event_type;
    if (type === "card_visit") counts.card_visits++;
    else if (type === "page_view") counts.page_views++;
    else if (type === "draft_generated") counts.drafts_generated++;
    else if (type === "draft_copied") counts.drafts_copied++;
    else if (type === "google_click") counts.google_clicks++;

    if (ev.card_code) {
      const code = ev.card_code;
      if (!byCard[code]) {
        byCard[code] = {
          card_code: code,
          card_visits: 0,
          page_views: 0,
          drafts_generated: 0,
          drafts_copied: 0,
          google_clicks: 0,
        };
      }
      if (type === "card_visit") byCard[code].card_visits++;
      else if (type === "page_view") byCard[code].page_views++;
      else if (type === "draft_generated") byCard[code].drafts_generated++;
      else if (type === "draft_copied") byCard[code].drafts_copied++;
      else if (type === "google_click") byCard[code].google_clicks++;
    }
  }

  // Calculate conversion rates safely
  const pageViews = counts.page_views;
  const draftsGen = counts.drafts_generated;
  const googleClicks = counts.google_clicks;
  const draftsCopied = counts.drafts_copied;

  const reviewIntentRate = pageViews > 0 ? Number(((googleClicks / pageViews) * 100).toFixed(1)) : 0;
  const draftCopyRate = draftsGen > 0 ? Number(((draftsCopied / draftsGen) * 100).toFixed(1)) : 0;

  return {
    totals: counts,
    rates: {
      review_intent_rate: reviewIntentRate, // % of visitors who proceeded to Google Review
      draft_copy_rate: draftCopyRate,       // % of generated drafts that got copied
    },
    by_card: byCard,
  };
}
