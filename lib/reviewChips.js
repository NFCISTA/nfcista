/**
 * NFCISTA Review Assistant — Industry Chip Sets
 *
 * Each chip object:
 *   id         {string}   — unique identifier
 *   label      {string}   — customer-facing button label
 *   sentiment  {string}   — "positive" | "negative"
 *   phrases_en {string[]} — 3–5 English phrase variants
 *   phrases_hi {string[]} — 3–5 gender-neutral Hinglish phrase variants
 *
 * Rules:
 * - Every industry set MUST contain negative chips.
 * - Hinglish phrases MUST be strictly gender-neutral:
 *   NO aaya/aayi, tha/thi, karunga/karungi, raha/rahi, gaya/gayi, aaunga/aaungi.
 * - Pure data file — no side effects, no browser APIs, no imports.
 */

// ─── Generic chips (fallback & universal options) ──────────────────────────

export const GENERIC_CHIPS = [
  {
    id: "gen_friendly",
    label: "Friendly staff",
    sentiment: "positive",
    phrases_en: [
      "The staff was very friendly and welcoming.",
      "Staff members were warm and genuinely helpful.",
      "Great attitude and polite behavior from the staff.",
      "Very welcoming and pleasant team.",
    ],
    phrases_hi: [
      "Staff kaafi friendly aur polite mila.",
      "Staff ka behavior bahut helpful aur cooperative mila.",
      "Sabhi log kaafi welcoming lage.",
      "Staff ka attitude kaafi pleasant mila.",
    ],
  },
  {
    id: "gen_quick",
    label: "Quick service",
    sentiment: "positive",
    phrases_en: [
      "Quick and efficient service.",
      "Very fast turnaround without unnecessary delays.",
      "Appreciated the prompt and speedy service.",
      "Everything was handled quickly and smoothly.",
    ],
    phrases_hi: [
      "Service kaafi fast aur smooth mili.",
      "Bina delay ke turant kaam hua.",
      "Kaafi prompt aur efficient service mili.",
      "Speed aur handling kaafi achhi lagi.",
    ],
  },
  {
    id: "gen_clean",
    label: "Clean",
    sentiment: "positive",
    phrases_en: [
      "The premises were very clean and neat.",
      "Excellent hygiene and cleanliness maintained.",
      "Everything looked spotless and well organized.",
      "Clean, tidy, and comfortable environment.",
    ],
    phrases_hi: [
      "Jagah bilkul clean aur hygienic mili.",
      "Cleanliness aur hygiene ka achha dhyan mila.",
      "Sab kuch organized aur saaf mila.",
      "Environment kaafi neat aur comfortable laga.",
    ],
  },
  {
    id: "gen_quality",
    label: "Good quality",
    sentiment: "positive",
    phrases_en: [
      "The overall quality of work was top-notch.",
      "Really impressed with the high standard of work.",
      "Consistent quality and great attention to detail.",
      "Work quality exceeded expectations.",
    ],
    phrases_hi: [
      "Kaam ki quality top-notch mili.",
      "High standards aur achhi quality dekhne ko mili.",
      "Detailing aur finishing kaafi impressive lagi.",
      "Quality expectations se behtar lagi.",
    ],
  },
  {
    id: "gen_price",
    label: "Fair price",
    sentiment: "positive",
    phrases_en: [
      "Fair and reasonable pricing for the service.",
      "Great value for money.",
      "Worth every rupee spent.",
      "Very honest and transparent pricing.",
    ],
    phrases_hi: [
      "Pricing bilkul fair aur reasonable lagi.",
      "Value for money experience mila.",
      "Keemat ke hisaab se poora paisa vasool laga.",
      "Pricing transparent aur justified mili.",
    ],
  },
  {
    id: "gen_wait",
    label: "Long wait",
    sentiment: "negative",
    phrases_en: [
      "Wait time was longer than expected.",
      "Had to wait quite a while before being attended to.",
      "Waiting time could definitely be reduced.",
      "Service was delayed and slow.",
    ],
    phrases_hi: [
      "Intezaar expected se zyada karna pada.",
      "Turn aane mein kaafi waqt laga.",
      "Wait time kam karne ki zaroorat lagti hai.",
      "Service mein thoda delay mehsoos hua.",
    ],
  },
  {
    id: "gen_staff_improve",
    label: "Staff could improve",
    sentiment: "negative",
    phrases_en: [
      "Staff behavior could be more polite and attentive.",
      "Customer service needs improvement.",
      "Expected a more professional approach from the staff.",
      "Handling from the team could be better.",
    ],
    phrases_hi: [
      "Staff coordination aur behavior improve ho sakta hai.",
      "Customer service mein betterment chahiye.",
      "Staff se aur professional behavior expect kiya.",
      "Team communication behtar ho sakti hai.",
    ],
  },
  {
    id: "gen_pricey",
    label: "Pricey",
    sentiment: "negative",
    phrases_en: [
      "Pricing felt on the higher side.",
      "A bit pricey for what was offered.",
      "Could offer better value for money.",
      "Costs felt somewhat steep.",
    ],
    phrases_hi: [
      "Prices thode zyada lage.",
      "Di hui service ke muqable cost high lagi.",
      "Paison ke hisaab se value thodi kam lagi.",
      "Pricing thodi steep mehsoos hui.",
    ],
  },
];

// ─── Salon chips ────────────────────────────────────────────────────────────

export const SALON_CHIPS = [
  {
    id: "salon_skilled",
    label: "Skilled stylist",
    sentiment: "positive",
    phrases_en: [
      "The stylist was very skilled and talented.",
      "Really happy with how the styling turned out.",
      "Excellent styling — understood exactly what was needed.",
      "Great haircut and styling skills.",
    ],
    phrases_hi: [
      "Stylist kaafi skilled aur experienced mila.",
      "Styling ka result kaafi pasand laga.",
      "Stylist ne bilkul sahi style create kiya.",
      "Haircut aur styling ka kaam top-notch laga.",
    ],
  },
  {
    id: "salon_trendy",
    label: "Trendy styles",
    sentiment: "positive",
    phrases_en: [
      "Great modern vibe and trendy styling options.",
      "Very up-to-date with current hair and grooming trends.",
      "Loved the contemporary styles and modern setup.",
      "Fresh, trendy looks executed with care.",
    ],
    phrases_hi: [
      "Salon ka setup kaafi trendy aur modern laga.",
      "Latest styles aur grooming trends follow karte hain.",
      "Ambiance kaafi contemporary aur stylish mila.",
      "Modern looks aur styling kaafi achhi mili.",
    ],
  },
  {
    id: "salon_hygienic",
    label: "Clean & hygienic",
    sentiment: "positive",
    phrases_en: [
      "Very clean, sanitized equipment and towels.",
      "Maintains top-tier hygiene and cleanliness.",
      "Clean, comfortable chairs and stations.",
      "Impressed with the hygiene standards followed here.",
    ],
    phrases_hi: [
      "Tools aur towels bilkul clean aur sanitize mile.",
      "Hygiene standards kaafi impressive lage.",
      "Stations aur chairs bilkul saaf mile.",
      "Cleanliness aur care kaafi achhi lagi.",
    ],
  },
  {
    id: "salon_wait",
    label: "Long waiting time",
    sentiment: "negative",
    phrases_en: [
      "Had to wait quite a while even with an appointment.",
      "The waiting time before getting attended to was too long.",
      "Appointment scheduling needs better management.",
      "Long queue and slow pace of service.",
    ],
    phrases_hi: [
      "Appointment ke baad bhi kaafi wait karna pada.",
      "Service shuru hone mein lamba intezaar mila.",
      "Time management better hone ki zaroorat lagti hai.",
      "Wait time expected se kaafi zyada laga.",
    ],
  },
  {
    id: "salon_rushed",
    label: "Rushed service",
    sentiment: "negative",
    phrases_en: [
      "The service felt somewhat rushed.",
      "Felt like the stylist was hurrying through the cut.",
      "Could have taken more time and attention on details.",
      "The service lacked careful finishing due to haste.",
    ],
    phrases_hi: [
      "Service thodi jaldbazi mein hui mehsoos hui.",
      "Styling mein thoda aur dhyan dena chahiye.",
      "Finishing aur detailing thodi rushed lagi.",
      "Jaldi khatam karne ki wajah se detailing miss hui.",
    ],
  },
];

// ─── Restaurant chips ───────────────────────────────────────────────────────

export const RESTAURANT_CHIPS = [
  {
    id: "rest_delicious",
    label: "Delicious food",
    sentiment: "positive",
    phrases_en: [
      "The food was absolutely delicious.",
      "Great taste and balanced seasoning throughout.",
      "Really enjoyed the flavors of every dish.",
      "Delicious meal with authentic flavors.",
    ],
    phrases_hi: [
      "Khana bahut tasty aur swadisht laga.",
      "Har dish ka taste aur flavor perfect mila.",
      "Taste kaafi lajawab aur fresh mila.",
      "Flavors bilkul balanced aur authentic lage.",
    ],
  },
  {
    id: "rest_fresh",
    label: "Fresh ingredients",
    sentiment: "positive",
    phrases_en: [
      "Ingredients were clearly fresh and quality-made.",
      "Everything tasted fresh and well prepared.",
      "Appreciated the freshness of the ingredients used.",
      "Crisp, fresh, and high-quality preparations.",
    ],
    phrases_hi: [
      "Khane mein fresh ingredients ka swad mila.",
      "Sab kuch bilkul fresh aur well prepared laga.",
      "Freshness aur quality clearly notice hui.",
      "Ingredients high quality aur fresh lage.",
    ],
  },
  {
    id: "rest_ambiance",
    label: "Great ambiance",
    sentiment: "positive",
    phrases_en: [
      "The ambiance was warm, cozy, and inviting.",
      "Loved the seating comfort and pleasant decor.",
      "Great atmosphere for dining with friends or family.",
      "Very pleasing music and relaxing dining vibe.",
    ],
    phrases_hi: [
      "Ambiance kaafi pleasant aur welcoming laga.",
      "Decor aur seating comfort kaafi badhiya mila.",
      "Family aur friends ke saath dining ke liye achha vibe hai.",
      "Mahaul peaceful aur comfortable laga.",
    ],
  },
  {
    id: "rest_portions",
    label: "Good portions",
    sentiment: "positive",
    phrases_en: [
      "Generous portion sizes that satisfy well.",
      "Good quantity for the price charged.",
      "Serving sizes were hearty and fulfilling.",
      "Very satisfying portions all around.",
    ],
    phrases_hi: [
      "Portion sizes kaafi generous aur satisfying mile.",
      "Price ke hisaab se quantity kaafi achhi mili.",
      "Serving size pet bharne layak aur satisfying laga.",
      "Portions bilkul fulfilling lage.",
    ],
  },
  {
    id: "rest_bland",
    label: "Bland food",
    sentiment: "negative",
    phrases_en: [
      "The food lacked flavor and felt rather bland.",
      "Needed more seasoning and authentic taste.",
      "Taste was underwhelming compared to expectations.",
      "Dishes could use more depth and better spices.",
    ],
    phrases_hi: [
      "Khane mein taste thoda fika laga.",
      "Flavors aur seasoning thodi kam mehsoos hui.",
      "Taste expectations ke hisaab se thoda weak laga.",
      "Spices aur seasoning better hone ki zaroorat hai.",
    ],
  },
  {
    id: "rest_slow",
    label: "Slow service",
    sentiment: "negative",
    phrases_en: [
      "Service was quite slow and took long to arrive.",
      "Food took a very long time to reach the table.",
      "Waiters were slow to respond to requests.",
      "Kitchen turnaround time could definitely improve.",
    ],
    phrases_hi: [
      "Order serve hone mein kaafi time laga.",
      "Service speed thodi slow mehsoos hui.",
      "Table par food aane mein lamba wait mila.",
      "Kitchen speed aur service fast honi chahiye.",
    ],
  },
  {
    id: "rest_cold",
    label: "Cold food served",
    sentiment: "negative",
    phrases_en: [
      "The dishes arrived lukewarm or cold.",
      "Food should have been served hotter.",
      "Cold food took away from the dining experience.",
      "Temperature of the dishes was not hot enough.",
    ],
    phrases_hi: [
      "Khana garam serve nahi hua.",
      "Dishes thandi serve hone se maza kam hua.",
      "Food fresh aur hot serve hona chahiye.",
      "Temperature proper na hone se experience effect hua.",
    ],
  },
];

// ─── Clinic chips ───────────────────────────────────────────────────────────

export const CLINIC_CHIPS = [
  {
    id: "clinic_attentive",
    label: "Attentive doctor",
    sentiment: "positive",
    phrases_en: [
      "The doctor listened very attentively to all concerns.",
      "Very patient and understanding during the consultation.",
      "Explained the diagnosis clearly without rushing.",
      "Felt genuinely heard and well taken care of.",
    ],
    phrases_hi: [
      "Doctor ne sabhi baatein dhyan se suni.",
      "Consultation ke dauran kaafi patience dekhne ko mila.",
      "Diagnosis kaafi clearly aur simply explain kiya.",
      "Caring aur attentive consultation mila.",
    ],
  },
  {
    id: "clinic_thorough",
    label: "Thorough check-up",
    sentiment: "positive",
    phrases_en: [
      "Very thorough examination and accurate guidance.",
      "Complete and careful check-up from start to finish.",
      "Addressed root causes with proper medical explanation.",
      "Detailed assessment and trustworthy medical advice.",
    ],
    phrases_hi: [
      "Check-up kaafi thorough aur detailed mila.",
      "Proper guidance aur diagnosis mila.",
      "Medical advice trustworthy aur clear lagi.",
      "Step-by-step examination kaafi satisfying laga.",
    ],
  },
  {
    id: "clinic_clean",
    label: "Clean facility",
    sentiment: "positive",
    phrases_en: [
      "The clinic was very clean, quiet, and hygienic.",
      "High standards of medical sanitation maintained.",
      "Neat waiting area and well-maintained chambers.",
      "Clean, orderly, and comfortable clinical setup.",
    ],
    phrases_hi: [
      "Clinic ka setup bilkul clean aur hygienic mila.",
      "Sanitation aur cleanliness ka achha level mila.",
      "Waiting area neat aur comfortable laga.",
      "Hygienic aur peaceful clinic environment mila.",
    ],
  },
  {
    id: "clinic_punctual",
    label: "Minimal wait",
    sentiment: "positive",
    phrases_en: [
      "Minimal wait time — appointment started right on schedule.",
      "Appreciated the punctual schedule and timely consultation.",
      "No unnecessary waiting; very well organized.",
      "Prompt consultation without long queue delays.",
    ],
    phrases_hi: [
      "Appointment time par consultation shuru hua.",
      "Punctuality kaafi achhi mili, bina delay consultation hua.",
      "Bina zyada intezaar ke doctor se milna hua.",
      "Schedule management kaafi organized laga.",
    ],
  },
  {
    id: "clinic_rushed",
    label: "Felt rushed",
    sentiment: "negative",
    phrases_en: [
      "The consultation felt a bit rushed.",
      "Wished the doctor took more time to address questions.",
      "The visit ended too quickly without full explanations.",
      "Could have used a more relaxed and detailed discussion.",
    ],
    phrases_hi: [
      "Consultation thoda rushed aur jaldi mein laga.",
      "Doubts clear karne ke liye thoda aur time chahiye.",
      "Questions discuss karne mein thodi jaldi mehsoos hui.",
      "Doctor se aur detail discussion expect kiya.",
    ],
  },
  {
    id: "clinic_wait",
    label: "Long waiting time",
    sentiment: "negative",
    phrases_en: [
      "Waited a very long time past the appointment slot.",
      "Waiting area was crowded and delays were significant.",
      "Queue management could be much better.",
      "Extremely long wait before being called in.",
    ],
    phrases_hi: [
      "Appointment time ke baad bhi lamba wait mila.",
      "Waiting area mein delay kaafi zyada laga.",
      "Queue management better hone ki zaroorat hai.",
      "Consultation ke liye kaafi der intezaar karna pada.",
    ],
  },
];

// ─── Retail chips ───────────────────────────────────────────────────────────

export const RETAIL_CHIPS = [
  {
    id: "retail_variety",
    label: "Good variety",
    sentiment: "positive",
    phrases_en: [
      "Great variety of products to choose from.",
      "Impressive range of items in stock.",
      "Lots of good choices and diverse product selection.",
      "Found multiple great options matching my needs.",
    ],
    phrases_hi: [
      "Products ki kaafi wide variety dekhne ko mila.",
      "Kaafi achha aur diverse collection mila.",
      "Har category mein kaafi options available lage.",
      "Variety aur options kaafi impressive lage.",
    ],
  },
  {
    id: "retail_staff",
    label: "Helpful staff",
    sentiment: "positive",
    phrases_en: [
      "Staff was very helpful in locating items.",
      "Knowledgeable and polite customer assistance.",
      "Sales team helped patiently throughout the shopping.",
      "Great support and recommendations from staff.",
    ],
    phrases_hi: [
      "Staff ne items dhundhne mein kaafi help ki.",
      "Sales team kaafi polite aur supportive lagi.",
      "Helpful staff ki wajah se shopping kaafi easy hui.",
      "Staff guidance aur recommendations helpful lage.",
    ],
  },
  {
    id: "retail_quality",
    label: "Quality products",
    sentiment: "positive",
    phrases_en: [
      "Products were of genuine and high quality.",
      "Authentic merchandise that looks durable.",
      "Very satisfied with the quality of purchases.",
      "Great build quality and finish on items.",
    ],
    phrases_hi: [
      "Products genuine aur high quality ke lage.",
      "Purchased items ki quality top-class mili.",
      "Finishing aur durability kaafi achhi lagi.",
      "Quality standards bilkul reliable lage.",
    ],
  },
  {
    id: "retail_easy",
    label: "Easy to find items",
    sentiment: "positive",
    phrases_en: [
      "Store is well organized and easy to navigate.",
      "Neat aisle displays make finding products effortless.",
      "Clean, clearly marked sections throughout the store.",
      "Smooth shopping experience with well-arranged shelves.",
    ],
    phrases_hi: [
      "Store ka arrangement neat aur well organized mila.",
      "Sections clearly marked hone se items easily mile.",
      "Aisle layout simple aur navigation convenient laga.",
      "Shopping experience kaafi easy aur systematic mila.",
    ],
  },
  {
    id: "retail_pricey",
    label: "Pricey",
    sentiment: "negative",
    phrases_en: [
      "Prices felt a bit higher compared to market rates.",
      "Some items felt overpriced for what they offer.",
      "Would appreciate more competitive price tags.",
      "Slightly on the expensive side.",
    ],
    phrases_hi: [
      "Market ke muqable prices thode high lage.",
      "Kuch items thode overpriced mehsoos hue.",
      "Pricing thodi zyada competitive honi chahiye.",
      "Cost thodi steep lagi.",
    ],
  },
  {
    id: "retail_stock",
    label: "Out of stock items",
    sentiment: "negative",
    phrases_en: [
      "A few required items were out of stock.",
      "Inventory availability could be better managed.",
      "Popular items were unavailable on the shelves.",
      "Missing sizes or models during the visit.",
    ],
    phrases_hi: [
      "Kuch zaroori items stock mein available nahi mile.",
      "Inventory availability improve hone ki zaroorat hai.",
      "Popular sizes ya models shelves par missing the.",
      "Stock availability par dhyan dena chahiye.",
    ],
  },
];

// ─── Flat chip lookup map ───────────────────────────────────────────────────

const ALL_CHIPS_MAP = {};
[
  ...GENERIC_CHIPS,
  ...SALON_CHIPS,
  ...RESTAURANT_CHIPS,
  ...CLINIC_CHIPS,
  ...RETAIL_CHIPS,
].forEach((chip) => {
  ALL_CHIPS_MAP[chip.id] = chip;
});

/**
 * Look up a chip by its id.
 *
 * @param {string} id
 * @returns {object|null}
 */
export function findChip(id) {
  return ALL_CHIPS_MAP[id] || null;
}

// ─── Industry keyword → chip set mapping ───────────────────────────────────

const CATEGORY_MAP = [
  {
    keys: [
      "salon", "saloon", "hair", "barber", "barbershop",
      "beauty", "parlour", "parlor", "spa", "nail",
      "makeup", "grooming", "stylist",
    ],
    chips: SALON_CHIPS,
    industry: "salon",
  },
  {
    keys: [
      "restaurant", "cafe", "café", "bakery", "food",
      "eatery", "dhaba", "diner", "bistro", "kitchen",
      "canteen", "caterer", "catering", "tiffin",
      "pizza", "burger", "snack", "mess",
    ],
    chips: RESTAURANT_CHIPS,
    industry: "restaurant",
  },
  {
    keys: [
      "clinic", "doctor", "dentist", "dental", "medical",
      "hospital", "physio", "physiotherapy", "health",
      "pharmacy", "therapist", "optometrist", "eye",
      "ortho", "pediatric", "paediatric", "gynecologist",
      "ayurveda", "homeopath", "diagnostic",
    ],
    chips: CLINIC_CHIPS,
    industry: "clinic",
  },
  {
    keys: [
      "shop", "retail", "store", "fashion", "clothing",
      "apparel", "electronics", "gadget", "hardware",
      "jewellery", "jewelry", "boutique", "grocery",
      "supermarket", "mart", "kirana", "showroom",
      "furniture", "stationery",
    ],
    chips: RETAIL_CHIPS,
    industry: "retail",
  },
];

/**
 * Returns the appropriate chip set for a given business category string.
 * Falls back to GENERIC_CHIPS when no industry keyword matches.
 *
 * @param {string|null|undefined} category - The business's category field value
 * @returns {{ industry: string, chips: object[] }}
 */
export function getCategoryChips(category) {
  if (!category || typeof category !== "string") {
    return { industry: "generic", chips: GENERIC_CHIPS };
  }
  const lower = category.toLowerCase();
  for (const entry of CATEGORY_MAP) {
    if (entry.keys.some((key) => lower.includes(key))) {
      return { industry: entry.industry, chips: entry.chips };
    }
  }
  return { industry: "generic", chips: GENERIC_CHIPS };
}
