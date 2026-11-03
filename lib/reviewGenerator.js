/**
 * NFCISTA Pure Template-Based Review Generator
 *
 * Runs 100% locally in browser memory.
 * - Zero external API calls (no OpenAI, no Gemini, no LLMs).
 * - Zero client storage or browser global dependencies.
 * - Zero network calls or database dependencies.
 * - Pure function: deterministic for the same seed, no side effects.
 *
 * Supports:
 * - 4 Languages: 'en' (English), 'hi' (हिन्दी), 'hinglish' (Hinglish), 'mr' (मराठी).
 * - 4 Natural Writing Styles: 'concise', 'balanced', 'enthusiastic', 'professional'.
 * - Reflects ONLY customer-selected experiences (anti-gating & authenticity compliance).
 *
 * @param {object} params
 * @param {number|null} [params.rating]     - Star rating (1–5) or null
 * @param {string[]}    [params.chipIds]    - Array of selected chip IDs
 * @param {string}      [params.product]    - Optional product/service text
 * @param {string}      [params.note]       - Optional customer freeform note
 * @param {string}      [params.recommend]  - "yes" | "no" | "maybe" | null
 * @param {string}      [params.lang]       - "en" | "hi" | "hinglish" | "mr" (defaults to "en")
 * @param {string}      [params.style]      - "concise" | "balanced" | "enthusiastic" | "professional" (defaults to "balanced")
 * @param {number}      [params.seed]       - Seed number for deterministic variation
 * @returns {string|null} Generated review text, or null if insufficient input
 */

import { findChip } from "./reviewChips.js";

/**
 * Deterministically pick an element from an array using seed and offset.
 */
function pickVariant(variants, seed, offset = 0) {
  if (!Array.isArray(variants) || variants.length === 0) return "";
  const s = Math.abs(Math.floor(Number(seed) || 0) + offset * 7919);
  return variants[s % variants.length];
}

/**
 * Ensures a sentence ends with standard punctuation.
 * Uses '।' for Devanagari (Hindi and Marathi) and '.' for Latin scripts (English and Hinglish).
 */
function punctuate(sentence, lang = "en") {
  const trimmed = (sentence || "").trim();
  if (!trimmed) return "";
  if (/[.!?।]$/.test(trimmed)) return trimmed;
  if (lang === "hi" || lang === "mr") {
    return `${trimmed}।`;
  }
  return `${trimmed}.`;
}

/**
 * Normalizes input language code to one of: 'en', 'hi', 'hinglish', 'mr'.
 */
function normalizeLang(lang) {
  const l = String(lang || "en").trim().toLowerCase();
  if (l === "hi" || l === "hindi") return "hi";
  if (l === "hinglish") return "hinglish";
  if (l === "mr" || l === "marathi") return "mr";
  return "en";
}

/**
 * Normalizes input style code to one of: 'concise', 'balanced', 'enthusiastic', 'professional'.
 */
function normalizeStyle(style) {
  const s = String(style || "balanced").trim().toLowerCase();
  if (s === "concise" || s === "enthusiastic" || s === "professional") return s;
  return "balanced";
}

/**
 * Retrieves the appropriate phrase array for a chip based on target language.
 */
function getChipPhraseVariants(chip, lang) {
  if (!chip) return [];
  if (lang === "hi") {
    if (Array.isArray(chip.phrases_hindi) && chip.phrases_hindi.length > 0) return chip.phrases_hindi;
    if (Array.isArray(chip.phrases_hi) && chip.phrases_hi.length > 0) return chip.phrases_hi;
  } else if (lang === "hinglish") {
    if (Array.isArray(chip.phrases_hinglish) && chip.phrases_hinglish.length > 0) return chip.phrases_hinglish;
    if (Array.isArray(chip.phrases_hi) && chip.phrases_hi.length > 0) return chip.phrases_hi;
  } else if (lang === "mr") {
    if (Array.isArray(chip.phrases_mr) && chip.phrases_mr.length > 0) return chip.phrases_mr;
  }
  return Array.isArray(chip.phrases_en) ? chip.phrases_en : [];
}

// ─── Product introductory phrases ───────────────────────────────────────────

const PRODUCT_PHRASES = {
  en: [
    (p) => `Visited for their ${p}.`,
    (p) => `Came in for ${p}.`,
    (p) => `Had their ${p}.`,
    (p) => `Tried their ${p}.`,
  ],
  hinglish: [
    (p) => `${p} ke liye visit kiya.`,
    (p) => `${p} service li.`,
    (p) => `${p} ke liye yahan aana hua.`,
    (p) => `${p} try kiya.`,
  ],
  hi: [
    (p) => `${p} के लिए यहाँ आना हुआ।`,
    (p) => `${p} की सर्विस ली।`,
    (p) => `${p} के लिए विज़िट किया।`,
    (p) => `${p} की सुविधा का उपयोग किया।`,
  ],
  mr: [
    (p) => `${p} साठी इथे भेट दिली.`,
    (p) => `${p} ची सेवा घेतली.`,
    (p) => `${p} साठी इथे येणे झाले.`,
    (p) => `${p} चा अनुभव घेतला.`,
  ],
};

// ─── Rating remarks ─────────────────────────────────────────────────────────

const RATING_REMARKS = {
  en: {
    5: [
      "Definitely a 5-star experience.",
      "Deserves a full 5-star rating.",
      "5-star experience all the way.",
    ],
    4: [
      "Overall a solid 4-star experience.",
      "Worth a well-deserved 4 stars.",
      "A very good 4-star visit.",
    ],
    3: [
      "A fair 3-star experience overall.",
      "Decent 3-star visit with room for improvement.",
      "Giving 3 stars.",
    ],
    2: [
      "A 2-star experience with several areas to improve.",
      "Found it to be a 2-star visit.",
      "Giving 2 stars.",
    ],
    1: [
      "A disappointing 1-star experience.",
      "Only 1 star due to the issues faced.",
      "Expected much better — 1 star.",
    ],
  },
  hinglish: {
    5: [
      "Poore 5 star rating banta hai.",
      "5 star experience mila.",
      "Bilkul 5 star rating ke layak laga.",
    ],
    4: [
      "Overall 4 star experience mila.",
      "4 star rating banta hai.",
      "Achha 4 star experience laga.",
    ],
    3: [
      "Overall 3 star experience laga.",
      "3 star rating theek lagti hai.",
      "Decent 3 star visit laga.",
    ],
    2: [
      "Experience 2 star level ka laga.",
      "Sudhar ki zaroorat hai — 2 star rating banta hai.",
      "2 star experience mila.",
    ],
    1: [
      "Disappointing 1 star experience mila.",
      "Umeed se kaafi kam laga — 1 star rating banta hai.",
      "Kaafi issues mile, 1 star laga.",
    ],
  },
  hi: {
    5: [
      "पूरे 5 स्टार का अनुभव रहा।",
      "यह अनुभव पूरे 5 स्टार रेटिंग का हकदार है।",
      "शुरुआत से अंत तक 5-स्टार अनुभव मिला।",
    ],
    4: [
      "कुल मिलाकर एक बढ़िया 4 स्टार अनुभव रहा।",
      "4 स्टार रेटिंग के पूरी तरह योग्य लगा।",
      "काफी अच्छा 4-स्टार विजिट रहा।",
    ],
    3: [
      "औसत 3 स्टार का अनुभव रहा।",
      "3 स्टार का ठीक-ठाक अनुभव, सुधार की गुंजाइश है।",
      "3 स्टार रेटिंग देना उचित रहेगा।",
    ],
    2: [
      "2 स्टार का अनुभव रहा, कई क्षेत्रों में सुधार की जरूरत है।",
      "उम्मीद से कम रहा — 2 स्टार अनुभव।",
      "2 स्टार रेटिंग के योग्य लगा।",
    ],
    1: [
      "काफी निराशाजनक 1 स्टार अनुभव रहा।",
      "समस्याओं के कारण सिर्फ 1 स्टार।",
      "अपेक्षा से काफी कम रहा — 1 स्टार।",
    ],
  },
  mr: {
    5: [
      "नक्कीच पूर्ण ५ स्टार देण्यासारखा अनुभव राहिला.",
      "५ स्टार रेटिंगसाठी पूर्णपणे पात्र अनुभव मिळाला.",
      "सर्व बाबतीत ५ स्टार दर्जाचा अनुभव आला.",
    ],
    4: [
      "एकूण एक चांगला ४ स्टार अनुभव राहिला.",
      "४ स्टार रेटिंग मिळण्यास पूर्णपणे योग्य वाटले.",
      "अतिशय छान ४ स्टार भेट ठरली.",
    ],
    3: [
      "एकूण ३ स्टार देण्यासारखा बरा अनुभव राहिला.",
      "३ स्टार अनुभव, सुधारणेला वाव आहे.",
      "३ स्टार रेटिंग देणे योग्य वाटते.",
    ],
    2: [
      "२ स्टार दर्जाचा अनुभव राहिला, सुधारणेची बरीच गरज आहे.",
      "अपेक्षेपेक्षा कमी — २ स्टार अनुभव.",
      "२ स्टार रेटिंग देणे योग्य वाटते.",
    ],
    1: [
      "अतिशय निराशाजनक १ स्टार अनुभव राहिला.",
      "समस्यांमुळे केवळ १ स्टार देणे भाग पडले.",
      "अपेक्षेपेक्षा फारच कमी — १ स्टार.",
    ],
  },
};

// ─── Recommendation phrases ─────────────────────────────────────────────────

const RECOMMEND_PHRASES = {
  en: {
    yes: [
      "Would definitely recommend.",
      "Happy to recommend to others.",
      "Highly recommended.",
    ],
    no: [
      "Would not recommend based on this visit.",
      "Cannot recommend at this time.",
      "Do not recommend based on this experience.",
    ],
    maybe: [
      "Mixed feelings on recommending.",
      "Decent overall, though experiences may vary.",
    ],
  },
  hinglish: {
    yes: [
      "Zaroor recommend karne layak hai.",
      "Auron ko bhi recommend kiya ja sakta hai.",
      "Recommend karne jaisa laga.",
    ],
    no: [
      "Filhal recommend karna mushkil lagta hai.",
      "Is visit ke hisaab se recommend karna theek nahi lagta.",
      "Abhi ke liye recommend nahi kiya ja sakta.",
    ],
    maybe: [
      "Thoda mixed experience laga.",
      "Experience theek laga par mixed views hain.",
    ],
  },
  hi: {
    yes: [
      "दूसरों को भी यहाँ आने की सिफारिश करेंगे।",
      "निश्चित रूप से यहाँ की सेवा लेने की सलाह दी जा सकती है।",
      "सभी के लिए पूरी तरह अनुशंसित।",
    ],
    no: [
      "इस अनुभव के आधार पर सिफारिश करना कठिन है।",
      "फिलहाल यहाँ की सलाह देना उचित नहीं लगता।",
      "इस बार के अनुभव से सिफारिश नहीं की जा सकती।",
    ],
    maybe: [
      "सिफारिश को लेकर मिलाजुला अनुभव रहा।",
      "कुल मिलाकर ठीक, हालांकि व्यक्तिगत अनुभव भिन्न हो सकते हैं।",
    ],
  },
  mr: {
    yes: [
      "इतरांनाही नक्कीच इथे येण्याची शिफारस करेन.",
      "नक्कीच शिफारस करण्यासारखा उत्तम अनुभव लाभला.",
      "सर्वांसाठी पूर्णपणे शिफारसपात्र.",
    ],
    no: [
      "या अनुभवावरून शिफारस करणे कठीण वाटते.",
      "सध्या तरी इथे जाण्याचा सल्ला देणे योग्य वाटत नाही.",
      "या भेटीच्या अनुभवावरून शिफारस केली जाऊ शकत नाही.",
    ],
    maybe: [
      "शिफारस करण्याबाबत संमिश्र अनुभव राहिला.",
      "एकूण ठीक अनुभव, प्रत्येकाचा अनुभव वेगळा असू शकतो.",
    ],
  },
};

// ─── Style Openers & Connectors ─────────────────────────────────────────────

const CHIP_CONNECTORS = {
  en: [
    (p) => `Also, ${p.charAt(0).toLowerCase() + p.slice(1)}`,
    (p) => `Additionally, ${p.charAt(0).toLowerCase() + p.slice(1)}`,
    (p) => `On top of that, ${p.charAt(0).toLowerCase() + p.slice(1)}`,
    (p) => p,
  ],
  hinglish: [
    (p) => `Saath hi, ${p.charAt(0).toLowerCase() + p.slice(1)}`,
    (p) => `Iske alawa, ${p.charAt(0).toLowerCase() + p.slice(1)}`,
    (p) => p,
  ],
  hi: [
    (p) => `इसके साथ ही, ${p}`,
    (p) => `साथ ही, ${p}`,
    (p) => p,
  ],
  mr: [
    (p) => `त्याचबरोबर, ${p}`,
    (p) => `याशिवाय, ${p}`,
    (p) => p,
  ],
};

const ENTHUSIASTIC_INTROS = {
  en: [
    "Really great visit!",
    "Had a truly wonderful experience here!",
    "So pleased with the experience here!",
    "Really loved the experience here!",
    "Such a pleasant and wonderful visit!",
  ],
  hinglish: [
    "Yahan ka experience sach mein kaafi badhiya laga!",
    "Bohot hi accha experience mila yahan!",
    "Overall kaafi positive aur shandaar visit dekhne ko mili!",
    "Yahan visit karke kaafi khushi mili!",
  ],
  hi: [
    "यहाँ का अनुभव सच में बहुत ही शानदार रहा!",
    "बहुत ही बढ़िया और सुखद विज़िट रही!",
    "यहाँ आकर मन बहुत प्रसन्न हुआ!",
    "अनुभव बहुत ही सुखद और यादगार रहा!",
  ],
  mr: [
    "इथला अनुभव खरोखरच अतिशय उत्तम राहिला!",
    "फारच छान आणि समाधानकारक भेट ठरली!",
    "इथे येऊन मनस्वी आनंद आणि समाधान वाटले!",
    "अतिशय सुखद आणि आनंददायी अनुभव आला!",
  ],
};

const PROFESSIONAL_INTROS = {
  en: [
    "The services provided were of a commendable professional standard.",
    "The overall engagement was conducted with high diligence and professionalism.",
    "Very professional conduct and reliable service standards throughout.",
    "Impressed by the structured execution and professional diligence.",
  ],
  hinglish: [
    "Yahan ka professional approach aur service handling kaafi commendable mila.",
    "Systematic standards aur disciplined service dekhne ko mili.",
    "Professional conduct aur clear communication kaafi impressive laga.",
  ],
  hi: [
    "यहाँ की कार्यप्रणाली और सेवा का स्तर अत्यंत पेशेवर और सराहनीय रहा।",
    "उच्च मानकों और अनुशासन के साथ सेवा प्रदान की गई।",
    "पेशेवर दृष्टिकोण और उत्कृष्ट कार्यकुशलता देखने को मिली।",
  ],
  mr: [
    "इथली कार्यपद्धती आणि व्यावसायिकता अतिशय कौतुकास्पद आढळली.",
    "अत्यंत शिस्तबद्ध आणि उच्च दर्जाची सेवा अनुभवता आली.",
    "उत्कृष्ट व्यावसायिकता आणि विश्वासार्ह कामकाज पाहायला मिळाले.",
  ],
};

// ─── Main Generator ─────────────────────────────────────────────────────────

export function generateReview({
  rating = null,
  chipIds = [],
  product = "",
  note = "",
  recommend = "",
  lang = "en",
  style = "balanced",
  seed = 0,
} = {}) {
  const normLang = normalizeLang(lang);
  const normStyle = normalizeStyle(style);
  const numSeed = Number(seed) || 0;

  const validChips = Array.isArray(chipIds)
    ? chipIds.map((id) => findChip(id)).filter(Boolean)
    : [];

  const cleanNote = typeof note === "string" ? note.trim() : "";
  const cleanProduct = typeof product === "string" ? product.trim() : "";
  const cleanRecommend = typeof recommend === "string" ? recommend.trim().toLowerCase() : "";
  const numRating =
    Number.isInteger(Number(rating)) && Number(rating) >= 1 && Number(rating) <= 5
      ? Number(rating)
      : null;

  // 1. Minimum input check:
  // Must have at least one useful piece of feedback:
  // chips OR note OR (recommend && rating) OR (rating && validChips.length)
  // Product alone is NOT sufficient feedback to generate a review.
  const hasUsefulInput =
    validChips.length > 0 ||
    cleanNote.length > 0 ||
    (numRating !== null && (cleanRecommend.length > 0 || cleanProduct.length > 0)) ||
    cleanRecommend.length > 0;

  if (!hasUsefulInput) {
    return null;
  }

  const sentences = [];
  let offsetCounter = 0;

  // Determine positive/negative sentiment from chips and ratings
  const hasNegativeChip = validChips.some((c) => c.sentiment === "negative");
  const hasPositiveChip = validChips.some((c) => c.sentiment === "positive" || !c.sentiment);

  // Safeguard 1 & 2:
  // - Ratings 1–3 are NEVER positive.
  // - 4–5 star rating alone without positive chips must NOT generate unsupported praise about quality or staff.
  const isPositiveRating =
    (numRating === 4 || numRating === 5) || (numRating === null && hasPositiveChip && !hasNegativeChip);
  const isNegativeOrNeutralRating = numRating !== null && numRating <= 3;

  // ── Style: Enthusiastic Intro (ONLY when supported by positive chips AND not a 1–3 star rating) ──
  if (
    normStyle === "enthusiastic" &&
    isPositiveRating &&
    !isNegativeOrNeutralRating &&
    hasPositiveChip
  ) {
    const intros = ENTHUSIASTIC_INTROS[normLang] || ENTHUSIASTIC_INTROS.en;
    const introText = pickVariant(intros, numSeed, offsetCounter++);
    if (introText) {
      sentences.push(punctuate(introText, normLang));
    }
  }

  // ── Style: Professional Intro (ONLY when supported by positive chips AND not a 1–3 star rating) ──
  // Safeguards 2 & 5: When no positive chips are selected, generate neutral wording without unsupported claims.
  if (
    normStyle === "professional" &&
    isPositiveRating &&
    !isNegativeOrNeutralRating &&
    hasPositiveChip
  ) {
    const intros = PROFESSIONAL_INTROS[normLang] || PROFESSIONAL_INTROS.en;
    const introText = pickVariant(intros, numSeed, offsetCounter++);
    if (introText) {
      sentences.push(punctuate(introText, normLang));
    }
  }

  // 2. Product sentence (if provided)
  // Product is strictly lowercased ONLY when inserted into the sentence
  if (cleanProduct) {
    const lowerProduct = cleanProduct.toLowerCase();
    const productTemplates = PRODUCT_PHRASES[normLang] || PRODUCT_PHRASES.en;
    const fn = pickVariant(productTemplates, numSeed, offsetCounter++);
    if (typeof fn === "function") {
      sentences.push(punctuate(fn(lowerProduct), normLang));
    }
  }

  // 3. Chip phrases (in customer selection order)
  // For 'concise' style, limit to max 2 salient chips to keep it brief
  const chipsToInclude = normStyle === "concise" ? validChips.slice(0, 2) : validChips;

  chipsToInclude.forEach((chip, index) => {
    const variants = getChipPhraseVariants(chip, normLang);
    let phrase = pickVariant(variants, numSeed, offsetCounter++);
    if (!phrase) return;

    // Apply natural connector for subsequent chips in non-concise styles
    if (index > 0 && normStyle !== "concise") {
      const connectors = CHIP_CONNECTORS[normLang] || CHIP_CONNECTORS.en;
      const connectorFn = pickVariant(connectors, numSeed, offsetCounter++);
      if (typeof connectorFn === "function") {
        phrase = connectorFn(phrase);
      }
    }

    sentences.push(punctuate(phrase, normLang));
  });

  // 4. Rating remark (if provided)
  if (numRating !== null) {
    // In concise style, skip rating sentence if we already have chip and product, unless rating is 5 or 1
    const shouldIncludeRating =
      normStyle !== "concise" || sentences.length <= 1 || numRating === 5 || numRating === 1;

    if (shouldIncludeRating) {
      const remarkDict = RATING_REMARKS[normLang] || RATING_REMARKS.en;
      const variants = remarkDict[numRating] || [];
      const remark = pickVariant(variants, numSeed, offsetCounter++);
      if (remark) {
        sentences.push(punctuate(remark, normLang));
      }
    }
  }

  // 5. Customer's genuine note (Safeguard 4: unmodified meaning, punctuation ensured)
  if (cleanNote) {
    sentences.push(punctuate(cleanNote, normLang));
  }

  // 6. Recommendation remark
  // Safeguards 1 & 3:
  // - A 1–3 star rating must NEVER trigger positive recommendation.
  // - Add recommendation only when supported or explicitly requested.
  if (cleanRecommend) {
    let normRec = null;
    if (cleanRecommend === "yes" || cleanRecommend === "definitely" || cleanRecommend === "true") {
      // 1-3 star rating strictly blocks positive recommendations
      if (!isNegativeOrNeutralRating) {
        normRec = "yes";
      }
    } else if (cleanRecommend === "no" || cleanRecommend === "false") {
      normRec = "no";
    } else if (cleanRecommend === "maybe") {
      normRec = "maybe";
    }

    if (normRec) {
      const recDict = RECOMMEND_PHRASES[normLang] || RECOMMEND_PHRASES.en;
      const variants = recDict[normRec] || [];
      const recText = pickVariant(variants, numSeed, offsetCounter++);
      if (recText) {
        sentences.push(punctuate(recText, normLang));
      }
    }
  }

  if (sentences.length === 0) {
    return null;
  }

  return sentences.join(" ");
}
