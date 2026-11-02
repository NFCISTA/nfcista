/**
 * NFCISTA Review Assistant — Industry Chip Sets
 *
 * Each chip object:
 *   id               {string}   — unique identifier
 *   label            {string}   — customer-facing English button label
 *   sentiment        {string}   — "positive" | "negative"
 *   phrases_en       {string[]} — 3–5 English phrase variants
 *   phrases_hi       {string[]} — 3–5 gender-neutral Hinglish phrase variants (backward compatibility)
 *   phrases_hindi    {string[]} — 3–5 gender-neutral pure Hindi phrase variants (Devanagari: हिन्दी)
 *   phrases_hinglish {string[]} — 3–5 gender-neutral Hinglish phrase variants (Roman script)
 *   phrases_mr       {string[]} — 3–5 gender-neutral Marathi phrase variants (Devanagari: मराठी)
 *
 * Rules:
 * - Every industry set MUST contain negative chips.
 * - Hinglish, Hindi, and Marathi phrases MUST be strictly gender-neutral:
 *   NO aaya/aayi, tha/thi, karunga/karungi, raha/rahi, gaya/gayi, aaunga/aaungi.
 * - Pure data file — no side effects, no browser APIs, no imports.
 */

// ─── 1. Generic Chips (Fallback & Universal) ────────────────────────────────

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
    phrases_hinglish: [
      "Staff kaafi friendly aur polite mila.",
      "Staff ka behavior bahut helpful aur cooperative mila.",
      "Sabhi log kaafi welcoming lage.",
      "Staff ka attitude kaafi pleasant mila.",
    ],
    phrases_hindi: [
      "स्टाफ का व्यवहार बहुत विनम्र और मददगार रहा।",
      "यहाँ के कर्मचारी काफी सहयोगी और शालीन मिले।",
      "स्टाफ की तरफ से बहुत अच्छा और सकारात्मक बर्ताव मिला।",
      "सभी कर्मचारी काफी स्वागतयोग्य और विनम्र रहे।",
    ],
    phrases_mr: [
      "इथला कर्मचारी वर्ग अतिशय नम्र आणि मदत करणारा आढळला.",
      "कर्मचाऱ्यांचे वर्तन आपुलकीचे आणि सहकार्याचे होते.",
      "सर्व कर्मचाऱ्यांकडून अतिशय चांगला अनुभव मिळाला.",
      "अतिशय स्वागतशील आणि तत्पर कर्मचारी वर्ग लाभला.",
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
    phrases_hinglish: [
      "Service kaafi fast aur smooth mili.",
      "Bina delay ke turant kaam hua.",
      "Kaafi prompt aur efficient service mili.",
      "Speed aur handling kaafi achhi lagi.",
    ],
    phrases_hindi: [
      "यहाँ की सर्विस काफी तेज और सुगम रही।",
      "बिना किसी देरी के तुरंत और सुचारू रूप से काम पूरा हुआ।",
      "समय की पाबंदी और त्वरित सेवा काफी सराहनीय लगी।",
      "सर्विस की गति और कार्यप्रणाली बहुत बढ़िया रही।",
    ],
    phrases_mr: [
      "सेवा अतिशय जलद आणि कार्यक्षम मिळाली.",
      "कोणत्याही विलंबाशिवाय काम वेळेत आणि सुरळीत पार पडले.",
      "तत्पर आणि वेगवान सेवेमुळे खूप समाधान वाटले.",
      "कामाचा वेग आणि व्यवस्थापन अतिशय उत्तम राहिले.",
    ],
  },
  {
    id: "gen_clean",
    label: "Clean & neat",
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
    phrases_hinglish: [
      "Jagah bilkul clean aur hygienic mili.",
      "Cleanliness aur hygiene ka achha dhyan mila.",
      "Sab kuch organized aur saaf mila.",
      "Environment kaafi neat aur comfortable laga.",
    ],
    phrases_hindi: [
      "परिसर पूरी तरह साफ-सुथरा और व्यवस्थित मिला।",
      "स्वच्छता और हाइजीन का बहुत अच्छा ध्यान रखा गया।",
      "साफ-सफाई और अनुशासन काफी प्रभावशाली रहा।",
      "शांत, स्वच्छ और आरामदायक वातावरण मिला।",
    ],
    phrases_mr: [
      "परिसर अतिशय स्वच्छ, टापटिप्प आणि प्रसन्न आढळला.",
      "स्वच्छता आणि नीटनेटकेपणाची उत्तम काळजी घेतली गेली.",
      "सर्व व्यवस्था अतिशय व्यवस्थित आणि स्वच्छ दिसली.",
      "स्वच्छ आणि आरामदायी वातावरण अनुभवता आले.",
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
    phrases_hinglish: [
      "Kaam ki quality top-notch mili.",
      "High standards aur achhi quality dekhne ko mili.",
      "Detailing aur finishing kaafi impressive lagi.",
      "Quality expectations se behtar lagi.",
    ],
    phrases_hindi: [
      "काम की गुणवत्ता बहुत ही उच्च स्तर की रही।",
      "हर काम में बारीकी और उत्तम फिनिशिंग देखने को मिली।",
      "गुणवत्ता के मानकों पर पूरी तरह खरा उतरा।",
      "काम का स्तर अपेक्षा से अधिक बेहतरीन रहा।",
    ],
    phrases_mr: [
      "कामाचा एकूण दर्जा अतिशय उत्कृष्ट राहिला.",
      "कामातील अचूकता आणि बारकावे पाहून समाधान वाटले.",
      "दर्जेदार काम आणि उच्च मानके राखली गेली.",
      "कामाची गुणवत्ता अपेक्षेपेक्षाही चांगली अनुभवली.",
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
    phrases_hinglish: [
      "Pricing bilkul fair aur reasonable lagi.",
      "Value for money experience mila.",
      "Keemat ke hisaab se poora paisa vasool laga.",
      "Pricing transparent aur justified mili.",
    ],
    phrases_hindi: [
      "सेवा के हिसाब से दरें बिल्कुल वाजिब और उचित रहीं।",
      "पैसे के बदले बहुत ही मूल्यवान अनुभव मिला।",
      "प्राइसिंग पूरी तरह पारदर्शी और न्यायसंगत रही।",
      "उचित दरों में बेहतरीन सेवा प्राप्त हुई।",
    ],
    phrases_mr: [
      "सेवेच्या तुलनेत दर अतिशय योग्य आणि रास्त वाटले.",
      "खर्चाच्या मानाने अतिशय मोलाचा अनुभव मिळाला.",
      "दर पूर्णपणे पारदर्शक आणि योग्य आढळले.",
      "वाजवी दरात दर्जेदार सेवेचा लाभ झाला.",
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
    phrases_hinglish: [
      "Intezaar expected se zyada karna pada.",
      "Turn aane mein kaafi waqt laga.",
      "Wait time kam karne ki zaroorat lagti hai.",
      "Service mein thoda delay mehsoos hua.",
    ],
    phrases_hindi: [
      "इंतजार का समय अपेक्षा से अधिक रहा।",
      "बारी आने में काफी समय लग गया।",
      "वेटिंग टाइम कम करने की आवश्यकता महसूस हुई।",
      "सर्विस में कुछ देरी का सामना करना पड़ा।",
    ],
    phrases_mr: [
      "प्रतीक्षा वेळ अपेक्षेपेक्षा जास्त लागला.",
      "नंबर येण्यासाठी बराच वेळ थांबावे लागले.",
      "प्रतीक्षेचा वेळ कमी करणे आवश्यक वाटते.",
      "सेवेमध्ये काही प्रमाणात विलंब जाणवला.",
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
    phrases_hinglish: [
      "Staff coordination aur behavior improve ho sakta hai.",
      "Customer service mein betterment chahiye.",
      "Staff se aur professional behavior expect kiya.",
      "Team communication behtar ho sakti hai.",
    ],
    phrases_hindi: [
      "स्टाफ के व्यवहार और तालमेल में सुधार की गुंजाइश है।",
      "कस्टमर सर्विस को और अधिक विनम्र बनाने की आवश्यकता है।",
      "स्टाफ से और अधिक पेशेवर रुख की अपेक्षा रही।",
      "टीम की बातचीत और सहयोग और बेहतर हो सकता है।",
    ],
    phrases_mr: [
      "कर्मचाऱ्यांच्या वागणुकीत आणि संवादात सुधारणा हवी.",
      "ग्राहक सेवेचा दर्जा आणखी वाढवणे गरजेचे आहे.",
      "कर्मचाऱ्यांकडून अधिक व्यावसायिक दृष्टिकोन अपेक्षित होता.",
      "कामातील समन्वय अधिक चांगला असायला हवा.",
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
    phrases_hinglish: [
      "Prices thode zyada lage.",
      "Di hui service ke muqable cost high lagi.",
      "Paison ke hisaab se value thodi kam lagi.",
      "Pricing thodi steep mehsoos hui.",
    ],
    phrases_hindi: [
      "कीमतें थोड़ी अधिक महसूस हुईं।",
      "दी गई सेवा के मुकाबले खर्च कुछ ज्यादा लगा।",
      "मूल्य के हिसाब से दरों में थोड़ी रियायत होनी चाहिए।",
      "दरें बाजार की तुलना में कुछ अधिक लगीं।",
    ],
    phrases_mr: [
      "दर थोडे जास्त असल्याचे जाणवले.",
      "मिळालेल्या सेवेच्या तुलनेत खर्च अधिक वाटला.",
      "दरांमध्ये अधिक वाजवीपणा असणे गरजेचे वाटते.",
      "खर्च अपेक्षेपेक्षा काहीसा जास्त वाटला.",
    ],
  },
];

// ─── 2. Salon Chips ─────────────────────────────────────────────────────────

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
    phrases_hinglish: [
      "Stylist kaafi skilled aur experienced mila.",
      "Styling ka result kaafi pasand laga.",
      "Stylist ne bilkul sahi style create kiya.",
      "Haircut aur styling ka kaam top-notch laga.",
    ],
    phrases_hindi: [
      "हेयर स्टाइलिस्ट काफी अनुभवी और कुशल रहे।",
      "स्टाइलिंग का परिणाम पूरी तरह मनपसंद मिला।",
      "स्टाइलिस्ट ने जरूरत को समझकर बिल्कुल सही लुक दिया।",
      "हेयरकट और ग्रूमिंग का काम बेहद सराहनीय रहा।",
    ],
    phrases_mr: [
      "हेअर स्टायलिस्ट अतिशय कुशल आणि अनुभवी आढळले.",
      "स्टायलिंगचे काम अतिशय मनासारखे झाले.",
      "अपेक्षेनुसार योग्य हेअरकट आणि स्टाईल मिळाली.",
      "कामातील कौशल्य आणि सफाई खूप आवडली.",
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
    phrases_hinglish: [
      "Salon ka setup kaafi trendy aur modern laga.",
      "Latest styles aur grooming trends follow karte hain.",
      "Ambiance kaafi contemporary aur stylish mila.",
      "Modern looks aur styling kaafi achhi mili.",
    ],
    phrases_hindi: [
      "सैलून का माहौल काफी आधुनिक और ट्रेंडी रहा।",
      "नवीनतम फैशन और ग्रूमिंग ट्रेंड्स की अच्छी समझ देखने को मिली।",
      "मॉडर्न लुक और स्टाइलिंग बहुत ही खूबसूरती से की गई।",
      "स्टाइलिंग ऑप्शन्स नए और काफी आकर्षक रहे।",
    ],
    phrases_mr: [
      "सलूनमधील वातावरण अतिशय आधुनिक आणि ट्रेंडी वाटले.",
      "नवीनतम हेअर आणि ग्रूमिंग ट्रेंड्सची उत्तम माहिती दिसली.",
      "स्टायलिश आणि आधुनिक लूकचे उत्तम काम झाले.",
      "नव्या ट्रेंडनुसार केलेली स्टाईल खूप आवडली.",
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
    phrases_hinglish: [
      "Tools aur towels bilkul clean aur sanitize mile.",
      "Hygiene standards kaafi impressive lage.",
      "Stations aur chairs bilkul saaf mile.",
      "Cleanliness aur care kaafi achhi lagi.",
    ],
    phrases_hindi: [
      "उपकरण और तौलिए पूरी तरह सैनिटाइज और साफ मिले।",
      "सैलून में स्वच्छता और हाइजीन का पूरा ध्यान रखा गया।",
      "स्टेशन्स और सिटिंग चेयर्स काफी साफ-सुथरी रहीं।",
      "सफाई के उच्च मानकों से पूरा संतोष मिला।",
    ],
    phrases_mr: [
      "साहित्य आणि टॉवेल्स पूर्णपणे स्वच्छ आणि निर्जंतुक आढळले.",
      "स्वच्छता आणि आरोग्याची सर्वोच्च काळजी घेतली गेली.",
      "सर्व खुर्च्या आणि स्टेशन्स अत्यंत स्वच्छ होते.",
      "स्वच्छतेच्या चांगल्या नियमांमुळे सुरक्षित वाटले.",
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
    phrases_hinglish: [
      "Appointment ke baad bhi kaafi wait karna pada.",
      "Service shuru hone mein lamba intezaar mila.",
      "Time management better hone ki zaroorat lagti hai.",
      "Wait time expected se kaafi zyada laga.",
    ],
    phrases_hindi: [
      "अपॉइंटमेंट होने के बावजूद काफी देर इंतजार करना पड़ा।",
      "सर्विस शुरू होने में जरूरत से ज्यादा समय लग गया।",
      "समय प्रबंधन और कतार नियंत्रण में सुधार की आवश्यकता है।",
      "वेटिंग टाइम अपेक्षा से अधिक लंबा रहा।",
    ],
    phrases_mr: [
      "अपॉइंटमेंट असूनही बराच वेळ प्रतीक्षा करावी लागली.",
      "सेवा सुरू होण्यास जास्त वेळ लागला.",
      "वेळेचे नियोजन अधिक चांगले होण्याची गरज आहे.",
      "प्रतीक्षा वेळ खूप जास्त वाटला.",
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
    phrases_hinglish: [
      "Service thodi jaldbazi mein hui mehsoos hui.",
      "Styling mein thoda aur dhyan dena chahiye.",
      "Finishing aur detailing thodi rushed lagi.",
      "Jaldi khatam karne ki wajah se detailing miss hui.",
    ],
    phrases_hindi: [
      "सर्विस में कुछ जल्दबाजी महसूस हुई।",
      "बारीकियों और फिनिशिंग पर थोड़ा और समय दिया जाना चाहिए था।",
      "जल्दी खत्म करने की वजह से कुछ डिटेल्स छूट गईं।",
      "काम में थोड़ा और धैर्य अपेक्षित रहा।",
    ],
    phrases_mr: [
      "सेवेमध्ये काहीशी घाईगडबड जाणवली.",
      "स्टायलिंग करताना अधिक बारकाईने लक्ष द्यायला हवे होते.",
      "घाईमुळे फिनिशिंग व्यवस्थित झाले नाही असे वाटले.",
      "कामात अधिक संयम आणि काळजी अपेक्षित होती.",
    ],
  },
];

// ─── 3. Restaurant & Cafe Chips ─────────────────────────────────────────────

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
    phrases_hinglish: [
      "Khana bahut tasty aur swadisht laga.",
      "Har dish ka taste aur flavor perfect mila.",
      "Taste kaafi lajawab aur fresh mila.",
      "Flavors bilkul balanced aur authentic lage.",
    ],
    phrases_hindi: [
      "खाना बेहद स्वादिष्ट और लजीज रहा।",
      "मसालों और स्वाद का संतुलन बहुत ही बेहतरीन मिला।",
      "हर एक व्यंजन का स्वाद लाजवाब और ताजा रहा।",
      "पारंपरिक और प्रामाणिक स्वाद का पूरा आनंद मिला।",
    ],
    phrases_mr: [
      "जेवण अतिशय चवदार आणि रुचकर होते.",
      "प्रत्येक पदार्थाची चव आणि मसाल्यांचे प्रमाण उत्तम होते.",
      "अन्न अतिशय ताजे आणि स्वादिष्ट वाटले.",
      "अस्सल चव आणि दर्जेदार जेवणाचा आनंद मिळाला.",
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
    phrases_hinglish: [
      "Khane mein fresh ingredients ka swad mila.",
      "Sab kuch bilkul fresh aur well prepared laga.",
      "Freshness aur quality clearly notice hui.",
      "Ingredients high quality aur fresh lage.",
    ],
    phrases_hindi: [
      "व्यंजनों में ताजी और शुद्ध सामग्री का स्वाद स्पष्ट महसूस हुआ।",
      "सब कुछ बहुत ही ताजा और अच्छे से तैयार किया गया मिला।",
      "सामग्री की गुणवत्ता और ताजगी बहुत ही बढ़िया रही।",
      "ताजे और उत्तम दर्जे के खाने का अनुभव मिला।",
    ],
    phrases_mr: [
      "जेवणात वापरलेले साहित्य पूर्णपणे ताजे आणि चांगल्या दर्जाचे होते.",
      "पदार्थ अगदी ताजेतवाने आणि नीट तयार केलेले होते.",
      "साहित्याचा ताजेपणा स्पष्टपणे जाणवला.",
      "उत्कृष्ट दर्जाचे आणि ताजे अन्न मिळाले.",
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
    phrases_hinglish: [
      "Ambiance kaafi pleasant aur welcoming laga.",
      "Decor aur seating comfort kaafi badhiya mila.",
      "Family aur friends ke saath dining ke liye achha vibe hai.",
      "Mahaul peaceful aur comfortable laga.",
    ],
    phrases_hindi: [
      "रेस्टोरेंट का माहौल बहुत ही सुखद और मनमोहक रहा।",
      "सजावट और बैठने की व्यवस्था बेहद आरामदायक रही।",
      "परिवार और दोस्तों के साथ भोजन के लिए बहुत अच्छा माहौल है।",
      "धीमा संगीत और शांत वातावरण काफी पसंद आया।",
    ],
    phrases_mr: [
      "हॉटेलमधील वातावरण अतिशय प्रसन्न आणि आरामदायक होते.",
      "बैठक व्यवस्था आणि अंतर्गत सजावट खूप छान होती.",
      "कुटुंब किंवा मित्रांसोबत जेवणासाठी अतिशय योग्य जागा आहे.",
      "शांत संगीत आणि आल्हाददायक वातावरणामुळे जेवणाचा आनंद वाढला.",
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
    phrases_hinglish: [
      "Portion sizes kaafi generous aur satisfying mile.",
      "Price ke hisaab se quantity kaafi achhi mili.",
      "Serving size pet bharne layak aur satisfying laga.",
      "Portions bilkul fulfilling lage.",
    ],
    phrases_hindi: [
      "व्यंजनों की मात्रा काफी पर्याप्त और संतोषजनक रही।",
      "कीमत के अनुसार सर्विंग साइज बहुत अच्छा मिला।",
      "मात्रा इतनी रही कि पूरी तरह पेट भर जाए।",
      "क्वांटिटी और क्वालिटी दोनों में पूरा संतुलन दिखा।",
    ],
    phrases_mr: [
      "पदार्थांचे प्रमाण अतिशय समाधानकारक आणि पुरेसे होते.",
      "दराच्या तुलनेत अन्नाचे प्रमाण खूप चांगले मिळाले.",
      "पोटभर आणि समाधान देणारे प्रमाण होते.",
      "दर्जा आणि प्रमाण दोन्हीही योग्य वाटले.",
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
    phrases_hinglish: [
      "Khane mein taste thoda fika laga.",
      "Flavors aur seasoning thodi kam mehsoos hui.",
      "Taste expectations ke hisaab se thoda weak laga.",
      "Spices aur seasoning better hone ki zaroorat hai.",
    ],
    phrases_hindi: [
      "खाने में स्वाद कुछ फीका महसूस हुआ।",
      "मसालों और प्रामाणिक स्वाद की कुछ कमी लगी।",
      "स्वाद अपेक्षा के अनुरूप उतना खास नहीं रहा।",
      "व्यंजनों में मसालों का संतुलन और बेहतर होना चाहिए।",
    ],
    phrases_mr: [
      "जेवणात चव थोडी अळणी किंवा कमी वाटली.",
      "मसाल्यांचे प्रमाण आणि चव अपेक्षेनुसार जमली नाही.",
      "अन्नाची चव अपेक्षेपेक्षा काहीशी फिकी जाणवली.",
      "चवीमध्ये अधिक सुधारणा करण्याची गरज वाटते.",
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
    phrases_hinglish: [
      "Order serve hone mein kaafi time laga.",
      "Service speed thodi slow mehsoos hui.",
      "Table par food aane mein lamba wait mila.",
      "Kitchen speed aur service fast honi chahiye.",
    ],
    phrases_hindi: [
      "ऑर्डर टेबल पर आने में काफी लंबा समय लग गया।",
      "सर्विस की गति थोड़ी धीमी महसूस हुई।",
      "स्टाफ का रिस्पॉन्स टाइम कुछ धीमा रहा।",
      "किचन और सर्विस के बीच तालमेल और तेज होना चाहिए।",
    ],
    phrases_mr: [
      "ऑर्डर मिळण्यास बराच वेळ लागला.",
      "सेवेचा वेग थोडा संथ जाणवला.",
      "टेबलावर जेवण येण्यासाठी जास्त वाट पाहावी लागली.",
      "ऑर्डर देण्याच्या वेळेत सुधारणा होणे गरजेचे आहे.",
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
    phrases_hinglish: [
      "Khana garam serve nahi hua.",
      "Dishes thandi serve hone se maza kam hua.",
      "Food fresh aur hot serve hona chahiye.",
      "Temperature proper na hone se experience effect hua.",
    ],
    phrases_hindi: [
      "खाना सही तापमान पर गर्म सर्व नहीं किया गया।",
      "व्यंजन ठंडे आने से खाने का स्वाद प्रभावित हुआ।",
      "खाना गरमा-गरम परोसा जाना चाहिए था।",
      "सर्विंग के समय खाने का तापमान उचित नहीं रहा।",
    ],
    phrases_mr: [
      "जेवण गरम वाढले गेले नाही.",
      "पदार्थ थंड आल्यामुळे चवीचा आनंद कमी झाला.",
      "अन्न गरमागरम मिळणे अपेक्षित होते.",
      "जेवणाचे तापमान योग्य नव्हते.",
    ],
  },
];

// ─── 4. Clinic & Healthcare Chips ───────────────────────────────────────────

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
    phrases_hinglish: [
      "Doctor ne sabhi baatein dhyan se suni.",
      "Consultation ke dauran kaafi patience dekhne ko mila.",
      "Diagnosis kaafi clearly aur simply explain kiya.",
      "Caring aur attentive consultation mila.",
    ],
    phrases_hindi: [
      "डॉक्टर ने सभी परेशानियों को बहुत ध्यान और धैर्य से सुना।",
      "परामर्श के दौरान बीमारी और समाधान को सरलता से समझाया गया।",
      "डॉक्टर का व्यवहार अत्यंत संवेदनशील और सहयोगी रहा।",
      "सही मार्गदर्शन और तसल्ली से परामर्श प्राप्त हुआ।",
    ],
    phrases_mr: [
      "डॉक्टरांनी सर्व तक्रारी अतिशय काळजीपूर्वक आणि शांतपणे ऐकून घेतल्या.",
      "तपासणीदरम्यान आजाराचे निदान सोप्या भाषेत समजावून सांगितले.",
      "अतिशय आदरयुक्त आणि धीर देणारे वर्तन लाभले.",
      "योग्य आणि काळजीपूर्वक वैद्यकीय सल्ला मिळाला.",
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
    phrases_hinglish: [
      "Check-up kaafi thorough aur detailed mila.",
      "Proper guidance aur diagnosis mila.",
      "Medical advice trustworthy aur clear lagi.",
      "Step-by-step examination kaafi satisfying laga.",
    ],
    phrases_hindi: [
      "जांच पूरी तरह से गहन और व्यवस्थित रही।",
      "मूल कारणों को समझकर सटीक चिकित्सीय सलाह दी गई।",
      "शुरुआत से अंत तक बहुत ही तसल्लीबख्श चेक-अप मिला।",
      "सटीक जांच और विश्वसनीय मार्गदर्शन प्राप्त हुआ।",
    ],
    phrases_mr: [
      "तपासणी अतिशय सविस्तर आणि काळजीपूर्वक झाली.",
      "मुळापासून कारणांचा शोध घेऊन अचूक सल्ला दिला गेला.",
      "सुरुवातीपासून शेवटपर्यंत समाधानकारक तपासणी झाली.",
      "विश्वासार्ह आणि तपशीलवार वैद्यकीय मार्गदर्शन लाभले.",
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
    phrases_hinglish: [
      "Clinic ka setup bilkul clean aur hygienic mila.",
      "Sanitation aur cleanliness ka achha level mila.",
      "Waiting area neat aur comfortable laga.",
      "Hygienic aur peaceful clinic environment mila.",
    ],
    phrases_hindi: [
      "क्लिनिक का माहौल पूरी तरह शांत, स्वच्छ और सैनिटाइज रहा।",
      "चिकित्सीय स्वच्छता के उच्च मानकों का पालन दिखा।",
      "वेटिंग एरिया और केबिन पूरी तरह सुव्यवस्थित मिले।",
      "स्वच्छ और सुरक्षित क्लीनिकल वातावरण मिला।",
    ],
    phrases_mr: [
      "क्लिनिक अतिशय स्वच्छ, शांत आणि निर्जंतुक आढळले.",
      "वैद्यकीय स्वच्छतेचे योग्य नियम पाळले गेले.",
      "प्रतीक्षा कक्ष आणि डॉक्टरांची केबिन व्यवस्थित होती.",
      "सुरक्षित आणि स्वच्छ आरोग्यदायी वातावरण अनुभवले.",
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
    phrases_hinglish: [
      "Appointment time par consultation shuru hua.",
      "Punctuality kaafi achhi mili, bina delay consultation hua.",
      "Bina zyada intezaar ke doctor se milna hua.",
      "Schedule management kaafi organized laga.",
    ],
    phrases_hindi: [
      "अपॉइंटमेंट के समय पर ही परामर्श शुरू हो गया।",
      "समय की पाबंदी बहुत अच्छी रही, बिना फालतू इंतजार के परामर्श मिला।",
      "कतार प्रबंधन बहुत ही व्यवस्थित रहा।",
      "समय पर डॉक्टर से मिलना हुआ, बहुत संतोषजनक रहा।",
    ],
    phrases_mr: [
      "अपॉइंटमेंटच्या वेळेतच तपासणी सुरू झाली.",
      "वेळेचे अचूक नियोजन असल्यामुळे जास्त थांबावे लागले नाही.",
      "रांगेचे व्यवस्थापन अतिशय सुरळीत होते.",
      "वेळेवर सल्ला मिळाल्यामुळे वेळेची बचत झाली.",
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
    phrases_hinglish: [
      "Consultation thoda rushed aur jaldi mein laga.",
      "Doubts clear karne ke liye thoda aur time chahiye.",
      "Questions discuss karne mein thodi jaldi mehsoos hui.",
      "Doctor se aur detail discussion expect kiya.",
    ],
    phrases_hindi: [
      "परामर्श में कुछ जल्दबाजी महसूस हुई।",
      "सवालों और शंकाओं के समाधान के लिए थोड़ा और समय मिलना चाहिए था।",
      "बातचीत जल्दी समाप्त हो गई, पूर्ण विवरण नहीं मिल सका।",
      "थोड़ा और तसल्ली से परामर्श अपेक्षित रहा।",
    ],
    phrases_mr: [
      "तपासणी काहीशी घाईगडबडीत झाली असे वाटले.",
      "शंकांचे निरसन करण्यासाठी आणखी थोडा वेळ मिळायला हवा होता.",
      "सल्ला लवकर संपला, सविस्तर चर्चा होऊ शकली नाही.",
      "अधिक निवांतपणे बोलणे अपेक्षित होते.",
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
    phrases_hinglish: [
      "Appointment time ke baad bhi lamba wait mila.",
      "Waiting area mein delay kaafi zyada laga.",
      "Queue management better hone ki zaroorat hai.",
      "Consultation ke liye kaafi der intezaar karna pada.",
    ],
    phrases_hindi: [
      "अपॉइंटमेंट के समय के बाद भी बहुत देर इंतजार करना पड़ा।",
      "वेटिंग एरिया में काफी भीड़ और देरी रही।",
      "कतार और समय प्रबंधन में सुधार की बहुत आवश्यकता है।",
      "डॉक्टर के पास जाने से पहले काफी समय व्यतीत हो गया।",
    ],
    phrases_mr: [
      "अपॉइंटमेंटची वेळ उलटून गेल्यानंतरही बराच वेळ थांबावे लागले.",
      "प्रतीक्षा कक्षात गर्दी आणि जास्त वेळ गेला.",
      "नंबरच्या नियोजनात सुधारणा होण्याची गरज आहे.",
      "तपासणीसाठी खूप वेळ प्रतीक्षा करावी लागली.",
    ],
  },
];

// ─── 5. Retail & Shopping Chips ─────────────────────────────────────────────

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
    phrases_hinglish: [
      "Products ki kaafi wide variety dekhne ko mila.",
      "Kaafi achha aur diverse collection mila.",
      "Har category mein kaafi options available lage.",
      "Variety aur options kaafi impressive lage.",
    ],
    phrases_hindi: [
      "सामानों की बहुत विस्तृत और बेहतरीन वैरायटी देखने को मिली।",
      "स्टॉक में कई अच्छे विकल्प उपलब्ध रहे।",
      "हर वर्ग के अनुसार भरपूर चॉइस मौजूद रही।",
      "पसंद के अनुसार कई उत्तम विकल्प आसानी से मिल गए।",
    ],
    phrases_mr: [
      "वस्तूंचे अनेक प्रकार आणि मोठी विविधता पाहायला मिळाली.",
      "दुकानात विविध प्रकारच्या वस्तूंचा साठा उपलब्ध होता.",
      "निवडीसाठी भरपूर आणि चांगले पर्याय मिळाले.",
      "गरजेनुसार अनेक उत्तम पर्याय सहज उपलब्ध झाले.",
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
    phrases_hinglish: [
      "Staff ne items dhundhne mein kaafi help ki.",
      "Sales team kaafi polite aur supportive lagi.",
      "Helpful staff ki wajah se shopping kaafi easy hui.",
      "Staff guidance aur recommendations helpful lage.",
    ],
    phrases_hindi: [
      "स्टाफ ने सामान चुनने और ढूंढने में काफी मदद की।",
      "सेल्स टीम का व्यवहार बहुत विनम्र और सहयोगी रहा।",
      "स्टाफ के सहयोग से खरीदारी बहुत आसान और सुखद रही।",
      "स्टाफ की जानकारी और सुझाव काफी उपयोगी साबित हुए।",
    ],
    phrases_mr: [
      "कर्मचाऱ्यांनी वस्तू शोधण्यात आणि निवडण्यात चांगली मदत केली.",
      "विक्री प्रतिनिधी अतिशय नम्र आणि सहकार्य करणारे होते.",
      "मदतनीस कर्मचाऱ्यांमुळे खरेदी अतिशय सोपी झाली.",
      "कर्मचाऱ्यांचे मार्गदर्शन आणि सहकार्य उपयुक्त ठरले.",
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
    phrases_hinglish: [
      "Products genuine aur high quality ke lage.",
      "Purchased items ki quality top-class mili.",
      "Finishing aur durability kaafi achhi lagi.",
      "Quality standards bilkul reliable lage.",
    ],
    phrases_hindi: [
      "सामानों की गुणवत्ता पूरी तरह असली और उच्च कोटि की रही।",
      "टिकाऊ और प्रामाणिक उत्पाद मिले।",
      "खरीदे गए सामान की फिनिशिंग और स्तर से पूरा संतोष मिला।",
      "गुणवत्ता के मामले में उत्पाद पूरी तरह भरोसेमंद रहे।",
    ],
    phrases_mr: [
      "वस्तूंचा दर्जा अस्सल आणि उच्च दर्जाचा आढळला.",
      "उत्पादने टिकाऊ आणि चांगल्या बनावटीची आहेत.",
      "खरेदी केलेल्या मालाच्या गुणवत्तेबाबत पूर्ण समाधान वाटले.",
      "वस्तूंची फिनिशिंग आणि मजबुती उत्तम आहे.",
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
    phrases_hinglish: [
      "Store ka arrangement neat aur well organized mila.",
      "Sections clearly marked hone se items easily mile.",
      "Aisle layout simple aur navigation convenient laga.",
      "Shopping experience kaafi easy aur systematic mila.",
    ],
    phrases_hindi: [
      "स्टोर की व्यवस्था बहुत ही साफ और सुव्यवस्थित रही।",
      "सभी सेक्शन साफ तौर पर चिह्नित होने से सामान आसानी से मिल गया।",
      "खरीदारी का अनुभव काफी सरल और सुविधाजनक रहा।",
      "शेल्व्स का रख-रखाव बहुत ही व्यवस्थित दिखा।",
    ],
    phrases_mr: [
      "दुकान अतिशय नीटनेटके आणि व्यवस्थित मांडलेले होते.",
      "प्रत्येक विभाग स्पष्ट असल्यामुळे वस्तू शोधणे सोपे झाले.",
      "खरेदीचा अनुभव अतिशय सोपा आणि सोयीस्कर ठरला.",
      "मांडणी उत्तम असल्यामुळे वेळ वाचला.",
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
    phrases_hinglish: [
      "Market ke muqable prices thode high lage.",
      "Kuch items thode overpriced mehsoos hue.",
      "Pricing thodi zyada competitive honi chahiye.",
      "Cost thodi steep lagi.",
    ],
    phrases_hindi: [
      "बाजार भाव की तुलना में कीमतें कुछ ज्यादा लगीं।",
      "कुछ सामान अपनी उपयोगिता के मुकाबले महंगे महसूस हुए।",
      "दरों में थोड़ी अधिक प्रतिस्पर्धा होनी चाहिए।",
      "कीमतें कुछ ज्यादा रहीं।",
    ],
    phrases_mr: [
      "बाजारातील दरांच्या तुलनेत भाव थोडे जास्त वाटले.",
      "काही वस्तूंच्या किमती जास्त असल्याचे जाणवले.",
      "दरांमध्ये अधिक सवलत किंवा स्पर्धात्मकता हवी होती.",
      "खर्च काहीसा महाग वाटला.",
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
    phrases_hinglish: [
      "Kuch zaroori items stock mein available nahi mile.",
      "Inventory availability improve hone ki zaroorat hai.",
      "Popular sizes ya models shelves par missing the.",
      "Stock availability par dhyan dena chahiye.",
    ],
    phrases_hindi: [
      "कुछ जरूरी सामान स्टॉक में उपलब्ध नहीं मिले।",
      "इन्वेंट्री की उपलब्धता में और बेहतर प्रबंधन की आवश्यकता है।",
      "पॉपुलर साइज और मॉडल शेल्व्स पर उपलब्ध नहीं रहे।",
      "स्टॉक की उपलब्धता पर ध्यान दिया जाना चाहिए।",
    ],
    phrases_mr: [
      "काही आवश्यक वस्तूंचा साठा संपलेला आढळला.",
      "मालाची उपलब्धता अधिक चांगली ठेवणे आवश्यक आहे.",
      "मागणी असलेल्या वस्तू दुकानात उपलब्ध नव्हत्या.",
      "स्टॉकचे व्यवस्थापन अधिक चांगले व्हायला हवे.",
    ],
  },
];

// ─── 6. Gym & Fitness Chips ─────────────────────────────────────────────────

export const FITNESS_CHIPS = [
  {
    id: "fit_equipment",
    label: "Modern equipment",
    sentiment: "positive",
    phrases_en: [
      "Great range of modern and well-maintained equipment.",
      "All workout machines and free weights are in top condition.",
      "Excellent gym equipment with plenty of variety.",
      "Modern machinery that caters to all training needs.",
    ],
    phrases_hi: [
      "Gym mein modern aur well-maintained equipment mile.",
      "Saari workout machines aur weights top condition mein mile.",
      "Equipments ki variety aur maintenance kaafi achha laga.",
      "Machines smooth aur safe working condition mein the.",
    ],
    phrases_hinglish: [
      "Gym mein modern aur well-maintained equipment mile.",
      "Saari workout machines aur weights top condition mein mile.",
      "Equipments ki variety aur maintenance kaafi achha laga.",
      "Machines smooth aur safe working condition mein the.",
    ],
    phrases_hindi: [
      "जिम में आधुनिक और अच्छी तरह मेंटेन किए गए उपकरण मिले।",
      "सभी वर्कआउट मशीनें और फ्री-वेट्स बेहतरीन कंडीशन में रहे।",
      "उपकरणों की वैरायटी और मेंटेनेंस काफी अच्छा रहा।",
      "हर तरह की फिटनेस ट्रेनिंग के लिए उपयुक्त मशीनें उपलब्ध रहीं।",
    ],
    phrases_mr: [
      "जिममधील सर्व उपकरणे आधुनिक आणि सुस्थितीत आढळली.",
      "वर्कआउट मशिन्स आणि वेट्स उत्तम स्थितीत मिळाले.",
      "उपकरणांची विविधता आणि देखभाल अतिशय उत्तम वाटली.",
      "सर्व प्रकारच्या व्यायामासाठी योग्य मशिन्स उपलब्ध होत्या.",
    ],
  },
  {
    id: "fit_trainer",
    label: "Helpful trainers",
    sentiment: "positive",
    phrases_en: [
      "Trainers were very supportive and knowledgeable.",
      "Great workout guidance and posture correction from trainers.",
      "Friendly and motivating fitness trainers on the floor.",
      "Personalized attention and safe training tips provided.",
    ],
    phrases_hi: [
      "Trainers kaafi helpful aur knowledgeable mile.",
      "Workout guidance aur posture support kaafi achha mila.",
      "Friendly aur motivating training environment laga.",
      "Floor par trainers ka attention kaafi supportive raha.",
    ],
    phrases_hinglish: [
      "Trainers kaafi helpful aur knowledgeable mile.",
      "Workout guidance aur posture support kaafi achha mila.",
      "Friendly aur motivating training environment laga.",
      "Floor par trainers ka attention kaafi supportive raha.",
    ],
    phrases_hindi: [
      "ट्रेनर्स काफी मददगार और सही गाइडेंस देने वाले मिले।",
      "वर्कआउट के दौरान सही पोस्चर और सपोर्ट का पूरा ध्यान मिला।",
      "सपोर्टिव और मोटिवेटिंग ट्रेनर्स का साथ रहा।",
      "ट्रेनिंग में बारीकियों और सुरक्षा पर पूरा जोर दिया गया।",
    ],
    phrases_mr: [
      "ट्रेनर्स अतिशय अनुभवी आणि योग्य मार्गदर्शन करणारे आढळले.",
      "व्यायामादरम्यान योग्य मार्गदर्शन आणि सहकार्य मिळाले.",
      "उत्साहवर्धक आणि सहकार्य करणारा ट्रेनर वर्ग लाभला.",
      "व्यायामाच्या योग्य पद्धती समजावून सांगण्यात आल्या.",
    ],
  },
  {
    id: "fit_clean",
    label: "Clean & hygienic",
    sentiment: "positive",
    phrases_en: [
      "Very clean gym floor and sanitized equipment.",
      "Locker rooms and showers were spotless and fresh.",
      "High standards of hygiene maintained throughout.",
      "Clean workout stations and fresh air circulation.",
    ],
    phrases_hi: [
      "Gym floor aur locker rooms bilkul clean aur hygienic mile.",
      "Cleanliness aur hygiene ka level kaafi impressive laga.",
      "Equipment sanitized aur fresh environment mila.",
      "Hygiene standards regular basis par maintain mile.",
    ],
    phrases_hinglish: [
      "Gym floor aur locker rooms bilkul clean aur hygienic mile.",
      "Cleanliness aur hygiene ka level kaafi impressive laga.",
      "Equipment sanitized aur fresh environment mila.",
      "Hygiene standards regular basis par maintain mile.",
    ],
    phrases_hindi: [
      "जिम फ्लोर और चेंजिंग रूम्स काफी साफ और हाइजीनिक मिले।",
      "मशीनों और लॉकर एरिया में सफाई का पूरा ध्यान रखा गया।",
      "सफाई और हाइजीन का स्तर बहुत बढ़िया रहा।",
      "फ्रेश एयर सर्कुलेशन और स्वच्छ वातावरण मिला।",
    ],
    phrases_mr: [
      "जिम परिसर आणि लॉकर रूम्स अतिशय स्वच्छ आणि टापटिप्प आढळल्या.",
      "स्वच्छता आणि आरोग्याची योग्य काळजी घेतली गेली.",
      "परिसर स्वच्छ आणि ताजेतवाने वाटले.",
      "मशिन्स निर्जंतुक आणि स्वच्छ ठेवल्या होत्या.",
    ],
  },
  {
    id: "fit_vibe",
    label: "Motivating vibe",
    sentiment: "positive",
    phrases_en: [
      "Great energy and motivating workout environment.",
      "Loved the music, lighting, and fitness atmosphere.",
      "Very positive crowd and energizing gym vibe.",
      "A fantastic space to stay focused and consistent.",
    ],
    phrases_hi: [
      "Workout ke liye kaafi motivating aur energetic mahaul mila.",
      "Music aur fitness vibe workout boost karti hai.",
      "Positive aur focused workout environment laga.",
      "Energy aur motivation kaafi inspiring mila.",
    ],
    phrases_hinglish: [
      "Workout ke liye kaafi motivating aur energetic mahaul mila.",
      "Music aur fitness vibe workout boost karti hai.",
      "Positive aur focused workout environment laga.",
      "Energy aur motivation kaafi inspiring mila.",
    ],
    phrases_hindi: [
      "वर्कआउट के लिए काफी पॉजिटिव और मोटिवेटिंग माहौल मिला।",
      "जिम का म्यूजिक और एनर्जी लेवल वर्कआउट को आसान बनाता है।",
      "काफी एक्टिव और प्रेरणादायक माहौल रहा।",
      "नियमित वर्कआउट के लिए बहुत ही शानदार जगह है।",
    ],
    phrases_mr: [
      "व्यायामासाठी अतिशय प्रेरणादायी आणि उत्साही वातावरण लाभले.",
      "सकारात्मक ऊर्जा आणि उत्तम संगीतामुळे वर्कआउट छान झाले.",
      "उत्साहवर्धक आणि शिस्तबद्ध जिमचे वातावरण वाटले.",
      "नियमित व्यायाम करण्यासाठी उत्तम जागा आहे.",
    ],
  },
  {
    id: "fit_crowd",
    label: "Too crowded",
    sentiment: "negative",
    phrases_en: [
      "Gym gets very crowded during peak morning and evening hours.",
      "Had to wait for popular machines and benches.",
      "Peak hour crowd management needs improvement.",
      "Space feels constrained during rush times.",
    ],
    phrases_hi: [
      "Peak hours mein gym kaafi crowded ho jata hai.",
      "Machines aur bench ke liye kaafi wait karna pada.",
      "Crowd management better hone ki zaroorat lagti hai.",
      "Rush time par workout space thodi kam lagti hai.",
    ],
    phrases_hinglish: [
      "Peak hours mein gym kaafi crowded ho jata hai.",
      "Machines aur bench ke liye kaafi wait karna pada.",
      "Crowd management better hone ki zaroorat lagti hai.",
      "Rush time par workout space thodi kam lagti hai.",
    ],
    phrases_hindi: [
      "पीक ऑवर्स में जिम में काफी ज्यादा भीड़ रहती है।",
      "मशीनों और बेंच के लिए काफी इंतजार करना पड़ा।",
      "भीड़ प्रबंधन में सुधार की आवश्यकता महसूस हुई।",
      "ज्यादा भीड़ के समय वर्कआउट के लिए जगह कम लगी।",
    ],
    phrases_mr: [
      "गर्दीच्या वेळेत जिममध्ये प्रचंड गर्दी जाणवली.",
      "मशिन्स वापरण्यासाठी बराच वेळ थांबावे लागले.",
      "गर्दीचे नियोजन अधिक चांगले होण्याची गरज आहे.",
      "जास्त गर्दीमुळे व्यायामासाठी जागा अपुरी वाटली.",
    ],
  },
  {
    id: "fit_maintenance",
    label: "Maintenance issues",
    sentiment: "negative",
    phrases_en: [
      "A few machines were out of order or needed repair.",
      "Air conditioning and ventilation could be better.",
      "Equipment maintenance could be more timely.",
      "Worn out grips and cables need attention.",
    ],
    phrases_hi: [
      "Kuch machines out of order theen aur repair pending tha.",
      "AC aur ventilation thoda better hona chahiye.",
      "Equipment maintenance time par hona zaroori laga.",
      "Grips aur cables par dhyan dena zaroori hai.",
    ],
    phrases_hinglish: [
      "Kuch machines out of order theen aur repair pending tha.",
      "AC aur ventilation thoda better hona chahiye.",
      "Equipment maintenance time par hona zaroori laga.",
      "Grips aur cables par dhyan dena zaroori hai.",
    ],
    phrases_hindi: [
      "कुछ मशीनें काम नहीं कर रही थीं और रिपेयर की जरूरत थी।",
      "वेंटिलेशन और एसी की व्यवस्था और बेहतर हो सकती है।",
      "मशीनों का समय पर मेंटेनेंस होना जरूरी लगता है।",
      "उपकरणों की नियमित जांच और सर्विसिंग आवश्यक है।",
    ],
    phrases_mr: [
      "काही मशिन्स बंद होत्या आणि दुरुस्तीची गरज जाणवली.",
      "वातानुकूलन आणि हवेची सोय अधिक चांगली हवी होती.",
      "उपकरणांची नियमित देखभाल वेळेवर होणे गरजेचे वाटले.",
      "मशिन्सची वेळीच दुरुस्ती होणे आवश्यक आहे.",
    ],
  },
];

// ─── 7. Automotive & Repair Chips ───────────────────────────────────────────

export const AUTOMOTIVE_CHIPS = [
  {
    id: "auto_mechanic",
    label: "Skilled mechanics",
    sentiment: "positive",
    phrases_en: [
      "Mechanics were very skilled and diagnosed the issue accurately.",
      "Quick and correct troubleshooting of vehicle problems.",
      "Technical knowledge of the service team was impressive.",
      "Work was handled with great technical expertise.",
    ],
    phrases_hi: [
      "Mechanics kaafi skilled mile aur issue accurately diagnose kiya.",
      "Gaadi ki problem ka quick aur correct solution mila.",
      "Technical knowledge aur expertise kaafi badhiya lagi.",
      "Work handling aur troubleshooting kaafi sharp rahi.",
    ],
    phrases_hinglish: [
      "Mechanics kaafi skilled mile aur issue accurately diagnose kiya.",
      "Gaadi ki problem ka quick aur correct solution mila.",
      "Technical knowledge aur expertise kaafi badhiya lagi.",
      "Work handling aur troubleshooting kaafi sharp rahi.",
    ],
    phrases_hindi: [
      "मैकेनिक काफी कुशल मिले और समस्या की सही पहचान की।",
      "गाड़ी की समस्या का तुरंत और सटीक समाधान मिला।",
      "सर्विस टीम की तकनीकी जानकारी काफी प्रभावशाली रही।",
      "समस्या निवारण में बहुत ही पेशेवर अनुभव रहा।",
    ],
    phrases_mr: [
      "मेकॅनिक अतिशय कुशल आढळले आणि गाडीतील बिघाड अचूक ओळखला.",
      "वाहनातील समस्येचे जलद आणि योग्य निवारण झाले.",
      "तांत्रिक कौशल्य आणि कामाचा अनुभव कौतुकास्पद वाटला.",
      "गाडीचे काम अतिशय चांगल्या पद्धतीने पार पडले.",
    ],
  },
  {
    id: "auto_delivery",
    label: "Timely delivery",
    sentiment: "positive",
    phrases_en: [
      "Vehicle was serviced and delivered on time as promised.",
      "Punctual delivery without unnecessary delays.",
      "Appreciated the prompt turnaround time on vehicle servicing.",
      "Ready right on schedule as committed.",
    ],
    phrases_hi: [
      "Gaadi time par service hokar delivery mili.",
      "Bina delay ke promised time par kaam complete hua.",
      "Prompt delivery aur punctual turnaround kaafi achha laga.",
      "Committed timeline par vehicle ready mila.",
    ],
    phrases_hinglish: [
      "Gaadi time par service hokar delivery mili.",
      "Bina delay ke promised time par kaam complete hua.",
      "Prompt delivery aur punctual turnaround kaafi achha laga.",
      "Committed timeline par vehicle ready mila.",
    ],
    phrases_hindi: [
      "गाड़ी की सर्विस तय समय पर पूरी करके डिलीवरी दी गई।",
      "बिना किसी देरी के समय पर काम पूरा हुआ।",
      "प्रॉमिस किए गए समय पर डिलीवरी मिलना काफी अच्छा लगा।",
      "समय की पाबंदी बहुत संतोषजनक रही।",
    ],
    phrases_mr: [
      "गाडी वेळेवर सर्व्हिस होऊन ठरलेल्या वेळेत परत मिळाली.",
      "अनावश्यक विलंब न होता वेळेवर काम पूर्ण झाले.",
      "वचनाप्रमाणे वेळेत गाडी मिळाल्यामुळे समाधान वाटले.",
      "ठरलेल्या वेळेत गाडी तयार मिळाली.",
    ],
  },
  {
    id: "auto_pricing",
    label: "Transparent pricing",
    sentiment: "positive",
    phrases_en: [
      "Clear estimate provided beforehand with no hidden costs.",
      "Honest pricing and reasonable labor charges.",
      "Very transparent billing and detailed invoice.",
      "Fair and justified quotation for the repairs.",
    ],
    phrases_hi: [
      "Kaam se pehle clear estimate mila, koi hidden charges nahi the.",
      "Fair pricing aur transparent billing kaafi achhi lagi.",
      "Reasonable charges aur detailed bill provide kiya.",
      "Quotation clear aur justified mila.",
    ],
    phrases_hinglish: [
      "Kaam se pehle clear estimate mila, koi hidden charges nahi the.",
      "Fair pricing aur transparent billing kaafi achhi lagi.",
      "Reasonable charges aur detailed bill provide kiya.",
      "Quotation clear aur justified mila.",
    ],
    phrases_hindi: [
      "काम से पहले स्पष्ट एस्टीमेट दिया गया और कोई हिडन चार्ज नहीं रहा।",
      "खर्च वाजिब और बिलिंग पूरी तरह पारदर्शी रही।",
      "ईमानदार प्राइसिंग और डिटेल इनवॉइस मिला।",
      "सर्विस के चार्ज पूरी तरह न्यायसंगत लगे।",
    ],
    phrases_mr: [
      "कामापूर्वी खर्चाचा स्पष्ट अंदाज दिला गेला, कोणतेही छुपे शुल्क नव्हते.",
      "वाजवी दर आणि पारदर्शक बिलिंग पद्धत आढळली.",
      "खर्च रास्त आणि प्रत्येक कामाचा तपशीलवार हिशोब मिळाला.",
      "कामाचे दर पूर्णपणे योग्य वाटले.",
    ],
  },
  {
    id: "auto_genuine",
    label: "Genuine parts used",
    sentiment: "positive",
    phrases_en: [
      "Genuine spare parts used with authentic packaging shown.",
      "High quality oil and authentic replacement parts installed.",
      "Work quality gives confidence in vehicle safety.",
      "Reliable components used throughout the repair.",
    ],
    phrases_hi: [
      "Original spare parts use kiye gaye aur box show kiya.",
      "Quality servicing aur genuine parts se trust bana.",
      "Reliable parts aur safe fitting provide ki gayi.",
      "Authentic parts se gaadi ka performance improve hua.",
    ],
    phrases_hinglish: [
      "Original spare parts use kiye gaye aur box show kiya.",
      "Quality servicing aur genuine parts se trust bana.",
      "Reliable parts aur safe fitting provide ki gayi.",
      "Authentic parts se gaadi ka performance improve hua.",
    ],
    phrases_hindi: [
      "ओरिजिनल स्पेयर पार्ट्स का इस्तेमाल किया गया।",
      "काम की क्वालिटी और पार्ट्स की ऑथेंटिसिटी पर पूरा भरोसा बना।",
      "विश्वसनीय पार्ट्स और बढ़िया सर्विसिंग मिली।",
      "सुरक्षा और परफॉर्मेंस दोनों में सुधार महसूस हुआ।",
    ],
    phrases_mr: [
      "ओरिजिनल स्पेअर पार्ट्सचा वापर केला गेला.",
      "कामाचा दर्जा आणि साहित्याची गुणवत्ता विश्वासार्ह वाटली.",
      "वाहनाच्या सुरक्षिततेची पूर्ण खात्री पटली.",
      "दर्जेदार पार्टसमुळे गाडीची कार्यक्षमता वाढली.",
    ],
  },
  {
    id: "auto_delay",
    label: "Delayed delivery",
    sentiment: "negative",
    phrases_en: [
      "Vehicle delivery took much longer than the promised time.",
      "Faced unexpected delays without prior updates.",
      "Delivery timelines should be better communicated.",
      "Waiting time for vehicle delivery was inconvenient.",
    ],
    phrases_hi: [
      "Promised time se kaafi late delivery mili.",
      "Bina update ke delay hua, time management better hona chahiye.",
      "Delivery schedule follow karne mein kami lagi.",
      "Vehicle delivery mein lamba delay face karna pada.",
    ],
    phrases_hinglish: [
      "Promised time se kaafi late delivery mili.",
      "Bina update ke delay hua, time management better hona chahiye.",
      "Delivery schedule follow karne mein kami lagi.",
      "Vehicle delivery mein lamba delay face karna pada.",
    ],
    phrases_hindi: [
      "गाड़ी की डिलीवरी में प्रॉमिस किए गए समय से काफी ज्यादा देरी हुई।",
      "बिना पूर्व सूचना के काम में ज्यादा समय लगा।",
      "डिलीवरी टाइमिंग को लेकर बेहतर कम्युनिकेशन होना चाहिए।",
      "तय समय पर डिलीवरी न मिलने से परेशानी हुई।",
    ],
    phrases_mr: [
      "ठरवून दिलेल्या वेळेपेक्षा गाडी मिळण्यास बराच उशीर झाला.",
      "कोणतीही पूर्वकल्पना न देता कामात विलंब झाला.",
      "वेळेचे नियोजन अधिक काटेकोर असणे आवश्यक आहे.",
      "वेळेवर गाडी न मिळाल्यामुळे गैरसोय झाली.",
    ],
  },
  {
    id: "auto_expensive",
    label: "High repair cost",
    sentiment: "negative",
    phrases_en: [
      "Repair costs felt quite high compared to initial estimates.",
      "Labor charges were on the steeper side.",
      "Pricing could be more competitive.",
      "Bill was higher than expected for standard maintenance.",
    ],
    phrases_hi: [
      "Initial estimate se final cost kaafi high laga.",
      "Labor charges thode steep mehsoos hue.",
      "Cost aur competitive hone ki zaroorat hai.",
      "Service bill expected se zyada raha.",
    ],
    phrases_hinglish: [
      "Initial estimate se final cost kaafi high laga.",
      "Labor charges thode steep mehsoos hue.",
      "Cost aur competitive hone ki zaroorat hai.",
      "Service bill expected se zyada raha.",
    ],
    phrases_hindi: [
      "शुरुआती एस्टीमेट के मुकाबले रिपेयर खर्च काफी ज्यादा लगा।",
      "लेबर चार्ज अपेक्षा से अधिक महसूस हुआ।",
      "प्राइसिंग और वाजिब होनी चाहिए।",
      "बिल सामान्य सर्विसिंग की तुलना में अधिक रहा।",
    ],
    phrases_mr: [
      "सुरुवातीच्या अंदाजापेक्षा दुरुस्तीचा खर्च बराच जास्त आला.",
      "कामाचे दर अपेक्षेपेक्षा जास्त वाटले.",
      "दर अधिक वाजवी असायला हवे होते.",
      "बिल अपेक्षेपेक्षा जास्त आले.",
    ],
  },
];

// ─── 8. Professional Services Chips ─────────────────────────────────────────

export const SERVICES_CHIPS = [
  {
    id: "serv_expert",
    label: "Expert consultation",
    sentiment: "positive",
    phrases_en: [
      "Demonstrated deep domain expertise and sound advice.",
      "Understood requirements thoroughly with professional clarity.",
      "Very knowledgeable guidance on complex matters.",
      "High competence and clear strategic insights.",
    ],
    phrases_hi: [
      "Domain expertise aur sound professional advice mila.",
      "Requirements ko kaafi thoroughly aur clearly samjha.",
      "Experienced guidance aur reliable consultation laga.",
      "Strategic insights aur understanding kaafi sharp rahi.",
    ],
    phrases_hinglish: [
      "Domain expertise aur sound professional advice mila.",
      "Requirements ko kaafi thoroughly aur clearly samjha.",
      "Experienced guidance aur reliable consultation laga.",
      "Strategic insights aur understanding kaafi sharp rahi.",
    ],
    phrases_hindi: [
      "कार्यक्षेत्र की गहरी समझ और सटीक सलाह मिली।",
      "ज़रूरतों को पूरी स्पष्टता और पेशेवर तरीके से समझा गया।",
      "सटीक और अनुभवी मार्गदर्शन प्राप्त हुआ।",
      "व्यावसायिक समझ और रणनीतिक सलाह बहुत ही उपयोगी रही।",
    ],
    phrases_mr: [
      "विषयाचे सखोल ज्ञान आणि योग्य सल्ला मिळाला.",
      "गरजा समजून घेऊन व्यावसायिक पद्धतीने मार्गदर्शन केले.",
      "अनुभवी आणि विश्वासार्ह सल्ल्याचा फायदा झाला.",
      "कामातील कौशल्य आणि सल्ला अत्यंत उपयुक्त ठरला.",
    ],
  },
  {
    id: "serv_comm",
    label: "Clear communication",
    sentiment: "positive",
    phrases_en: [
      "Clear, transparent communication and regular progress updates.",
      "Prompt responses to queries throughout the process.",
      "Very patient explanations of all details.",
      "Smooth coordination and professional handling.",
    ],
    phrases_hi: [
      "Clear aur transparent communication mila.",
      "Har stage par regular updates aur prompt response mila.",
      "Queries patiently explain ki gayi.",
      "Coordination aur updates kaafi reliable rahe.",
    ],
    phrases_hinglish: [
      "Clear aur transparent communication mila.",
      "Har stage par regular updates aur prompt response mila.",
      "Queries patiently explain ki gayi.",
      "Coordination aur updates kaafi reliable rahe.",
    ],
    phrases_hindi: [
      "काम के दौरान स्पष्ट बातचीत और समय पर अपडेट्स मिले।",
      "सवालों का तुरंत और तसल्ली से जवाब दिया गया।",
      "पारदर्शी संचार और पेशेवर तरीका देखने को मिला।",
      "हर चरण पर सही जानकारी और सहयोग प्राप्त हुआ।",
    ],
    phrases_mr: [
      "स्पष्ट आणि पारदर्शक संवाद तसेच नियमित कामाचे अपडेट्स मिळाले.",
      "विचारलेल्या प्रश्नांची तत्परतेने उत्तरे दिली गेली.",
      "संवाद अतिशय सुलभ आणि व्यावसायिक राहिला.",
      "प्रत्येक टप्प्यावर योग्य मार्गदर्शन आणि सहकार्य लाभले.",
    ],
  },
  {
    id: "serv_timely",
    label: "Timely execution",
    sentiment: "positive",
    phrases_en: [
      "Delivered work strictly within the committed deadline.",
      "Punctual execution without compromising quality.",
      "Appreciated the disciplined time management.",
      "Milestones were met on schedule as agreed.",
    ],
    phrases_hi: [
      "Committed deadline ke andar kaam complete hua.",
      "Time management aur discipline kaafi impressive laga.",
      "Punctual delivery without delay.",
      "Agreed timeline bilkul properly follow hui.",
    ],
    phrases_hinglish: [
      "Committed deadline ke andar kaam complete hua.",
      "Time management aur discipline kaafi impressive laga.",
      "Punctual delivery without delay.",
      "Agreed timeline bilkul properly follow hui.",
    ],
    phrases_hindi: [
      "तय समयसीमा के भीतर पूरी जिम्मेदारी से काम पूरा हुआ।",
      "समय की पाबंदी और गुणवत्ता का बेहतरीन संतुलन मिला।",
      "अनुशासित और समय पर कार्य पूरा किया गया।",
      "दिए गए वचनों के अनुसार समयबद्ध डिलीवरी मिली।",
    ],
    phrases_mr: [
      "दिलेल्या मुदतीत काम पूर्ण केले गेले.",
      "वेळेची शिस्त आणि कामाचा दर्जा दोन्ही उत्तम राखले.",
      "वेळेचे योग्य नियोजन कौतुकास्पद वाटले.",
      "ठरलेल्या वेळापत्रकानुसार काम सुरळीत पार पडले.",
    ],
  },
  {
    id: "serv_reliable",
    label: "Trustworthy team",
    sentiment: "positive",
    phrases_en: [
      "Highly trustworthy, dependable, and client-focused.",
      "Handled documentation with complete confidentiality.",
      "Felt confident and secure working together.",
      "A reliable partner for professional needs.",
    ],
    phrases_hi: [
      "Trustworthy aur dependable team ke saath kaam hua.",
      "Documentation aur handling kaafi safe aur reliable lagi.",
      "Client satisfaction par achha focus mila.",
      "Professional partnership kaafi reassuring rahi.",
    ],
    phrases_hinglish: [
      "Trustworthy aur dependable team ke saath kaam hua.",
      "Documentation aur handling kaafi safe aur reliable lagi.",
      "Client satisfaction par achha focus mila.",
      "Professional partnership kaafi reassuring rahi.",
    ],
    phrases_hindi: [
      "पूरी तरह विश्वसनीय और ग्राहक-केंद्रित कार्यशैली मिली।",
      "गोपनीयता और जिम्मेदारी का पूरा ध्यान रखा गया।",
      "साथ काम करके पूरी संतुष्टि और भरोसा बना।",
      "व्यावसायिक जरूरतों के लिए एक भरोसेमंद टीम साबित हुई।",
    ],
    phrases_mr: [
      "अतिशय विश्वासार्ह आणि कामावर निष्ठा असणारी टीम आढळली.",
      "कामातील गोपनीयता आणि जबाबदारी योग्यरीत्या सांभाळली गेली.",
      "एकत्र काम करताना पूर्ण विश्वास वाटला.",
      "व्यावसायिक कामांसाठी अत्यंत भरवशाची संस्था वाटली.",
    ],
  },
  {
    id: "serv_slow_resp",
    label: "Slow responses",
    sentiment: "negative",
    phrases_en: [
      "Response time to emails and phone calls was slow.",
      "Follow-ups required multiple reminders.",
      "Communication turnaround should be faster.",
      "Delays in addressing pending queries.",
    ],
    phrases_hi: [
      "Calls aur messages ka response kaafi slow mila.",
      "Follow-up lene mein kaafi time laga.",
      "Communication turnaround fast hona chahiye.",
      "Pending queries address hone mein delay hua.",
    ],
    phrases_hinglish: [
      "Calls aur messages ka response kaafi slow mila.",
      "Follow-up lene mein kaafi time laga.",
      "Communication turnaround fast hona chahiye.",
      "Pending queries address hone mein delay hua.",
    ],
    phrases_hindi: [
      "कॉल और ईमेल का जवाब मिलने में काफी समय लगा।",
      "अपडेट्स के लिए कई बार फॉलो-अप करना पड़ा।",
      "बातचीत की रफ्तार और बेहतर होनी चाहिए।",
      "प्रश्नों के उत्तर में विलंब का सामना करना पड़ा।",
    ],
    phrases_mr: [
      "फोन किंवा ईमेलला उत्तर मिळण्यास बराच वेळ लागला.",
      "माहितीसाठी वारंवार पाठपुरावा करावा लागला.",
      "संवादाचा वेग अधिक जलद असायला हवा होता.",
      "प्रश्नांची उत्तरे मिळण्यात अनावश्यक विलंब झाला.",
    ],
  },
  {
    id: "serv_unclear",
    label: "Unclear scope",
    sentiment: "negative",
    phrases_en: [
      "Deliverables and project timelines were not outlined clearly.",
      "Initial expectations were ambiguous.",
      "Clearer scope definition would help.",
      "Lack of early clarity on deliverables.",
    ],
    phrases_hi: [
      "Project scope aur timeline pehle clear nahi thi.",
      "Initial expectations mein ambiguity mehsoos hui.",
      "Clarity aur planning better honi chahiye.",
      "Deliverables ki outline aur sharp honi chahiye.",
    ],
    phrases_hinglish: [
      "Project scope aur timeline pehle clear nahi thi.",
      "Initial expectations mein ambiguity mehsoos hui.",
      "Clarity aur planning better honi chahiye.",
      "Deliverables ki outline aur sharp honi chahiye.",
    ],
    phrases_hindi: [
      "काम की समयसीमा और स्कोप शुरुआत में स्पष्ट नहीं था।",
      "अपेक्षाओं और प्रोसेस को लेकर असमंजस रहा।",
      "शुरुआत में अधिक स्पष्टता की आवश्यकता महसूस हुई।",
      "योजना और डिलीवरी के प्रारूप में और स्पष्टता होनी चाहिए।",
    ],
    phrases_mr: [
      "कामाची व्याप्ती आणि मुदत सुरुवातीला स्पष्ट नव्हती.",
      "अपेक्षा आणि कामाच्या पद्धतीबाबत संदिग्धता राहिली.",
      "सुरुवातीला अधिक स्पष्टता असणे गरजेचे होते.",
      "नियोजनाचा आराखडा अधिक स्पष्ट असायला हवा होता.",
    ],
  },
];

// ─── 9. Hospitality & Hotel Chips ───────────────────────────────────────────

export const HOTEL_CHIPS = [
  {
    id: "hotel_clean",
    label: "Clean & comfy rooms",
    sentiment: "positive",
    phrases_en: [
      "Rooms were very clean, comfortable, and well appointed.",
      "Fresh bed linens, clean towels, and spotless bathrooms.",
      "Housekeeping did a wonderful job maintaining cleanliness.",
      "Quiet, peaceful, and immaculate room setup.",
    ],
    phrases_hi: [
      "Rooms kaafi clean, comfortable aur well-maintained mile.",
      "Bed linen aur washrooms spotless mile.",
      "Housekeeping cleanliness kaafi impressive lagi.",
      "Peaceful aur tidy room environment mila.",
    ],
    phrases_hinglish: [
      "Rooms kaafi clean, comfortable aur well-maintained mile.",
      "Bed linen aur washrooms spotless mile.",
      "Housekeeping cleanliness kaafi impressive lagi.",
      "Peaceful aur tidy room environment mila.",
    ],
    phrases_hindi: [
      "कमरे बेहद साफ, आरामदायक और अच्छी तरह व्यवस्थित मिले।",
      "साफ बेडशीट, तौलिए और बिल्कुल स्वच्छ बाथरूम रहे।",
      "हाउसकीपिंग टीम ने सफाई का बहुत अच्छा ध्यान रखा।",
      "शांत, स्वच्छ और सुकूनभरा कमरा मिला।",
    ],
    phrases_mr: [
      "खोली अतिशय स्वच्छ, आरामदायी आणि नीटनेटकी आढळली.",
      "स्वच्छ चादरी, टॉवेल्स आणि बाथरूम अत्यंत स्वच्छ होते.",
      "स्वच्छतेची काळजी अतिशय उत्तम घेतली गेली.",
      "शांत आणि आरामदायी वास्तव्याचा अनुभव आला.",
    ],
  },
  {
    id: "hotel_hospitality",
    label: "Warm hospitality",
    sentiment: "positive",
    phrases_en: [
      "Staff was exceptionally courteous, warm, and helpful.",
      "Welcoming atmosphere from check-in to check-out.",
      "Front desk was always attentive to guest needs.",
      "Hospitality was genuinely heartwarming.",
    ],
    phrases_hi: [
      "Staff ka behavior kaafi courteous aur warm mila.",
      "Check-in se checkout tak kaafi welcoming vibe rahi.",
      "Front desk team genuinely helpful lagi.",
      "Hospitality aur service care kaafi achhi lagi.",
    ],
    phrases_hinglish: [
      "Staff ka behavior kaafi courteous aur warm mila.",
      "Check-in se checkout tak kaafi welcoming vibe rahi.",
      "Front desk team genuinely helpful lagi.",
      "Hospitality aur service care kaafi achhi lagi.",
    ],
    phrases_hindi: [
      "स्टाफ का व्यवहार बहुत ही विनम्र, गर्मजोशी भरा और मददगार रहा।",
      "चेक-इन से लेकर चेक-आउट तक बहुत सुखद अनुभव मिला।",
      "रिसेप्शन टीम हर जरूरत पर तुरंत मदद के लिए तैयार रही।",
      "आतिथ्य और सेवाभाव बहुत ही सराहनीय रहा।",
    ],
    phrases_mr: [
      "कर्मचाऱ्यांचे वर्तन अत्यंत नम्र, आदरयुक्त आणि मदत करणारे होते.",
      "सुरुवातीपासून शेवटपर्यंत अतिशय आतिथ्यशील वातावरण अनुभवले.",
      "रिसेप्शनवरील कर्मचाऱ्यांनी प्रत्येक गरजेकडे लक्ष दिले.",
      "उत्कृष्ट आदरातिथ्यामुळे मन प्रसन्न झाले.",
    ],
  },
  {
    id: "hotel_location",
    label: "Convenient location",
    sentiment: "positive",
    phrases_en: [
      "Great central location with easy access to transport.",
      "Peaceful surroundings yet close to city attractions.",
      "Safe and convenient neighborhood.",
      "Ideal location for both leisure and business stays.",
    ],
    phrases_hi: [
      "Location kaafi convenient aur centrally located mili.",
      "Peaceful aur safe neighborhood laga.",
      "Transport aur connectivity easy rahi.",
      "City access aur stay ke hisaab se ideal location rahi.",
    ],
    phrases_hinglish: [
      "Location kaafi convenient aur centrally located mili.",
      "Peaceful aur safe neighborhood laga.",
      "Transport aur connectivity easy rahi.",
      "City access aur stay ke hisaab se ideal location rahi.",
    ],
    phrases_hindi: [
      "लोकेशन बहुत ही सुविधाजनक और मुख्य जगहों से जुड़ी हुई मिली।",
      "आस-पास का माहौल शांत और सुरक्षित रहा।",
      "आने-जाने में कोई परेशानी नहीं हुई, उत्तम कनेक्टिविटी रही।",
      "ठहरने के लिए बहुत ही उपयुक्त जगह है।",
    ],
    phrases_mr: [
      "हॉटेलची जागा अतिशय सोयीस्कर आणि मध्यवर्ती ठिकाणी आहे.",
      "शांत आणि सुरक्षित परिसर अनुभवता आला.",
      "दळणवळणाची साधने सहज उपलब्ध झाली.",
      "मुक्कामासाठी अतिशय उत्तम जागा ठरली.",
    ],
  },
  {
    id: "hotel_breakfast",
    label: "Delicious breakfast",
    sentiment: "positive",
    phrases_en: [
      "Tasty breakfast spread with plenty of fresh options.",
      "Food quality at the restaurant was very good.",
      "Enjoyed the morning dining service.",
      "Fresh, healthy, and satisfying breakfast buffet.",
    ],
    phrases_hi: [
      "Breakfast spread kaafi tasty aur fresh mila.",
      "Food quality aur options kaafi achhe lage.",
      "Dining service kaafi satisfying rahi.",
      "Morning meal fresh aur hygienic raha.",
    ],
    phrases_hinglish: [
      "Breakfast spread kaafi tasty aur fresh mila.",
      "Food quality aur options kaafi achhe lage.",
      "Dining service kaafi satisfying rahi.",
      "Morning meal fresh aur hygienic raha.",
    ],
    phrases_hindi: [
      "नाश्ता काफी स्वादिष्ट और ताजा मिला, विकल्पों की कमी नहीं थी।",
      "रेस्टोरेंट में खाने की क्वालिटी बहुत अच्छी रही।",
      "सुबह का नाश्ता बहुत ही संतोषजनक और सेहतमंद लगा।",
      "भोजन की गुणवत्ता बहुत अच्छी रही।",
    ],
    phrases_mr: [
      "सकाळचा नाश्ता चवदार आणि विविध पर्यायांसह ताजा मिळाला.",
      "रेस्टॉरंटमधील जेवणाचा दर्जा उत्तम होता.",
      "नाश्ता अतिशय समाधानकारक वाटला.",
      "जेवणाची चव आणि दर्जा मनापासून आवडला.",
    ],
  },
  {
    id: "hotel_checkin",
    label: "Slow check-in",
    sentiment: "negative",
    phrases_en: [
      "Check-in process took much longer than expected.",
      "Room was not ready upon arrival at scheduled check-in time.",
      "Front desk queue management was slow.",
      "Delays at reception during arrival.",
    ],
    phrases_hi: [
      "Check-in process kaafi slow mila.",
      "Scheduled time par room ready nahi mila, wait karna pada.",
      "Reception handling fast honi chahiye.",
      "Front desk par lamba wait face karna pada.",
    ],
    phrases_hinglish: [
      "Check-in process kaafi slow mila.",
      "Scheduled time par room ready nahi mila, wait karna pada.",
      "Reception handling fast honi chahiye.",
      "Front desk par lamba wait face karna pada.",
    ],
    phrases_hindi: [
      "चेक-इन में अपेक्षा से काफी अधिक समय लगा।",
      "तय समय पर पहुंचने के बाद भी कमरा तैयार नहीं था।",
      "रिसेप्शन पर लंबी लाइन और धीमी प्रक्रिया रही।",
      "आगमन पर स्वागत और रूम हैंडओवर में देरी हुई।",
    ],
    phrases_mr: [
      "चेक-इन प्रक्रियेस अपेक्षेपेक्षा जास्त वेळ लागला.",
      "ठरलेल्या वेळेवर पोहोचूनही खोली तयार नव्हती.",
      "रिसेप्शनवरील कामाचा वेग वाढवणे गरजेचे आहे.",
      "हॉटेलमध्ये आल्यावर खोली मिळण्यास विलंब झाला.",
    ],
  },
  {
    id: "hotel_noise",
    label: "Noisy rooms",
    sentiment: "negative",
    phrases_en: [
      "Room lacked proper sound insulation; noise from outside was disturbing.",
      "Corridor and street noise made resting difficult.",
      "A quieter room setup would improve the stay.",
      "Disturbed sleep due to poor soundproofing.",
    ],
    phrases_hi: [
      "Room mein soundproofing theek nahi thi, street noise disturb kar raha tha.",
      "Rest karne mein disturbance hua.",
      "Quiet rooms ke liye better insulation chahiye.",
      "Corridor noise room tak aa raha tha.",
    ],
    phrases_hinglish: [
      "Room mein soundproofing theek nahi thi, street noise disturb kar raha tha.",
      "Rest karne mein disturbance hua.",
      "Quiet rooms ke liye better insulation chahiye.",
      "Corridor noise room tak aa raha tha.",
    ],
    phrases_hindi: [
      "कमरे में बाहरी आवाज ज्यादा आ रही थी, आराम करने में परेशानी हुई।",
      "साउंडप्रूफिंग बेहतर होनी चाहिए।",
      "सड़क और कॉरिडोर का शोर कमरे तक पहुंच रहा था।",
      "शांत वातावरण के लिए इन्सुलेशन सुधारने की जरूरत है।",
    ],
    phrases_mr: [
      "खोलीत बाहेरचा आणि कॉरिडॉरचा आवाज येत असल्याने विश्रांती घेण्यास त्रास झाला.",
      "आवाज रोखण्याची व्यवस्था अधिक चांगली हवी होती.",
      "शांततेचा अभाव जाणवला.",
      "खोलीतील आवाजाचा त्रास कमी व्हायला हवा होता.",
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
  ...FITNESS_CHIPS,
  ...AUTOMOTIVE_CHIPS,
  ...SERVICES_CHIPS,
  ...HOTEL_CHIPS,
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
  {
    keys: [
      "fitness", "gym", "workout", "crossfit", "yoga",
      "aerobics", "trainer", "pilates", "bodybuilding",
      "athletics", "combat", "zumba",
    ],
    chips: FITNESS_CHIPS,
    industry: "fitness",
  },
  {
    keys: [
      "automotive", "car", "bike", "mechanic", "garage",
      "service center", "repair", "auto", "tyre", "tire",
      "wheel", "detailing", "car wash", "dent", "paint",
    ],
    chips: AUTOMOTIVE_CHIPS,
    industry: "automotive",
  },
  {
    keys: [
      "services", "professional services", "consultant", "consulting",
      "lawyer", "advocate", "accountant", "ca", "tax",
      "legal", "audit", "advisory",
    ],
    chips: SERVICES_CHIPS,
    industry: "services",
  },
  {
    keys: [
      "hotel", "hospitality", "resort", "stay", "lodge",
      "homestay", "inn", "guest house", "motel", "hostel",
      "villa", "bnb", "bed and breakfast",
    ],
    chips: HOTEL_CHIPS,
    industry: "hotel",
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
  const clean = category.toLowerCase().trim();
  for (const entry of CATEGORY_MAP) {
    if (
      entry.keys.some((key) => {
        // Use word boundary to prevent partial collisions (e.g. "hospital" matching "hospitality")
        const regex = new RegExp(`(^|[^a-z0-9])${key}([^a-z0-9]|$)`, "i");
        return regex.test(clean);
      })
    ) {
      return { industry: entry.industry, chips: entry.chips };
    }
  }
  return { industry: "generic", chips: GENERIC_CHIPS };
}
