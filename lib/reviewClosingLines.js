/**
 * NFCISTA Review Closing Lines — Natural, Optional Endings
 *
 * Provides curated, rating-appropriate closing sentences across 4 languages:
 * - English (en)
 * - Hindi Devanagari (hi)
 * - Hinglish Romanized Gender-Neutral (hinglish)
 * - Marathi Devanagari (mr)
 *
 * Rules:
 * - Strictly OPTIONAL: Defaults to "none" (no closing line added automatically).
 * - Ratings 4–5: Pleasant experience, happy with purchase, visit again, recommendation suggestions.
 * - Ratings 1–3: Strictly neutral/constructive endings. NEVER suggest praise or recommendations.
 * - Hinglish phrases are 100% gender-neutral.
 * - Pure data & helper functions — no browser/network dependencies.
 */

export const CLOSING_SUGGESTIONS = {
  high: [
    {
      id: "high_pleasant",
      text: {
        en: "Overall, I had a pleasant experience.",
        hi: "कुल मिलाकर, यहाँ का अनुभव काफी सुखद रहा।",
        hinglish: "Overall, yahan ka experience kaafi pleasant laga.",
        mr: "एकंदरीत, इथला अनुभव अतिशय सुखद आणि समाधानकारक राहिला.",
      },
    },
    {
      id: "high_happy_purchase",
      text: {
        en: "I'm happy with my purchase.",
        hi: "मैं अपनी इस खरीदारी से काफी संतुष्ट हूँ।",
        hinglish: "Main apni is purchase se kaafi satisfied hoon.",
        mr: "मी माझ्या या खरेदीबद्दल पूर्णपणे समाधानी आहे.",
      },
    },
    {
      id: "high_guidance",
      text: {
        en: "I appreciated the help and guidance.",
        hi: "यहाँ मिले सहयोग और मार्गदर्शन की मैं सराहना करता हूँ।",
        hinglish: "Yahan mila helpful support aur guidance kaafi achha laga.",
        mr: "इथे मिळालेल्या सहकार्याबद्दल आणि मार्गदर्शनाबद्दल मनापासून आभार.",
      },
    },
    {
      id: "high_visit_again",
      text: {
        en: "I'd be happy to visit again.",
        hi: "यहाँ दोबारा आने में मुझे बेहद खुशी होगी।",
        hinglish: "Yahan dobara aane mein kaafi khushi hogi.",
        mr: "इथे पुन्हा नक्की भेट द्यायला मला नक्कीच आवडेल.",
      },
    },
    {
      id: "high_recommend",
      text: {
        en: "I'd recommend checking this place out.",
        hi: "मैं यहाँ आने का सुझाव जरूर देना चाहूँगा।",
        hinglish: "Is jagah ko zaroor explore karne ka man banta hai.",
        mr: "या ठिकाणी एकदा नक्की भेट देण्याचा सल्ला मी आवर्जून देईन.",
      },
    },
  ],
  low: [
    {
      id: "low_overall_experience",
      text: {
        en: "Overall, this was my experience.",
        hi: "कुल मिलाकर, मेरा अनुभव ऐसा ही रहा।",
        hinglish: "Overall, mera experience kuch aisa hi dekhne ko mila.",
        mr: "एकंदरीत, माझा अनुभव असाच काहीसा राहिला.",
      },
    },
    {
      id: "low_feedback_helpful",
      text: {
        en: "I hope my feedback is helpful.",
        hi: "उम्मीद है कि यह फीडबैक उपयोगी साबित होगा।",
        hinglish: "Umeed hai ki yeh feedback helpful saabit hoga.",
        mr: "माझा हा अभिप्राय उपयुक्त ठरेल अशी आशा वाटते.",
      },
    },
    {
      id: "low_room_improvement",
      text: {
        en: "I hope there is room for improvement.",
        hi: "उम्मीद है कि भविष्य में सेवा में सुधार देखने को मिलेगा।",
        hinglish: "Umeed hai ki aage chal kar service mein improvement dekhne ko milega.",
        mr: "पुढील काळात सेवेत नक्कीच सुधारणा होईल अशी आशा आहे.",
      },
    },
    {
      id: "low_share_honestly",
      text: {
        en: "I wanted to share my experience honestly.",
        hi: "मैं केवल अपना सच्चा अनुभव यहाँ साझा करना चाहता था।",
        hinglish: "Bas apna genuine experience transparently share karna chaha.",
        mr: "मी फक्त माझा खरा आणि प्रामाणिक अनुभव मांडत आहे.",
      },
    },
  ],
};

/**
 * Returns available closing line suggestions for a given rating, language, and seed.
 *
 * @param {object} params
 * @param {number|null} params.rating - 1-5 or null
 * @param {string} params.lang - "en" | "hi" | "hinglish" | "mr"
 * @param {number} [params.seed] - optional deterministic seed for controlled ordering
 * @returns {Array<{ id: string, text: string }>}
 */
export function getClosingSuggestions({ rating = null, lang = "en", seed = 0 } = {}) {
  const normLang = ["en", "hi", "hinglish", "mr"].includes(lang) ? lang : "en";
  const numRating = Number(rating);
  const isHighRating = Number.isInteger(numRating) && numRating >= 4;

  const list = isHighRating ? CLOSING_SUGGESTIONS.high : CLOSING_SUGGESTIONS.low;

  // Extract text for active language
  const mapped = list.map((item) => ({
    id: item.id,
    text: item.text[normLang] || item.text.en,
  }));

  // Controlled variation based on seed (deterministic rotation so options don't jitter during typing)
  if (seed && mapped.length > 1) {
    const shift = Math.abs(Number(seed)) % mapped.length;
    return [...mapped.slice(shift), ...mapped.slice(0, shift)];
  }

  return mapped;
}

/**
 * Cleanly attaches or swaps a closing line on a review draft without duplication.
 *
 * @param {string} currentDraft - Existing review draft text
 * @param {string} newClosing - The new closing sentence to apply
 * @param {string} [prevClosing] - The previously applied closing sentence to replace
 * @returns {string} Updated draft
 */
export function applyClosingLine(currentDraft = "", newClosing = "", prevClosing = "") {
  let text = typeof currentDraft === "string" ? currentDraft.trim() : "";
  const cleanNew = typeof newClosing === "string" ? newClosing.trim() : "";
  const cleanPrev = typeof prevClosing === "string" ? prevClosing.trim() : "";

  // If no new closing line, just remove the previous closing line if present
  if (!cleanNew) {
    if (cleanPrev) {
      return removeClosingLine(text, cleanPrev);
    }
    return text;
  }

  // 1. Remove previously applied closing line if it exists at the end of the text
  if (cleanPrev && text.endsWith(cleanPrev)) {
    text = text.slice(0, -cleanPrev.length).trim();
  }

  // 2. Prevent duplicate if the text already contains or ends with the new closing line
  if (text.includes(cleanNew)) {
    return text;
  }

  // 3. Append the new closing line with proper spacing and punctuation
  if (!text) {
    return cleanNew;
  }

  // Ensure previous sentence ends with proper punctuation
  if (!/[.!?।]$/.test(text)) {
    text = `${text}.`;
  }

  return `${text} ${cleanNew}`;
}

/**
 * Cleanly removes a closing line from the end of a review draft.
 *
 * @param {string} currentDraft - Existing review draft
 * @param {string} closingToRemove - The closing sentence to strip
 * @returns {string} Updated draft
 */
export function removeClosingLine(currentDraft = "", closingToRemove = "") {
  let text = typeof currentDraft === "string" ? currentDraft.trim() : "";
  const cleanRemove = typeof closingToRemove === "string" ? closingToRemove.trim() : "";

  if (!cleanRemove || !text) {
    return text;
  }

  if (text.endsWith(cleanRemove)) {
    return text.slice(0, -cleanRemove.length).trim();
  }

  return text;
}
