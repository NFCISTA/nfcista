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
      "Very welcoming and pleasant team."
    ],
    phrases_hi: [
      "Staff kaafi friendly aur polite mila.",
      "Staff ka behavior bahut helpful aur cooperative mila.",
      "Sabhi log kaafi welcoming lage.",
      "Staff ka attitude kaafi pleasant mila."
    ],
    phrases_hinglish: [
      "Staff kaafi friendly aur polite mila.",
      "Staff ka behavior bahut helpful aur cooperative mila.",
      "Sabhi log kaafi welcoming lage.",
      "Staff ka attitude kaafi pleasant mila."
    ],
    phrases_hindi: [
      "स्टाफ का व्यवहार बहुत विनम्र और मददगार रहा।",
      "यहाँ के कर्मचारी काफी सहयोगी और शालीन मिले।",
      "स्टाफ की तरफ से बहुत अच्छा और सकारात्मक बर्ताव मिला।",
      "सभी कर्मचारी काफी स्वागतयोग्य और विनम्र रहे।"
    ],
    phrases_mr: [
      "इथला कर्मचारी वर्ग अतिशय नम्र आणि मदत करणारा आढळला.",
      "कर्मचाऱ्यांचे वर्तन आपुलकीचे आणि सहकार्याचे होते.",
      "सर्व कर्मचाऱ्यांकडून अतिशय चांगला अनुभव मिळाला.",
      "अतिशय स्वागतशील आणि तत्पर कर्मचारी वर्ग लाभला."
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
      "Everything was handled quickly and smoothly."
    ],
    phrases_hi: [
      "Service kaafi fast aur smooth mili.",
      "Bina delay ke turant kaam hua.",
      "Kaafi prompt aur efficient service mili.",
      "Speed aur handling kaafi achhi lagi."
    ],
    phrases_hinglish: [
      "Service kaafi fast aur smooth mili.",
      "Bina delay ke turant kaam hua.",
      "Kaafi prompt aur efficient service mili.",
      "Speed aur handling kaafi achhi lagi."
    ],
    phrases_hindi: [
      "यहाँ की सर्विस काफी तेज और सुगम रही।",
      "बिना किसी देरी के तुरंत और सुचारू रूप से काम पूरा हुआ।",
      "समय की पाबंदी और त्वरित सेवा काफी सराहनीय लगी।",
      "सर्विस की गति और कार्यप्रणाली बहुत बढ़िया रही।"
    ],
    phrases_mr: [
      "सेवा अतिशय जलद आणि कार्यक्षम मिळाली.",
      "कोणत्याही विलंबाशिवाय काम वेळेत आणि सुरळीत पार पडले.",
      "तत्पर आणि वेगवान सेवेमुळे खूप समाधान वाटले.",
      "कामाचा वेग आणि व्यवस्थापन अतिशय उत्तम राहिले."
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
      "Clean, tidy, and comfortable environment."
    ],
    phrases_hi: [
      "Jagah bilkul clean aur hygienic mili.",
      "Cleanliness aur hygiene ka achha dhyan mila.",
      "Sab kuch organized aur saaf mila.",
      "Environment kaafi neat aur comfortable laga."
    ],
    phrases_hinglish: [
      "Jagah bilkul clean aur hygienic mili.",
      "Cleanliness aur hygiene ka achha dhyan mila.",
      "Sab kuch organized aur saaf mila.",
      "Environment kaafi neat aur comfortable laga."
    ],
    phrases_hindi: [
      "परिसर पूरी तरह साफ-सुथरा और व्यवस्थित मिला।",
      "स्वच्छता और हाइजीन का बहुत अच्छा ध्यान रखा गया।",
      "साफ-सफाई और अनुशासन काफी प्रभावशाली रहा।",
      "शांत, स्वच्छ और आरामदायक वातावरण मिला।"
    ],
    phrases_mr: [
      "परिसर अतिशय स्वच्छ, टापटिप्प आणि प्रसन्न आढळला.",
      "स्वच्छता आणि नीटनेटकेपणाची उत्तम काळजी घेतली गेली.",
      "सर्व व्यवस्था अतिशय व्यवस्थित आणि स्वच्छ दिसली.",
      "स्वच्छ आणि आरामदायी वातावरण अनुभवता आले."
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
      "Work quality exceeded expectations."
    ],
    phrases_hi: [
      "Kaam ki quality top-notch mili.",
      "High standards aur achhi quality dekhne ko mili.",
      "Detailing aur finishing kaafi impressive lagi.",
      "Quality expectations se behtar lagi."
    ],
    phrases_hinglish: [
      "Kaam ki quality top-notch mili.",
      "High standards aur achhi quality dekhne ko mili.",
      "Detailing aur finishing kaafi impressive lagi.",
      "Quality expectations se behtar lagi."
    ],
    phrases_hindi: [
      "काम की गुणवत्ता बहुत ही उच्च स्तर की रही।",
      "हर काम में बारीकी और उत्तम फिनिशिंग देखने को मिली।",
      "गुणवत्ता के मानकों पर पूरी तरह खरा उतरा।",
      "काम का स्तर अपेक्षा से अधिक बेहतरीन रहा।"
    ],
    phrases_mr: [
      "कामाचा एकूण दर्जा अतिशय उत्कृष्ट राहिला.",
      "कामातील अचूकता आणि बारकावे पाहून समाधान वाटले.",
      "दर्जेदार काम आणि उच्च मानके राखली गेली.",
      "कामाची गुणवत्ता अपेक्षेपेक्षाही चांगली अनुभवली."
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
      "Very honest and transparent pricing."
    ],
    phrases_hi: [
      "Pricing bilkul fair aur reasonable lagi.",
      "Value for money experience mila.",
      "Keemat ke hisaab se poora paisa vasool laga.",
      "Pricing transparent aur justified mili."
    ],
    phrases_hinglish: [
      "Pricing bilkul fair aur reasonable lagi.",
      "Value for money experience mila.",
      "Keemat ke hisaab se poora paisa vasool laga.",
      "Pricing transparent aur justified mili."
    ],
    phrases_hindi: [
      "सेवा के हिसाब से दरें बिल्कुल वाजिब और उचित रहीं।",
      "पैसे के बदले बहुत ही मूल्यवान अनुभव मिला।",
      "प्राइसिंग पूरी तरह पारदर्शी और न्यायसंगत रही।",
      "उचित दरों में बेहतरीन सेवा प्राप्त हुई।"
    ],
    phrases_mr: [
      "सेवेच्या तुलनेत दर अतिशय योग्य आणि रास्त वाटले.",
      "खर्चाच्या मानाने अतिशय मोलाचा अनुभव मिळाला.",
      "दर पूर्णपणे पारदर्शक आणि योग्य आढळले.",
      "वाजवी दरात दर्जेदार सेवेचा लाभ झाला."
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
      "Service was delayed and slow."
    ],
    phrases_hi: [
      "Intezaar expected se zyada karna pada.",
      "Turn aane mein kaafi waqt laga.",
      "Wait time kam karne ki zaroorat lagti hai.",
      "Service mein thoda delay mehsoos hua."
    ],
    phrases_hinglish: [
      "Intezaar expected se zyada karna pada.",
      "Turn aane mein kaafi waqt laga.",
      "Wait time kam karne ki zaroorat lagti hai.",
      "Service mein thoda delay mehsoos hua."
    ],
    phrases_hindi: [
      "इंतजार का समय अपेक्षा से अधिक रहा।",
      "बारी आने में काफी समय लग गया।",
      "वेटिंग टाइम कम करने की आवश्यकता महसूस हुई।",
      "सर्विस में कुछ देरी का सामना करना पड़ा।"
    ],
    phrases_mr: [
      "प्रतीक्षा वेळ अपेक्षेपेक्षा जास्त लागला.",
      "नंबर येण्यासाठी बराच वेळ थांबावे लागले.",
      "प्रतीक्षेचा वेळ कमी करणे आवश्यक वाटते.",
      "सेवेमध्ये काही प्रमाणात विलंब जाणवला."
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
      "Handling from the team could be better."
    ],
    phrases_hi: [
      "Staff coordination aur behavior improve ho sakta hai.",
      "Customer service mein betterment chahiye.",
      "Staff se aur professional behavior expect kiya.",
      "Team communication behtar ho sakti hai."
    ],
    phrases_hinglish: [
      "Staff coordination aur behavior improve ho sakta hai.",
      "Customer service mein betterment chahiye.",
      "Staff se aur professional behavior expect kiya.",
      "Team communication behtar ho sakti hai."
    ],
    phrases_hindi: [
      "स्टाफ के व्यवहार और तालमेल में सुधार की गुंजाइश है।",
      "कस्टमर सर्विस को और अधिक विनम्र बनाने की आवश्यकता है।",
      "स्टाफ से और अधिक पेशेवर रुख की अपेक्षा रही।",
      "टीम की बातचीत और सहयोग और बेहतर हो सकता है।"
    ],
    phrases_mr: [
      "कर्मचाऱ्यांच्या वागणुकीत आणि संवादात सुधारणा हवी.",
      "ग्राहक सेवेचा दर्जा आणखी वाढवणे गरजेचे आहे.",
      "कर्मचाऱ्यांकडून अधिक व्यावसायिक दृष्टिकोन अपेक्षित होता.",
      "कामातील समन्वय अधिक चांगला असायला हवा."
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
      "Costs felt somewhat steep."
    ],
    phrases_hi: [
      "Prices thode zyada lage.",
      "Di hui service ke muqable cost high lagi.",
      "Paison ke hisaab se value thodi kam lagi.",
      "Pricing thodi steep mehsoos hui."
    ],
    phrases_hinglish: [
      "Prices thode zyada lage.",
      "Di hui service ke muqable cost high lagi.",
      "Paison ke hisaab se value thodi kam lagi.",
      "Pricing thodi steep mehsoos hui."
    ],
    phrases_hindi: [
      "कीमतें थोड़ी अधिक महसूस हुईं।",
      "दी गई सेवा के मुकाबले खर्च कुछ ज्यादा लगा।",
      "मूल्य के हिसाब से दरों में थोड़ी रियायत होनी चाहिए।",
      "दरें बाजार की तुलना में कुछ अधिक लगीं।"
    ],
    phrases_mr: [
      "दर थोडे जास्त असल्याचे जाणवले.",
      "मिळालेल्या सेवेच्या तुलनेत खर्च अधिक वाटला.",
      "दरांमध्ये अधिक वाजवीपणा असणे गरजेचे वाटते.",
      "खर्च अपेक्षेपेक्षा काहीसा जास्त वाटला."
    ],
  },
  {
    id: "gen_options_explained",
    label: "Clear options explained",
    sentiment: "positive",
    phrases_en: [
      "Different options were explained clearly.",
      "Staff took time to walk through the available choices.",
      "Clear and helpful explanation of all details.",
      "Appreciated the clear breakdown of choices."
    ],
    phrases_hi: [
      "Saare options acche se explain kiye gaye.",
      "Choices aur details samajhne mein kaafi help mili.",
      "Clear explanation dekhne ko mila.",
      "Options ka breakdown kaafi simple aur helpful laga."
    ],
    phrases_hinglish: [
      "Saare options acche se explain kiye gaye.",
      "Choices aur details samajhne mein kaafi help mili.",
      "Clear explanation dekhne ko mila.",
      "Options ka breakdown kaafi simple aur helpful laga."
    ],
    phrases_hindi: [
      "सभी विकल्पों को बहुत स्पष्ट रूप से समझाया गया।",
      "कर्मचारियों ने उपलब्ध विकल्पों की पूरी जानकारी दी।",
      "विवरण की स्पष्ट और उपयोगी व्याख्या मिली।",
      "विकल्पों को समझने में बहुत आसानी हुई।"
    ],
    phrases_mr: [
      "उपलब्ध पर्याय अतिशय स्पष्टपणे समजावून सांगितले गेले.",
      "विविध पर्यायांची सविस्तर आणि उपयुक्त माहिती मिळाली.",
      "कर्मचाऱ्यांनी सर्व बाबी नीट स्पष्ट केल्या.",
      "पर्याय समजून घेणे सोपे झाले."
    ],
  },
  {
    id: "gen_smooth_process",
    label: "Smooth overall process",
    sentiment: "positive",
    phrases_en: [
      "The whole process was smooth and well managed.",
      "Everything went smoothly from start to finish.",
      "Hassle-free process with clear steps.",
      "Very streamlined and easy workflow."
    ],
    phrases_hi: [
      "Poora process kaafi smooth aur organized laga.",
      "Shuru se end tak sab smoothly handle hua.",
      "Bina kisi issue ke aasan process mila.",
      "Process kaafi streamlined aur convenient laga."
    ],
    phrases_hinglish: [
      "Poora process kaafi smooth aur organized laga.",
      "Shuru se end tak sab smoothly handle hua.",
      "Bina kisi issue ke aasan process mila.",
      "Process kaafi streamlined aur convenient laga."
    ],
    phrases_hindi: [
      "पूरी प्रक्रिया बहुत सहज और व्यवस्थित रही।",
      "शुरुआत से अंत तक सब कुछ सुचारू रूप से हुआ।",
      "स्पष्ट चरणों के साथ बिना किसी परेशानी की प्रक्रिया।",
      "कामकाज बहुत ही व्यवस्थित और आसान रहा।"
    ],
    phrases_mr: [
      "एकूण सर्व प्रक्रिया अतिशय सुरळीत आणि नियोजनबद्ध झाली.",
      "सुरुवातीपासून शेवटपर्यंत सर्व काम विनासायास पार पडले.",
      "कोणत्याही अडचणीशिवाय सोपी प्रक्रिया अनुभवायला मिळाली.",
      "कामकाजाची पद्धत अतिशय सुलभ होती."
    ],
  },
  {
    id: "gen_helpful_answers",
    label: "Questions answered patiently",
    sentiment: "positive",
    phrases_en: [
      "All my questions were answered patiently.",
      "Staff took time to address every query.",
      "Clear, polite responses to all questions.",
      "Never felt rushed when asking for details."
    ],
    phrases_hi: [
      "Saare sawalon ke jawab patience ke saath mile.",
      "Har query ko acche se address dekhne ko mila.",
      "Polite aur clear responses dekhne ko mile.",
      "Details poochhne par helpful response mila."
    ],
    phrases_hinglish: [
      "Saare sawalon ke jawab patience ke saath mile.",
      "Har query ko acche se address dekhne ko mila.",
      "Polite aur clear responses dekhne ko mile.",
      "Details poochhne par helpful response mila."
    ],
    phrases_hindi: [
      "सभी सवालों के जवाब बहुत धैर्यपूर्वक दिए गए।",
      "हर प्रश्न को ध्यान से सुनकर स्पष्ट समाधान मिला।",
      "विनम्रता और स्पष्टता के साथ उत्तर दिए गए।",
      "पूरी जानकारी तसल्ली से समझाई गई।"
    ],
    phrases_mr: [
      "सर्व प्रश्नांची उत्तरे अतिशय संयमाने आणि व्यवस्थित दिली गेली.",
      "प्रत्येक शंकेचे निरसन काळजीपूर्वक केले गेले.",
      "नम्र आणि स्पष्ट संवाद साधला गेला.",
      "माहिती विचारताना उत्तम सहकार्य लाभले."
    ],
  },
  {
    id: "gen_prompt_handling",
    label: "Handled request promptly",
    sentiment: "positive",
    phrases_en: [
      "My request was handled promptly and with care.",
      "Quick attention to what was needed.",
      "Responsive team that acted without delay.",
      "Handled my requirement right away."
    ],
    phrases_hi: [
      "Request par prompt action dekhne ko mila.",
      "Kaam par turant dhyan dekhne ko mila.",
      "Team ne bina delay ke request handle ki.",
      "Kaafi responsive aur attentive service mili."
    ],
    phrases_hinglish: [
      "Request par prompt action dekhne ko mila.",
      "Kaam par turant dhyan dekhne ko mila.",
      "Team ne bina delay ke request handle ki.",
      "Kaafi responsive aur attentive service mili."
    ],
    phrases_hindi: [
      "अनुरोध पर तुरंत और ध्यानपूर्वक कार्रवाई की गई।",
      "आवश्यकता पर त्वरित ध्यान दिया गया।",
      "बिना किसी देरी के तत्परता से काम संभाला गया।",
      "समय पर और सही सेवा मिली।"
    ],
    phrases_mr: [
      "कामाच्या विनंतीवर तातडीने आणि काळजीपूर्वक कार्यवाही केली गेली.",
      "गरजेनुसार त्वरित लक्ष दिले गेले.",
      "संघाने विलंब न लावता काम पूर्ण केले.",
      "अतिशय तत्पर आणि विश्वासार्ह सेवा मिळाली."
    ],
  },
  {
    id: "gen_honest_guidance",
    label: "Honest guidance provided",
    sentiment: "positive",
    phrases_en: [
      "Received genuine and honest guidance.",
      "No overselling or unnecessary recommendations.",
      "Transparent advice that put my needs first.",
      "Felt confident with their honest approach."
    ],
    phrases_hi: [
      "Genuine aur honest guidance dekhne ko mili.",
      "Koi unnecessary upselling nahi dekhne ko mili.",
      "Transparent aur practical advice mili.",
      "Honest approach se kaafi trust bana."
    ],
    phrases_hinglish: [
      "Genuine aur honest guidance dekhne ko mili.",
      "Koi unnecessary upselling nahi dekhne ko mili.",
      "Transparent aur practical advice mili.",
      "Honest approach se kaafi trust bana."
    ],
    phrases_hindi: [
      "सच्ची और ईमानदार सलाह दी गई।",
      "अनावश्यक चीजों को थोपने की कोशिश नहीं की गई।",
      "पारदर्शी सलाह मिली जिससे विश्वास बढ़ा।",
      "ईमानदार और व्यावहारिक दृष्टिकोण देखने को मिला।"
    ],
    phrases_mr: [
      "अतिशय प्रामाणिक आणि योग्य मार्गदर्शन मिळाले.",
      "अनावश्यक गोष्टींचा आग्रह धरला गेला नाही.",
      "पारदर्शक सल्ल्यामुळे विश्वास निर्माण झाला.",
      "योग्य आणि हिताचा सल्ला मिळाला."
    ],
  },
  {
    id: "gen_orderly_space",
    label: "Orderly & welcoming setup",
    sentiment: "positive",
    phrases_en: [
      "The setup was orderly and welcoming.",
      "Comfortable environment with good upkeep.",
      "Well-arranged space that felt comfortable.",
      "Pleasant atmosphere with neat surroundings."
    ],
    phrases_hi: [
      "Setup kaafi orderly aur welcoming laga.",
      "Comfortable environment aur acchi upkeep mili.",
      "Space kaafi well arranged aur pleasant laga.",
      "Acha aur neat setup dekhne ko mila."
    ],
    phrases_hinglish: [
      "Setup kaafi orderly aur welcoming laga.",
      "Comfortable environment aur acchi upkeep mili.",
      "Space kaafi well arranged aur pleasant laga.",
      "Acha aur neat setup dekhne ko mila."
    ],
    phrases_hindi: [
      "परिसर काफी व्यवस्थित और स्वागतपूर्ण था।",
      "अच्छे रखरखाव के साथ आरामदायक माहौल मिला।",
      "सुव्यवस्थित जगह देखकर सुखद अनुभव हुआ।",
      "माहौल साफ-सुथरा और सुकून भरा रहा।"
    ],
    phrases_mr: [
      "परिसर अतिशय नीटनेटका आणि स्वागतशील वाटला.",
      "चांगल्या देखभालीसह आरामदायी वातावरण लाभले.",
      "सुटसुटीत आणि प्रसन्न जागा अनुभवता आली.",
      "एकूण परिसर खूप आल्हाददायक वाटला."
    ],
  },
  {
    id: "gen_easy_payment",
    label: "Easy billing & payment",
    sentiment: "positive",
    phrases_en: [
      "Billing and payment were quick and straightforward.",
      "Smooth payment options available.",
      "Clear bill with no confusion.",
      "Quick checkout and payment experience."
    ],
    phrases_hi: [
      "Billing aur payment kaafi aasan aur quick laga.",
      "Payment options smooth aur convenient mile.",
      "Bill bilkul clear aur straightforward mila.",
      "Quick billing experience dekhne ko mila."
    ],
    phrases_hinglish: [
      "Billing aur payment kaafi aasan aur quick laga.",
      "Payment options smooth aur convenient mile.",
      "Bill bilkul clear aur straightforward mila.",
      "Quick billing experience dekhne ko mila."
    ],
    phrases_hindi: [
      "बिलिंग और भुगतान बहुत आसान और त्वरित रहा।",
      "सुविधाजनक भुगतान विकल्प उपलब्ध थे।",
      "बिल पूरी तरह स्पष्ट और पारदर्शी था।",
      "त्वरित चेकआउट और सरल भुगतान अनुभव।"
    ],
    phrases_mr: [
      "बिलिंग आणि पेमेंटची प्रक्रिया अतिशय सुलभ आणि जलद झाली.",
      "पेमेंटसाठी विविध सोपे पर्याय उपलब्ध होते.",
      "बिल स्पष्ट आणि कोणत्याही गोंधळाशिवाय होते.",
      "जलद आणि सोपी बिलिंग सेवा मिळाली."
    ],
  },
  {
    id: "gen_attentive_service",
    label: "Attentive to requirements",
    sentiment: "positive",
    phrases_en: [
      "The team was attentive to my requirements.",
      "Paid close attention to what I was looking for.",
      "Understood my needs without any fuss.",
      "Listened carefully and delivered accordingly."
    ],
    phrases_hi: [
      "Team ne requirements par pura dhyan diya.",
      "Zaroorat ko acche se samjha mila.",
      "Attentive service dekhne ko mili.",
      "Dhyan se sunkar kaam dekhne ko mila."
    ],
    phrases_hinglish: [
      "Team ne requirements par pura dhyan diya.",
      "Zaroorat ko acche se samjha mila.",
      "Attentive service dekhne ko mili.",
      "Dhyan se sunkar kaam dekhne ko mila."
    ],
    phrases_hindi: [
      "टीम ने सभी आवश्यकताओं पर पूरा ध्यान दिया।",
      "जो चाहिए था उसे बहुत बारीकी से समझा गया।",
      "बिना किसी परेशानी के जरूरत को पूरा किया गया।",
      "ध्यान से सुनकर सही तरीके से काम किया।"
    ],
    phrases_mr: [
      "संघाने सर्व गरजांवर बारकाईने लक्ष दिले.",
      "अपेक्षित गोष्टी नीट समजून घेतल्या गेल्या.",
      "गरजा समजून घेऊन त्यानुसार उत्तम काम झाले.",
      "काळजीपूर्वक ऐकून घेतलेली सेवा मनाला भावली."
    ],
  },
  {
    id: "gen_reliable_delivery",
    label: "Delivered as promised",
    sentiment: "positive",
    phrases_en: [
      "Everything was delivered exactly as promised.",
      "Met expectations on both quality and timing.",
      "Dependable service that followed through.",
      "Delivered on their commitment."
    ],
    phrases_hi: [
      "Sab kuch waise hi deliver hua jaise promised mila.",
      "Timing aur quality dono mein commitments meet huye.",
      "Dependable service dekhne ko mili.",
      "Commitment pura follow dekhne ko mila."
    ],
    phrases_hinglish: [
      "Sab kuch waise hi deliver hua jaise promised mila.",
      "Timing aur quality dono mein commitments meet huye.",
      "Dependable service dekhne ko mili.",
      "Commitment pura follow dekhne ko mila."
    ],
    phrases_hindi: [
      "सब कुछ बिल्कुल वादे के मुताबिक मिला।",
      "गुणवत्ता और समय दोनों पर उम्मीदें पूरी हुईं।",
      "एक भरोसेमंद सेवा जिसने अपना वादा निभाया।",
      "कहे अनुसार सटीक परिणाम देखने को मिला।"
    ],
    phrases_mr: [
      "दिलेल्या शब्दाप्रमाणे अगदी वेळेत आणि दर्जेदार काम झाले.",
      "गुणवत्ता आणि वेळ या दोन्ही आघाड्यांवर अपेक्षा पूर्ण झाल्या.",
      "अतिशय विश्वासार्ह सेवा अनुभवायला मिळाली.",
      "वचनबद्धता पूर्ण केल्याचे समाधान मिळाले."
    ],
  }
];

// ─── 2. Salon & Spa Chips ───────────────────────────────────────────────────

export const SALON_CHIPS = [
  {
    id: "salon_skilled",
    label: "Skilled stylist",
    sentiment: "positive",
    phrases_en: [
      "The stylist was very skilled and talented.",
      "Really happy with how the styling turned out.",
      "Excellent styling — understood exactly what was needed.",
      "Great haircut and styling skills."
    ],
    phrases_hi: [
      "Stylist kaafi skilled aur experienced mila.",
      "Styling ka result kaafi pasand laga.",
      "Stylist ne bilkul sahi style create kiya.",
      "Haircut aur styling ka kaam top-notch laga."
    ],
    phrases_hinglish: [
      "Stylist kaafi skilled aur experienced mila.",
      "Styling ka result kaafi pasand laga.",
      "Stylist ne bilkul sahi style create kiya.",
      "Haircut aur styling ka kaam top-notch laga."
    ],
    phrases_hindi: [
      "हेयर स्टाइलिस्ट काफी अनुभवी और कुशल रहे।",
      "स्टाइलिंग का परिणाम पूरी तरह मनपसंद मिला।",
      "स्टाइलिस्ट ने जरूरत को समझकर बिल्कुल सही लुक दिया।",
      "हेयरकट और ग्रूमिंग का काम बेहद सराहनीय रहा।"
    ],
    phrases_mr: [
      "हेअर स्टायलिस्ट अतिशय कुशल आणि अनुभवी आढळले.",
      "स्टायलिंगचे काम अतिशय मनासारखे झाले.",
      "अपेक्षेनुसार योग्य हेअरकट आणि स्टाईल मिळाली.",
      "कामातील कौशल्य आणि सफाई खूप आवडली."
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
      "Fresh, trendy looks executed with care."
    ],
    phrases_hi: [
      "Salon ka setup kaafi trendy aur modern laga.",
      "Latest styles aur grooming trends follow karte hain.",
      "Ambiance kaafi contemporary aur stylish mila.",
      "Modern looks aur styling kaafi achhi mili."
    ],
    phrases_hinglish: [
      "Salon ka setup kaafi trendy aur modern laga.",
      "Latest styles aur grooming trends follow karte hain.",
      "Ambiance kaafi contemporary aur stylish mila.",
      "Modern looks aur styling kaafi achhi mili."
    ],
    phrases_hindi: [
      "सैलून का माहौल काफी आधुनिक और ट्रेंडी रहा।",
      "नवीनतम फैशन और ग्रूमिंग ट्रेंड्स की अच्छी समझ देखने को मिली।",
      "मॉडर्न लुक और स्टाइलिंग बहुत ही खूबसूरती से की गई।",
      "स्टाइलिंग ऑप्शन्स नए और काफी आकर्षक रहे।"
    ],
    phrases_mr: [
      "सलूनमधील वातावरण अतिशय आधुनिक आणि ट्रेंडी वाटले.",
      "नवीनतम हेअर आणि ग्रूमिंग ट्रेंड्सची उत्तम माहिती दिसली.",
      "स्टायलिश आणि आधुनिक लूकचे उत्तम काम झाले.",
      "नव्या ट्रेंडनुसार केलेली स्टाईल खूप आवडली."
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
      "Impressed with the hygiene standards followed here."
    ],
    phrases_hi: [
      "Tools aur towels bilkul clean aur sanitize mile.",
      "Hygiene standards kaafi impressive lage.",
      "Stations aur chairs bilkul saaf mile.",
      "Cleanliness aur care kaafi achhi lagi."
    ],
    phrases_hinglish: [
      "Tools aur towels bilkul clean aur sanitize mile.",
      "Hygiene standards kaafi impressive lage.",
      "Stations aur chairs bilkul saaf mile.",
      "Cleanliness aur care kaafi achhi lagi."
    ],
    phrases_hindi: [
      "उपकरण और तौलिए पूरी तरह सैनिटाइज और साफ मिले।",
      "सैलून में स्वच्छता और हाइजीन का पूरा ध्यान रखा गया।",
      "स्टेशन्स और सिटिंग चेयर्स काफी साफ-सुथरी रहीं।",
      "सफाई के उच्च मानकों से पूरा संतोष मिला।"
    ],
    phrases_mr: [
      "साहित्य आणि टॉवेल्स पूर्णपणे स्वच्छ आणि निर्जंतुक आढळले.",
      "स्वच्छता आणि आरोग्याची सर्वोच्च काळजी घेतली गेली.",
      "सर्व खुर्च्या आणि स्टेशन्स अत्यंत स्वच्छ होते.",
      "स्वच्छतेच्या चांगल्या नियमांमुळे सुरक्षित वाटले."
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
      "Long queue and slow pace of service."
    ],
    phrases_hi: [
      "Appointment ke baad bhi kaafi wait karna pada.",
      "Service shuru hone mein lamba intezaar mila.",
      "Time management better hone ki zaroorat lagti hai.",
      "Wait time expected se kaafi zyada laga."
    ],
    phrases_hinglish: [
      "Appointment ke baad bhi kaafi wait karna pada.",
      "Service shuru hone mein lamba intezaar mila.",
      "Time management better hone ki zaroorat lagti hai.",
      "Wait time expected se kaafi zyada laga."
    ],
    phrases_hindi: [
      "अपॉइंटमेंट होने के बावजूद काफी देर इंतजार करना पड़ा।",
      "सर्विस शुरू होने में जरूरत से ज्यादा समय लग गया।",
      "समय प्रबंधन और कतार नियंत्रण में सुधार की आवश्यकता है।",
      "वेटिंग टाइम अपेक्षा से अधिक लंबा रहा।"
    ],
    phrases_mr: [
      "अपॉइंटमेंट असूनही बराच वेळ प्रतीक्षा करावी लागली.",
      "सेवा सुरू होण्यास जास्त वेळ लागला.",
      "वेळेचे नियोजन अधिक चांगले होण्याची गरज आहे.",
      "प्रतीक्षा वेळ खूप जास्त वाटला."
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
      "The service lacked careful finishing due to haste."
    ],
    phrases_hi: [
      "Service thodi jaldbazi mein hui mehsoos hui.",
      "Styling mein thoda aur dhyan dena chahiye.",
      "Finishing aur detailing thodi rushed lagi.",
      "Jaldi khatam karne ki wajah se detailing miss hui."
    ],
    phrases_hinglish: [
      "Service thodi jaldbazi mein hui mehsoos hui.",
      "Styling mein thoda aur dhyan dena chahiye.",
      "Finishing aur detailing thodi rushed lagi.",
      "Jaldi khatam karne ki wajah se detailing miss hui."
    ],
    phrases_hindi: [
      "सर्विस में कुछ जल्दबाजी महसूस हुई।",
      "बारीकियों और फिनिशिंग पर थोड़ा और समय दिया जाना चाहिए था।",
      "जल्दी खत्म करने की वजह से कुछ डिटेल्स छूट गईं।",
      "काम में थोड़ा और धैर्य अपेक्षित रहा।"
    ],
    phrases_mr: [
      "सेवेमध्ये काहीशी घाईगडबड जाणवली.",
      "स्टायलिंग करताना अधिक बारकाईने लक्ष द्यायला हवे होते.",
      "घाईमुळे फिनिशिंग व्यवस्थित झाले नाही असे वाटले.",
      "कामात अधिक संयम आणि काळजी अपेक्षित होती."
    ],
  },
  {
    id: "salon_consultation",
    label: "Consultation before service",
    sentiment: "positive",
    phrases_en: [
      "Helpful consultation before starting the service.",
      "Stylist took time to discuss options first.",
      "Good consultation to understand what I wanted.",
      "Thorough discussion on style options before beginning."
    ],
    phrases_hi: [
      "Service start hone se pehle kaafi accha consultation mila.",
      "Stylist ne pehle acche se options discuss kiye.",
      "Hair aur style discussion kaafi helpful laga.",
      "Pehle se consultation milne se clarity lagi."
    ],
    phrases_hinglish: [
      "Service start hone se pehle kaafi accha consultation mila.",
      "Stylist ne pehle acche se options discuss kiye.",
      "Hair aur style discussion kaafi helpful laga.",
      "Pehle se consultation milne se clarity lagi."
    ],
    phrases_hindi: [
      "सेवा शुरू करने से पहले बहुत उपयोगी परामर्श मिला।",
      "स्टाइलिस्ट ने पहले विकल्पों पर विस्तार से चर्चा की।",
      "मेरी पसंद को समझने के लिए उचित समय दिया गया।",
      "शुरुआती सलाह से सही निर्णय लेने में मदद मिली।"
    ],
    phrases_mr: [
      "सेवा सुरू करण्यापूर्वी उत्तम आणि सविस्तर सल्ला मिळाला.",
      "स्टायलिस्टने प्रथम विविध पर्यायांवर चर्चा केली.",
      "माझी पसंती समजून घेण्यासाठी पुरेसा वेळ दिला.",
      "सुरुवातीच्या मार्गदर्शनामुळे योग्य निर्णय घेता आला."
    ],
  },
  {
    id: "salon_style_matched",
    label: "Hairstyle matched request",
    sentiment: "positive",
    phrases_en: [
      "Hairstyle turned out exactly as requested.",
      "Got the exact cut and style I asked for.",
      "Very satisfied with how accurately the style matched.",
      "The final look matched the reference perfectly."
    ],
    phrases_hi: [
      "Hairstyle bilkul waise hi bani jaise requested mili.",
      "Reference picture ke hisab se exact cut mila.",
      "Styling result bilkul expectation ke hisab se laga.",
      "Haircut look kaafi accurate aur pasand laga."
    ],
    phrases_hinglish: [
      "Hairstyle bilkul waise hi bani jaise requested mili.",
      "Reference picture ke hisab se exact cut mila.",
      "Styling result bilkul expectation ke hisab se laga.",
      "Haircut look kaafi accurate aur pasand laga."
    ],
    phrases_hindi: [
      "हेयरस्टाइल बिल्कुल वैसी ही बनी जैसी मैंने मांगी थी।",
      "दिए गए संदर्भ के अनुसार सटीक कटिंग और स्टाइलिंग मिली।",
      "अंतिम लुक देखकर पूरी संतुष्टि मिली।",
      "सुझाए गए लुक को बहुत खूबसूरती से तराशा गया।"
    ],
    phrases_mr: [
      "सांगितल्याप्रमाणे अगदी हुबेहूब हेअरकट आणि स्टाईल झाली.",
      "दाखवलेल्या फोटोप्रमाणे अचूक लुक तयार झाला.",
      "शेवटचा लुक पाहून पूर्ण समाधान लाभले.",
      "स्टायलिंगचे काम अतिशय चोख पार पडले."
    ],
  },
  {
    id: "salon_process_explained",
    label: "Staff explained process",
    sentiment: "positive",
    phrases_en: [
      "Staff explained each step of the process clearly.",
      "Kept me informed throughout the treatment.",
      "Good explanation of what products were being used.",
      "Very transparent about the steps involved."
    ],
    phrases_hi: [
      "Staff ne har step acche se explain kiya.",
      "Process ke dauraan clear updates mile.",
      "Products aur steps ki acchi jaankari mili.",
      "Har step par helpful explanation dekhne ko mila."
    ],
    phrases_hinglish: [
      "Staff ne har step acche se explain kiya.",
      "Process ke dauraan clear updates mile.",
      "Products aur steps ki acchi jaankari mili.",
      "Har step par helpful explanation dekhne ko mila."
    ],
    phrases_hindi: [
      "स्टाफ ने प्रक्रिया के हर चरण को बहुत स्पष्ट रूप से समझाया।",
      "उपचार के दौरान पूरी जानकारी साझा की गई।",
      "उपयोग किए जा रहे उत्पादों की सही जानकारी दी गई।",
      "हर कदम पर पारदर्शिता देखने को मिली।"
    ],
    phrases_mr: [
      "कर्मचाऱ्यांनी प्रक्रियेतील प्रत्येक टप्पा नीट समजावून सांगितला.",
      "उपचारादरम्यान सातत्याने योग्य माहिती दिली गेली.",
      "वापरल्या जाणाऱ्या उत्पादनांची स्पष्ट कल्पना दिली.",
      "प्रत्येक टप्प्यावर पारदर्शकता अनुभवता आली."
    ],
  },
  {
    id: "salon_on_time",
    label: "Appointment on time",
    sentiment: "positive",
    phrases_en: [
      "Appointment was handled right on time.",
      "No unnecessary waiting, started promptly.",
      "Punctual service that respected my schedule.",
      "Quick intake and timely start to the session."
    ],
    phrases_hi: [
      "Appointment bilkul time par shuru hui.",
      "Bina kisi wait ke prompt service mili.",
      "Time management kaafi sharp laga.",
      "Bina delay ke session start complete mila."
    ],
    phrases_hinglish: [
      "Appointment bilkul time par shuru hui.",
      "Bina kisi wait ke prompt service mili.",
      "Time management kaafi sharp laga.",
      "Bina delay ke session start complete mila."
    ],
    phrases_hindi: [
      "अपॉइंटमेंट बिल्कुल तय समय पर शुरू हुई।",
      "बिना किसी प्रतीक्षा के तुरंत सेवा प्रारंभ की गई।",
      "समय की पाबंदी काफी सराहनीय रही।",
      "सत्र बिना किसी देरी के शुरू हुआ।"
    ],
    phrases_mr: [
      "अपॉइंटमेंट अगदी वेळेवर सुरू झाली.",
      "कोणतीही वाट न पाहता त्वरित सेवा मिळाली.",
      "वेळेचे नियोजन अतिशय काटेकोर वाटले.",
      "वेळेचा आदर ठेवून काम सुरू केले गेले."
    ],
  },
  {
    id: "salon_personalised",
    label: "Personalised service",
    sentiment: "positive",
    phrases_en: [
      "The service felt personalised and attentive.",
      "Individual care tailored to my hair type.",
      "Felt well looked after from start to finish.",
      "Thoughtful attention to personal preferences."
    ],
    phrases_hi: [
      "Service kaafi personalised aur attentive lagi.",
      "Hair type ke hisab se customized care mili.",
      "Individual attention kaafi achha laga.",
      "Preferences ka pura dhyan dekhne ko mila."
    ],
    phrases_hinglish: [
      "Service kaafi personalised aur attentive lagi.",
      "Hair type ke hisab se customized care mili.",
      "Individual attention kaafi achha laga.",
      "Preferences ka pura dhyan dekhne ko mila."
    ],
    phrases_hindi: [
      "सेवा बहुत ही व्यक्तिगत और ध्यानपूर्वक दी गई।",
      "बालों के प्रकार के अनुसार विशेष देखभाल मिली।",
      "व्यक्तिगत प्राथमिकताओं का पूरा सम्मान किया गया।",
      "शुरुआत से अंत तक बेहतरीन देखभाल मिली।"
    ],
    phrases_mr: [
      "सेवा अतिशय वैयक्तिक लक्ष देऊन आणि काळजीपूर्वक दिली गेली.",
      "केसांच्या प्रकारानुसार योग्य ती काळजी घेतली गेली.",
      "वैयक्तिक आवडीनिवडीचा पूर्ण आदर राखला गेला.",
      "सुरुवातीपासून शेवटपर्यंत उत्तम काळजी लाभली."
    ],
  },
  {
    id: "salon_products_explained",
    label: "Products explained clearly",
    sentiment: "positive",
    phrases_en: [
      "Stylist explained the products used very clearly.",
      "Good guidance on products suited for my hair.",
      "Clear breakdown of hair care products.",
      "Honest recommendations on styling products."
    ],
    phrases_hi: [
      "Used products ke baare mein acche se bataya mila.",
      "Hair suitability ke hisab se sahi guidance mila.",
      "Product explanation kaafi clear aur honest laga.",
      "Grooming products ka knowledge kaafi accha mila."
    ],
    phrases_hinglish: [
      "Used products ke baare mein acche se bataya mila.",
      "Hair suitability ke hisab se sahi guidance mila.",
      "Product explanation kaafi clear aur honest laga.",
      "Grooming products ka knowledge kaafi accha mila."
    ],
    phrases_hindi: [
      "उपयोग किए गए उत्पादों के बारे में बहुत स्पष्ट जानकारी दी गई।",
      "बालों के अनुकूल सही उत्पादों की सलाह मिली।",
      "उत्पादों की गुणवत्ता और उपयोग की सही समझ दी गई।",
      "ईमानदार और उपयोगी उत्पाद सुझाव मिले।"
    ],
    phrases_mr: [
      "वापरलेल्या उत्पादनांची अतिशय स्पष्ट माहिती देण्यात आली.",
      "केसांसाठी उपयुक्त उत्पादनांचे योग्य मार्गदर्शन मिळाले.",
      "उत्पादनांविषयीची माहिती अतिशय उपयुक्त ठरली.",
      "योग्य आणि दर्जेदार उत्पादनांची शिफारस केली गेली."
    ],
  },
  {
    id: "salon_gentle_wash",
    label: "Gentle hair wash",
    sentiment: "positive",
    phrases_en: [
      "Very relaxing and gentle hair wash.",
      "Comfortable hair wash with pleasant massage.",
      "Careful and gentle washing technique.",
      "Hair wash experience was soothing and thorough."
    ],
    phrases_hi: [
      "Hair wash kaafi relaxing aur gentle laga.",
      "Comfortable wash aur soothing massage mila.",
      "Dhyan se aur gently hair wash dekhne ko mila.",
      "Hair wash experience kaafi refreshing laga."
    ],
    phrases_hinglish: [
      "Hair wash kaafi relaxing aur gentle laga.",
      "Comfortable wash aur soothing massage mila.",
      "Dhyan se aur gently hair wash dekhne ko mila.",
      "Hair wash experience kaafi refreshing laga."
    ],
    phrases_hindi: [
      "हेयर वॉश का अनुभव बहुत ही आरामदायक और सौम्य रहा।",
      "आरामदायक वॉश के साथ सुखद मसाज मिली।",
      "बहुत ही नजाकत और ध्यानपूर्वक हेयर वॉश किया गया।",
      "बालों की धुलाई काफी ताजगी भरी रही।"
    ],
    phrases_mr: [
      "हेअर वॉश अतिशय आरामदायी आणि सुखद होता.",
      "सौम्य मसाज आणि आरामशीर वॉशचा उत्तम अनुभव आला.",
      "अतिशय काळजीपूर्वक आणि चांगल्या पद्धतीने वॉश दिला गेला.",
      "हेअर वॉशचा अनुभव अतिशय प्रसन्न करणारा ठरला."
    ],
  },
  {
    id: "salon_attention_detail",
    label: "Great attention to detail",
    sentiment: "positive",
    phrases_en: [
      "Impressed by the attention to detail throughout.",
      "Every detail of the styling was perfected.",
      "Meticulous work that showed real craft.",
      "Noticeable care taken with the finishing touches."
    ],
    phrases_hi: [
      "Styling ke har detail par kaafi dhyan dekhne ko mila.",
      "Finishing touches kaafi neat aur precise lage.",
      "Careful aur detailed kaam dekhne ko mila.",
      "Detailing par focus kaafi impressive laga."
    ],
    phrases_hinglish: [
      "Styling ke har detail par kaafi dhyan dekhne ko mila.",
      "Finishing touches kaafi neat aur precise lage.",
      "Careful aur detailed kaam dekhne ko mila.",
      "Detailing par focus kaafi impressive laga."
    ],
    phrases_hindi: [
      "स्टाइलिंग के हर छोटे-बड़े पहलू पर बारीकी से ध्यान दिया गया।",
      "फिनिशिंग टच बहुत ही साफ और सटीक रहा।",
      "बारीक काम में वास्तविक हुनर देखने को मिला।",
      "अंतिम लुक में जो निखार आया वह काबिले तारीफ था।"
    ],
    phrases_mr: [
      "स्टायलिंगमधील बारकाव्यांकडे अतिशय काळजीपूर्वक लक्ष दिले गेले.",
      "फिनिशिंगचे काम अतिशय सुबक आणि अचूक झाले.",
      "कामातील बारकावे आणि कौशल्य स्पष्टपणे जाणवले.",
      "अंतिम फिनिशिंग खूप आकर्षक झाली."
    ],
  },
  {
    id: "salon_relaxing_vibe",
    label: "Relaxing atmosphere",
    sentiment: "positive",
    phrases_en: [
      "Calm and relaxing salon atmosphere.",
      "A very peaceful break while getting pampered.",
      "Comfortable ambiance with pleasant music.",
      "Relaxing environment made the visit enjoyable."
    ],
    phrases_hi: [
      "Salon ka vibe kaafi relaxing aur calm laga.",
      "Peaceful atmosphere mein grooming session mila.",
      "Pleasant ambiance aur acchi vibe dekhne ko mili.",
      "Ambiance kaafi soothing aur comfortable laga."
    ],
    phrases_hinglish: [
      "Salon ka vibe kaafi relaxing aur calm laga.",
      "Peaceful atmosphere mein grooming session mila.",
      "Pleasant ambiance aur acchi vibe dekhne ko mili.",
      "Ambiance kaafi soothing aur comfortable laga."
    ],
    phrases_hindi: [
      "सैलून का माहौल बहुत शांत और तनावमुक्त था।",
      "सैलून में काफी सुकून भरा अनुभव मिला।",
      "सुखद संगीत और आरामदायक परिवेश रहा।",
      "शांत वातावरण ने पूरी सेवा को आनंददायक बना दिया।"
    ],
    phrases_mr: [
      "सैलूनमधील वातावरण अतिशय शांत आणि प्रसन्न होते.",
      "आरामदायी वातावरणात उत्तम ग्रूमिंगचा अनुभव आला.",
      "सुखद संगीत आणि शांत वातावरणाने मन प्रसन्न केले.",
      "परिसरातील शांतता मनाला भावली."
    ],
  },
  {
    id: "salon_aftercare_tips",
    label: "Helpful aftercare tips",
    sentiment: "positive",
    phrases_en: [
      "Stylist provided practical aftercare tips.",
      "Useful advice on maintaining the look at home.",
      "Clear instructions on hair maintenance.",
      "Helpful styling tips to use on daily basis."
    ],
    phrases_hi: [
      "Stylist ne useful aftercare tips provide kiye.",
      "Home maintenance ke liye practical advice mila.",
      "Style maintain karne ke simple tips bataye gaye.",
      "Helpful advice mili jo roz kaam aati hai."
    ],
    phrases_hinglish: [
      "Stylist ne useful aftercare tips provide kiye.",
      "Home maintenance ke liye practical advice mila.",
      "Style maintain karne ke simple tips bataye gaye.",
      "Helpful advice mili jo roz kaam aati hai."
    ],
    phrases_hindi: [
      "स्टाइलिस्ट ने बालों की देखभाल के लिए बहुत व्यावहारिक सुझाव दिए।",
      "घर पर स्टाइल बनाए रखने की उपयोगी सलाह मिली।",
      "बालों के रखरखाव के आसान नुस्खे बताए गए।",
      "दिए गए सुझाव बहुत ही मददगार साबित हुए।"
    ],
    phrases_mr: [
      "स्टायलिस्टने केसांच्या देखभालीसाठी अतिशय उपयुक्त टिप्स दिल्या.",
      "घरी स्टाईल टिकवून ठेवण्यासाठी चांगला सल्ला मिळाला.",
      "केसांची काळजी कशी घ्यावी याचे सोपे मार्गदर्शन लाभले.",
      "रोजच्या वापरासाठी उपयुक्त अशा चांगल्या टिप्स मिळाल्या."
    ],
  },
  {
    id: "salon_comfortable_seating",
    label: "Comfortable seating",
    sentiment: "positive",
    phrases_en: [
      "Styling chairs and seating were very comfortable.",
      "Ergonomic seating that made a long session easy.",
      "Well-spaced and comfortable styling stations.",
      "Seating comfort was noticeable throughout."
    ],
    phrases_hi: [
      "Styling chairs aur seating kaafi comfortable lagi.",
      "Lambe session ke liye bhi seating kaafi easy lagi.",
      "Chairs ka comfort level kaafi badhiya mila.",
      "Stations ke beech accha space aur comfort dekhne ko mila."
    ],
    phrases_hinglish: [
      "Styling chairs aur seating kaafi comfortable lagi.",
      "Lambe session ke liye bhi seating kaafi easy lagi.",
      "Chairs ka comfort level kaafi badhiya mila.",
      "Stations ke beech accha space aur comfort dekhne ko mila."
    ],
    phrases_hindi: [
      "स्टाइलिंग कुर्सियां और बैठने की व्यवस्था बहुत आरामदायक थी।",
      "लंबे सत्र में भी बिल्कुल थकान महसूस नहीं हुई।",
      "स्टेशनों के बीच अच्छी जगह और आराम मिला।",
      "बैठने का आराम पूरे समय सराहनीय रहा।"
    ],
    phrases_mr: [
      "स्टाइलिंगच्या खुर्च्या आणि बैठक व्यवस्था अत्यंत आरामदायी होती.",
      "मोठ्या सेशन्समध्येही बैठक व्यवस्थेमुळे थकवा जाणवला नाही.",
      "योग्य अंतर आणि प्रशस्त जागा होती.",
      "आरामदायी बसण्याची सोय खूप आवडली."
    ],
  }
];

// ─── 3. Restaurant & Food Chips ──────────────────────────────────────────────

export const RESTAURANT_CHIPS = [
  {
    id: "rest_delicious",
    label: "Delicious food",
    sentiment: "positive",
    phrases_en: [
      "The food was absolutely delicious.",
      "Great taste and balanced seasoning throughout.",
      "Really enjoyed the flavors of every dish.",
      "Delicious meal with authentic flavors."
    ],
    phrases_hi: [
      "Khana bahut tasty aur swadisht laga.",
      "Har dish ka taste aur flavor perfect mila.",
      "Taste kaafi lajawab aur fresh mila.",
      "Flavors bilkul balanced aur authentic lage."
    ],
    phrases_hinglish: [
      "Khana bahut tasty aur swadisht laga.",
      "Har dish ka taste aur flavor perfect mila.",
      "Taste kaafi lajawab aur fresh mila.",
      "Flavors bilkul balanced aur authentic lage."
    ],
    phrases_hindi: [
      "खाना बेहद स्वादिष्ट और लजीज रहा।",
      "मसालों और स्वाद का संतुलन बहुत ही बेहतरीन मिला।",
      "हर एक व्यंजन का स्वाद लाजवाब और ताजा रहा।",
      "पारंपरिक और प्रामाणिक स्वाद का पूरा आनंद मिला।"
    ],
    phrases_mr: [
      "जेवण अतिशय चवदार आणि रुचकर होते.",
      "प्रत्येक पदार्थाची चव आणि मसाल्यांचे प्रमाण उत्तम होते.",
      "अन्न अतिशय ताजे आणि स्वादिष्ट वाटले.",
      "अस्सल चव आणि दर्जेदार जेवणाचा आनंद मिळाला."
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
      "Crisp, fresh, and high-quality preparations."
    ],
    phrases_hi: [
      "Khane mein fresh ingredients ka swad mila.",
      "Sab kuch bilkul fresh aur well prepared laga.",
      "Freshness aur quality clearly notice hui.",
      "Ingredients high quality aur fresh lage."
    ],
    phrases_hinglish: [
      "Khane mein fresh ingredients ka swad mila.",
      "Sab kuch bilkul fresh aur well prepared laga.",
      "Freshness aur quality clearly notice hui.",
      "Ingredients high quality aur fresh lage."
    ],
    phrases_hindi: [
      "व्यंजनों में ताजी और शुद्ध सामग्री का स्वाद स्पष्ट महसूस हुआ।",
      "सब कुछ बहुत ही ताजा और अच्छे से तैयार किया गया मिला।",
      "सामग्री की गुणवत्ता और ताजगी बहुत ही बढ़िया रही।",
      "ताजे और उत्तम दर्जे के खाने का अनुभव मिला।"
    ],
    phrases_mr: [
      "जेवणात वापरलेले साहित्य पूर्णपणे ताजे आणि चांगल्या दर्जाचे होते.",
      "पदार्थ अगदी ताजेतवाने आणि नीट तयार केलेले होते.",
      "साहित्याचा ताजेपणा स्पष्टपणे जाणवला.",
      "उत्कृष्ट दर्जाचे आणि ताजे अन्न मिळाले."
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
      "Very pleasing music and relaxing dining vibe."
    ],
    phrases_hi: [
      "Ambiance kaafi pleasant aur welcoming laga.",
      "Decor aur seating comfort kaafi badhiya mila.",
      "Family aur friends ke saath dining ke liye achha vibe hai.",
      "Mahaul peaceful aur comfortable laga."
    ],
    phrases_hinglish: [
      "Ambiance kaafi pleasant aur welcoming laga.",
      "Decor aur seating comfort kaafi badhiya mila.",
      "Family aur friends ke saath dining ke liye achha vibe hai.",
      "Mahaul peaceful aur comfortable laga."
    ],
    phrases_hindi: [
      "रेस्टोरेंट का माहौल बहुत ही सुखद और मनमोहक रहा।",
      "सजावट और बैठने की व्यवस्था बेहद आरामदायक रही।",
      "परिवार और दोस्तों के साथ भोजन के लिए बहुत अच्छा माहौल है।",
      "धीमा संगीत और शांत वातावरण काफी पसंद आया।"
    ],
    phrases_mr: [
      "हॉटेलमधील वातावरण अतिशय प्रसन्न आणि आरामदायक होते.",
      "बैठक व्यवस्था आणि अंतर्गत सजावट खूप छान होती.",
      "कुटुंब किंवा मित्रांसोबत जेवणासाठी अतिशय योग्य जागा आहे.",
      "शांत संगीत आणि आल्हाददायक वातावरणामुळे जेवणाचा आनंद वाढला."
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
      "Very satisfying portions all around."
    ],
    phrases_hi: [
      "Portion sizes kaafi generous aur satisfying mile.",
      "Price ke hisaab se quantity kaafi achhi mili.",
      "Serving size pet bharne layak aur satisfying laga.",
      "Portions bilkul fulfilling lage."
    ],
    phrases_hinglish: [
      "Portion sizes kaafi generous aur satisfying mile.",
      "Price ke hisaab se quantity kaafi achhi mili.",
      "Serving size pet bharne layak aur satisfying laga.",
      "Portions bilkul fulfilling lage."
    ],
    phrases_hindi: [
      "व्यंजनों की मात्रा काफी पर्याप्त और संतोषजनक रही।",
      "कीमत के अनुसार सर्विंग साइज बहुत अच्छा मिला।",
      "मात्रा इतनी रही कि पूरी तरह पेट भर जाए।",
      "क्वांटिटी और क्वालिटी दोनों में पूरा संतुलन दिखा।"
    ],
    phrases_mr: [
      "पदार्थांचे प्रमाण अतिशय समाधानकारक आणि पुरेसे होते.",
      "दराच्या तुलनेत अन्नाचे प्रमाण खूप चांगले मिळाले.",
      "पोटभर आणि समाधान देणारे प्रमाण होते.",
      "दर्जा आणि प्रमाण दोन्हीही योग्य वाटले."
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
      "Dishes could use more depth and better spices."
    ],
    phrases_hi: [
      "Khane mein taste thoda fika laga.",
      "Flavors aur seasoning thodi kam mehsoos hui.",
      "Taste expectations ke hisaab se thoda weak laga.",
      "Spices aur seasoning better hone ki zaroorat hai."
    ],
    phrases_hinglish: [
      "Khane mein taste thoda fika laga.",
      "Flavors aur seasoning thodi kam mehsoos hui.",
      "Taste expectations ke hisaab se thoda weak laga.",
      "Spices aur seasoning better hone ki zaroorat hai."
    ],
    phrases_hindi: [
      "खाने में स्वाद कुछ फीका महसूस हुआ।",
      "मसालों और प्रामाणिक स्वाद की कुछ कमी लगी।",
      "स्वाद अपेक्षा के अनुरूप उतना खास नहीं रहा।",
      "व्यंजनों में मसालों का संतुलन और बेहतर होना चाहिए।"
    ],
    phrases_mr: [
      "जेवणात चव थोडी अळणी किंवा कमी वाटली.",
      "मसाल्यांचे प्रमाण आणि चव अपेक्षेनुसार जमली नाही.",
      "अन्नाची चव अपेक्षेपेक्षा काहीशी फिकी जाणवली.",
      "चवीमध्ये अधिक सुधारणा करण्याची गरज वाटते."
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
      "Kitchen turnaround time could definitely improve."
    ],
    phrases_hi: [
      "Order serve hone mein kaafi time laga.",
      "Service speed thodi slow mehsoos hui.",
      "Table par food aane mein lamba wait mila.",
      "Kitchen speed aur service fast honi chahiye."
    ],
    phrases_hinglish: [
      "Order serve hone mein kaafi time laga.",
      "Service speed thodi slow mehsoos hui.",
      "Table par food aane mein lamba wait mila.",
      "Kitchen speed aur service fast honi chahiye."
    ],
    phrases_hindi: [
      "ऑर्डर टेबल पर आने में काफी लंबा समय लग गया।",
      "सर्विस की गति थोड़ी धीमी महसूस हुई।",
      "स्टाफ का रिस्पॉन्स टाइम कुछ धीमा रहा।",
      "किचन और सर्विस के बीच तालमेल और तेज होना चाहिए।"
    ],
    phrases_mr: [
      "ऑर्डर मिळण्यास बराच वेळ लागला.",
      "सेवेचा वेग थोडा संथ जाणवला.",
      "टेबलावर जेवण येण्यासाठी जास्त वाट पाहावी लागली.",
      "ऑर्डर देण्याच्या वेळेत सुधारणा होणे गरजेचे आहे."
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
      "Temperature of the dishes was not hot enough."
    ],
    phrases_hi: [
      "Khana garam serve nahi hua.",
      "Dishes thandi serve hone se maza kam hua.",
      "Food fresh aur hot serve hona chahiye.",
      "Temperature proper na hone se experience effect hua."
    ],
    phrases_hinglish: [
      "Khana garam serve nahi hua.",
      "Dishes thandi serve hone se maza kam hua.",
      "Food fresh aur hot serve hona chahiye.",
      "Temperature proper na hone se experience effect hua."
    ],
    phrases_hindi: [
      "खाना सही तापमान पर गर्म सर्व नहीं किया गया।",
      "व्यंजन ठंडे आने से खाने का स्वाद प्रभावित हुआ।",
      "खाना गरमा-गरम परोसा जाना चाहिए था।",
      "सर्विंग के समय खाने का तापमान उचित नहीं रहा।"
    ],
    phrases_mr: [
      "जेवण गरम वाढले गेले नाही.",
      "पदार्थ थंड आल्यामुळे चवीचा आनंद कमी झाला.",
      "अन्न गरमागरम मिळणे अपेक्षित होते.",
      "जेवणाचे तापमान योग्य नव्हते."
    ],
  },
  {
    id: "rest_flavour_balance",
    label: "Flavours well balanced",
    sentiment: "positive",
    phrases_en: [
      "The flavours were really well balanced.",
      "Taste and seasoning were spot on.",
      "Every dish had distinct, balanced flavours.",
      "Loved how well balanced and flavorful everything tasted."
    ],
    phrases_hi: [
      "Flavours ka balance kaafi badhiya laga.",
      "Taste aur seasoning bilkul sahi lagi.",
      "Har dish ka taste kaafi balanced mila.",
      "Food ka swaad aur flavour balance kaafi pasand laga."
    ],
    phrases_hinglish: [
      "Flavours ka balance kaafi badhiya laga.",
      "Taste aur seasoning bilkul sahi lagi.",
      "Har dish ka taste kaafi balanced mila.",
      "Food ka swaad aur flavour balance kaafi pasand laga."
    ],
    phrases_hindi: [
      "व्यंजनों में मसालों और स्वाद का संतुलन बहुत बढ़िया था।",
      "हर डिश का स्वाद काफी संतुलित और लाजवाब रहा।",
      "खाने का स्वाद और संतुलन बेहद पसंद आया।",
      "स्वाद में ताजगी और सही संतुलन देखने को मिला।"
    ],
    phrases_mr: [
      "जेवणातील चव आणि मसाल्यांचे प्रमाण अतिशय चपखल होते.",
      "प्रत्येक पदार्थाची चव अतिशय संतुलित आणि रुचकर लागली.",
      "स्वाद आणि ताजगीचा उत्तम मेळ अनुभवायला मिळाला.",
      "जेवणाची चव मनापासून आवडली."
    ],
  },
  {
    id: "rest_menu_variety",
    label: "Good menu variety",
    sentiment: "positive",
    phrases_en: [
      "The menu offered a really good variety of options.",
      "Great selection of dishes on the menu.",
      "Plenty of choices available across different categories.",
      "Diverse menu with something for everyone."
    ],
    phrases_hi: [
      "Menu mein kaafi achhe options dekhne ko mile.",
      "Dishes ki variety kaafi achhi mili.",
      "Menu selection kaafi diverse aur interesting laga.",
      "Kaafi saare options available mile."
    ],
    phrases_hinglish: [
      "Menu mein kaafi achhe options dekhne ko mile.",
      "Dishes ki variety kaafi achhi mili.",
      "Menu selection kaafi diverse aur interesting laga.",
      "Kaafi saare options available mile."
    ],
    phrases_hindi: [
      "मेनू में विकल्पों की बहुत अच्छी विविधता उपलब्ध थी।",
      "हर तरह के स्वाद के लिए मेनू में बेहतरीन विकल्प मिले।",
      "खाने के विकल्पों का चयन काफी विस्तृत और आकर्षक था।",
      "मेनू में विविधता देखकर काफी अच्छा लगा।"
    ],
    phrases_mr: [
      "मेनूमध्ये पदार्थांचे भरपूर आणि उत्तम पर्याय उपलब्ध होते.",
      "वेगवेगळ्या चवींच्या पदार्थांची छान विविधता पाहायला मिळाली.",
      "मेनूचे नियोजन अतिशय विस्तृत आणि आकर्षक वाटले.",
      "निवडीसाठी अनेक रुचकर पर्याय उपलब्ध होते."
    ],
  },
  {
    id: "rest_staff_recommend",
    label: "Staff helped with recommendations",
    sentiment: "positive",
    phrases_en: [
      "Staff was very helpful with menu recommendations.",
      "The team suggested some great dishes.",
      "Appreciated the thoughtful food recommendations from the staff.",
      "Staff guided us well on what to order."
    ],
    phrases_hi: [
      "Staff ne menu recommendations mein kaafi help kiya.",
      "Service team ne kaafi achhe dishes suggest kiye.",
      "Staff ka guidance order choose karne mein kaafi helpful laga.",
      "Dishes suggest karne mein staff kaafi attentive mila."
    ],
    phrases_hinglish: [
      "Staff ne menu recommendations mein kaafi help kiya.",
      "Service team ne kaafi achhe dishes suggest kiye.",
      "Staff ka guidance order choose karne mein kaafi helpful laga.",
      "Dishes suggest karne mein staff kaafi attentive mila."
    ],
    phrases_hindi: [
      "स्टाफ ने मेनू से डिश चुनने में बहुत अच्छी सलाह दी।",
      "सर्विस टीम के सुझाव काफी उपयोगी और सही साबित हुए।",
      "स्टाफ का विनम्र मार्गदर्शन काफी सराहनीय रहा।",
      "सुझाए गए व्यंजन वाकई बहुत स्वादिष्ट निकले।"
    ],
    phrases_mr: [
      "कर्मचाऱ्यांनी मेनूमधील उत्तम पदार्थांची योग्य माहिती दिली.",
      "स्टाफने सुचवलेले पदार्थ चवीला अतिशय अप्रतिम होते.",
      "कर्मचाऱ्यांचे नम्र आणि उपयुक्त मार्गदर्शन खूप भावले.",
      "ऑर्डर करताना मिळालेले सहकार्य कौतुकास्पद होते."
    ],
  },
  {
    id: "rest_comfortable_dining",
    label: "Comfortable place for a meal",
    sentiment: "positive",
    phrases_en: [
      "Comfortable and welcoming space for a meal.",
      "The seating and environment made for a pleasant meal.",
      "Very relaxed and cozy dining setup.",
      "Great atmosphere for enjoying food with ease."
    ],
    phrases_hi: [
      "Dining ka space kaafi comfortable aur pleasant laga.",
      "Khane ke liye kaafi relaxed aur welcoming ambiance mila.",
      "Seating aur comfort level kaafi achha laga.",
      "Baithene aur khana enjoy karne ke liye badhiya jagah lagi."
    ],
    phrases_hinglish: [
      "Dining ka space kaafi comfortable aur pleasant laga.",
      "Khane ke liye kaafi relaxed aur welcoming ambiance mila.",
      "Seating aur comfort level kaafi achha laga.",
      "Baithene aur khana enjoy karne ke liye badhiya jagah lagi."
    ],
    phrases_hindi: [
      "आराम से बैठकर भोजन का आनंद लेने के लिए बेहतरीन स्थान है।",
      "बैठने की व्यवस्था और शांत वातावरण काफी सुखद रहा।",
      "डाइनिंग स्पेस काफी स्वच्छ, आरामदायक और सुकून भरा लगा।",
      "परिवार और दोस्तों के साथ भोजन के लिए उपयुक्त माहौल मिला।"
    ],
    phrases_mr: [
      "शांततेत आणि आरामात जेवणाचा आनंद घेण्यासाठी उत्तम जागा.",
      "बैठक व्यवस्था आणि एकूण वातावरण अतिशय आल्हाददायक होते.",
      "स्वच्छ आणि आरामदायी डाइनिंगचा सुखद अनुभव आला.",
      "भोजन अधिक आनंददायी बनवणारे छान वातावरण लाभले."
    ],
  },
  {
    id: "rest_order_accurate",
    label: "Order prepared as requested",
    sentiment: "positive",
    phrases_en: [
      "The order was prepared exactly as requested.",
      "Special dietary preferences were followed carefully.",
      "Order instructions were handled accurately.",
      "Everything was made just the way we asked."
    ],
    phrases_hi: [
      "Order bilkul waise hi prepare hua jaise requested mila.",
      "Special instructions ka pura dhyan rakha mila.",
      "Food preparation instructions ke hisab se exact mila.",
      "Custom requests acche se follow kiye gaye."
    ],
    phrases_hinglish: [
      "Order bilkul waise hi prepare hua jaise requested mila.",
      "Special instructions ka pura dhyan rakha mila.",
      "Food preparation instructions ke hisab se exact mila.",
      "Custom requests acche se follow kiye gaye."
    ],
    phrases_hindi: [
      "ऑर्डर बिल्कुल दिए गए निर्देशों के अनुसार तैयार किया गया।",
      "खास पसंद और सुझावों का पूरा ध्यान रखा गया।",
      "खाने की तैयारी में दिए गए विवरण का सटीक पालन हुआ।",
      "अनुरोध के अनुसार बिल्कुल सही डिश परोसी गई।"
    ],
    phrases_mr: [
      "सांगितल्यानुसार अगदी तंतोतंत ऑर्डर तयार करून मिळाली.",
      "खास सूचनांची आणि आवडीनिवडीची पूर्ण काळजी घेतली गेली.",
      "ऑर्डरच्या सूचनांचे अचूक पालन झालेले दिसले.",
      "अपेक्षेनुसार उत्तम जेवण तयार करून मिळाले."
    ],
  },
  {
    id: "rest_takeaway_pack",
    label: "Takeaway packed properly",
    sentiment: "positive",
    phrases_en: [
      "Takeaway was packed neatly and securely.",
      "Packaging was spill-proof and kept the food warm.",
      "Carefully packed parcel with everything included.",
      "Clean, sturdy food packaging for takeaway."
    ],
    phrases_hi: [
      "Takeaway packing kaafi neat aur secure mili.",
      "Food packaging spill-proof aur hygienic lagi.",
      "Parcel kaafi acche se pack kiya mila.",
      "Khana bilkul intact aur warm deliver hua."
    ],
    phrases_hinglish: [
      "Takeaway packing kaafi neat aur secure mili.",
      "Food packaging spill-proof aur hygienic lagi.",
      "Parcel kaafi acche se pack kiya mila.",
      "Khana bilkul intact aur warm deliver hua."
    ],
    phrases_hindi: [
      "पार्सल की पैकिंग बेहद सुरक्षित और साफ-सुथरी थी।",
      "पैकेजिंग में खाने के बिखरने की कोई गुंजाइश नहीं रही।",
      "टेकअवे की मजबूत और स्वच्छ पैकिंग देखकर खुशी हुई।",
      "खाना पूरी तरह सुरक्षित और गर्म स्थिति में मिला।"
    ],
    phrases_mr: [
      "पार्सलचे पॅकिंग अतिशय व्यवस्थित आणि सुरक्षित होते.",
      "अन्न सांडणार नाही अशा दर्जेदार पॅकेजिंगचा वापर केला होता.",
      "पार्सल स्वच्छ आणि गरम अवस्थेत मिळाले.",
      "टेकअवे सेवेतील नेटकेपणा आणि काळजी मनाला भावली."
    ],
  },
  {
    id: "rest_warm_served",
    label: "Food served warm",
    sentiment: "positive",
    phrases_en: [
      "Food was served fresh and piping hot.",
      "Everything reached the table at the right temperature.",
      "Dishes were served hot and fresh from the kitchen.",
      "Loved having the food served promptly while warm."
    ],
    phrases_hi: [
      "Khana bilkul garam aur fresh serve hua.",
      "Table par khana bilkul sahi temperature par mila.",
      "Kitchen se fresh aur hot dishes serve huye.",
      "Garma-garam khane ka swaad kaafi badhiya laga."
    ],
    phrases_hinglish: [
      "Khana bilkul garam aur fresh serve hua.",
      "Table par khana bilkul sahi temperature par mila.",
      "Kitchen se fresh aur hot dishes serve huye.",
      "Garma-garam khane ka swaad kaafi badhiya laga."
    ],
    phrases_hindi: [
      "भोजन बिल्कुल गरमा-गरम और ताजा परोसा गया।",
      "हर व्यंजन सही तापमान पर टेबल पर पहुंचा।",
      "रसोई से सीधा ताजा और गर्म खाना मिला।",
      "गरमा-गरम परोसे गए भोजन का स्वाद लाजवाब था।"
    ],
    phrases_mr: [
      "जेवण अगदी गरमागरम आणि ताजे वाढले गेले.",
      "पदार्थ योग्य तापमानात टेबलवर आणून दिले गेले.",
      "ताज्या आणि गरम जेवणाची चव अप्रतिम लागली.",
      "त्वरित आणि गरमागरम वाढण्याची पद्धत आवडली."
    ],
  },
  {
    id: "rest_clean_tables",
    label: "Clean dining area",
    sentiment: "positive",
    phrases_en: [
      "Dining area and tables were spotless and clean.",
      "High hygiene standards across the dining space.",
      "Clean tables, cutlery, and comfortable seating.",
      "Very neat and well-maintained eating space."
    ],
    phrases_hi: [
      "Dining area aur tables bilkul clean aur neat mile.",
      "Hygiene standards kaafi achhe maintain kiye huye hain.",
      "Tables aur seating area kaafi saaf-suthra mila.",
      "Safai aur cleanliness kaafi acchi dekhne ko mili."
    ],
    phrases_hinglish: [
      "Dining area aur tables bilkul clean aur neat mile.",
      "Hygiene standards kaafi achhe maintain kiye huye hain.",
      "Tables aur seating area kaafi saaf-suthra mila.",
      "Safai aur cleanliness kaafi acchi dekhne ko mili."
    ],
    phrases_hindi: [
      "डाइनिंग एरिया और टेबल पूरी तरह स्वच्छ और व्यवस्थित थे।",
      "सफाई और स्वच्छता के मानकों का बहुत अच्छा ध्यान रखा गया।",
      "साफ टेबल और स्वच्छ बर्तनों का उपयोग देखने को मिला।",
      "भोजन क्षेत्र का रखरखाव काफी उच्च कोटि का था।"
    ],
    phrases_mr: [
      "डाइनिंग एरिया आणि टेबल अतिशय स्वच्छ आणि नीटनेटके होते.",
      "स्वच्छतेच्या नियमांचे उत्तम पालन केलेले दिसले.",
      "टेबल आणि भांडी अतिशय चकचकीत आणि स्वच्छ होती.",
      "परिसराची स्वच्छता मनाला समाधान देणारी ठरली."
    ],
  },
  {
    id: "rest_refreshing_drinks",
    label: "Great beverage options",
    sentiment: "positive",
    phrases_en: [
      "Great selection of refreshing drinks and beverages.",
      "Drinks complemented the food perfectly.",
      "Beverages were well-prepared and refreshing.",
      "Loved the drink menu options available."
    ],
    phrases_hi: [
      "Beverages aur drinks ka selection kaafi refreshing laga.",
      "Drinks food ke saath kaafi acche se complement huye.",
      "Drink options kaafi fresh aur well prepared mile.",
      "Refreshing drinks ka taste kaafi badhiya laga."
    ],
    phrases_hinglish: [
      "Beverages aur drinks ka selection kaafi refreshing laga.",
      "Drinks food ke saath kaafi acche se complement huye.",
      "Drink options kaafi fresh aur well prepared mile.",
      "Refreshing drinks ka taste kaafi badhiya laga."
    ],
    phrases_hindi: [
      "पेय पदार्थों और ड्रिंक्स का चयन काफी ताजगी भरा था।",
      "ड्रिंक्स ने भोजन के स्वाद को और भी बढ़ा दिया।",
      "ताजा और सुरुचिपूर्ण पेय उपलब्ध कराए गए।",
      "बेवरेज ऑप्शन्स का स्वाद बहुत ही उमदा रहा।"
    ],
    phrases_mr: [
      "पेयांचे पर्याय अतिशय ताजेतवाने आणि उत्तम दर्जाचे होते.",
      "ड्रिंक्सने जेवणाची लज्जत आणखी वाढवली.",
      "विविध प्रकारच्या छान पेयांची उपलब्धता होती.",
      "पेयांचा स्वाद आणि ताजेपणा खूप आवडला."
    ],
  },
  {
    id: "rest_desserts",
    label: "Enjoyable desserts",
    sentiment: "positive",
    phrases_en: [
      "Desserts were delicious and rounded off the meal nicely.",
      "The sweet options were fresh and very satisfying.",
      "Great dessert choices to end the meal.",
      "Desserts were well-made and not overly sweet."
    ],
    phrases_hi: [
      "Desserts ka taste kaafi delicious aur satisfying laga.",
      "Meethe ke options kaafi fresh aur badhiya mile.",
      "Meal end karne ke liye desserts kaafi perfect lage.",
      "Dessert preparation aur presentation kaafi achha laga."
    ],
    phrases_hinglish: [
      "Desserts ka taste kaafi delicious aur satisfying laga.",
      "Meethe ke options kaafi fresh aur badhiya mile.",
      "Meal end karne ke liye desserts kaafi perfect lage.",
      "Dessert preparation aur presentation kaafi achha laga."
    ],
    phrases_hindi: [
      "डेज़र्ट्स बहुत स्वादिष्ट थे और भोजन का बेहतरीन अंत किया।",
      "मीठे के विकल्प ताजे और मन को तृप्त करने वाले रहे।",
      "डेज़र्ट्स की बनावट और स्वाद बेहद संतुलित था।",
      "भोजन के बाद मीठे का अनुभव बहुत ही आनंददायक रहा।"
    ],
    phrases_mr: [
      "गोड पदार्थ अतिशय चविष्ट आणि जेवणाचा गोड शेवट करणारे ठरले.",
      "डेझर्टचे पर्याय ताजे आणि मनाला तृप्त करणारे होते.",
      "गोड पदार्थांची चव अतिशय संतुलित आणि अप्रतिम होती.",
      "डेझर्टची चव दीर्घकाळ लक्षात राहण्यासारखी होती."
    ],
  }
];

// ─── 4. Healthcare & Clinic Chips ───────────────────────────────────────────

export const CLINIC_CHIPS = [
  {
    id: "clinic_attentive",
    label: "Attentive doctor",
    sentiment: "positive",
    phrases_en: [
      "The doctor listened very attentively to all concerns.",
      "Very patient and understanding during the consultation.",
      "Explained the diagnosis clearly without rushing.",
      "Felt genuinely heard and well taken care of."
    ],
    phrases_hi: [
      "Doctor ne sabhi baatein dhyan se suni.",
      "Consultation ke dauran kaafi patience dekhne ko mila.",
      "Diagnosis kaafi clearly aur simply explain kiya.",
      "Caring aur attentive consultation mila."
    ],
    phrases_hinglish: [
      "Doctor ne sabhi baatein dhyan se suni.",
      "Consultation ke dauran kaafi patience dekhne ko mila.",
      "Diagnosis kaafi clearly aur simply explain kiya.",
      "Caring aur attentive consultation mila."
    ],
    phrases_hindi: [
      "डॉक्टर ने सभी परेशानियों को बहुत ध्यान और धैर्य से सुना।",
      "परामर्श के दौरान बीमारी और समाधान को सरलता से समझाया गया।",
      "डॉक्टर का व्यवहार अत्यंत संवेदनशील और सहयोगी रहा।",
      "सही मार्गदर्शन और तसल्ली से परामर्श प्राप्त हुआ।"
    ],
    phrases_mr: [
      "डॉक्टरांनी सर्व तक्रारी अतिशय काळजीपूर्वक आणि शांतपणे ऐकून घेतल्या.",
      "तपासणीदरम्यान आजाराचे निदान सोप्या भाषेत समजावून सांगितले.",
      "अतिशय आदरयुक्त आणि धीर देणारे वर्तन लाभले.",
      "योग्य आणि काळजीपूर्वक वैद्यकीय सल्ला मिळाला."
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
      "Detailed assessment and trustworthy medical advice."
    ],
    phrases_hi: [
      "Check-up kaafi thorough aur detailed mila.",
      "Proper guidance aur diagnosis mila.",
      "Medical advice trustworthy aur clear lagi.",
      "Step-by-step examination kaafi satisfying laga."
    ],
    phrases_hinglish: [
      "Check-up kaafi thorough aur detailed mila.",
      "Proper guidance aur diagnosis mila.",
      "Medical advice trustworthy aur clear lagi.",
      "Step-by-step examination kaafi satisfying laga."
    ],
    phrases_hindi: [
      "जांच पूरी तरह से गहन और व्यवस्थित रही।",
      "मूल कारणों को समझकर सटीक चिकित्सीय सलाह दी गई।",
      "शुरुआत से अंत तक बहुत ही तसल्लीबख्श चेक-अप मिला।",
      "सटीक जांच और विश्वसनीय मार्गदर्शन प्राप्त हुआ।"
    ],
    phrases_mr: [
      "तपासणी अतिशय सविस्तर आणि काळजीपूर्वक झाली.",
      "मुळापासून कारणांचा शोध घेऊन अचूक सल्ला दिला गेला.",
      "सुरुवातीपासून शेवटपर्यंत समाधानकारक तपासणी झाली.",
      "विश्वासार्ह आणि तपशीलवार वैद्यकीय मार्गदर्शन लाभले."
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
      "Clean, orderly, and comfortable clinical setup."
    ],
    phrases_hi: [
      "Clinic ka setup bilkul clean aur hygienic mila.",
      "Sanitation aur cleanliness ka achha level mila.",
      "Waiting area neat aur comfortable laga.",
      "Hygienic aur peaceful clinic environment mila."
    ],
    phrases_hinglish: [
      "Clinic ka setup bilkul clean aur hygienic mila.",
      "Sanitation aur cleanliness ka achha level mila.",
      "Waiting area neat aur comfortable laga.",
      "Hygienic aur peaceful clinic environment mila."
    ],
    phrases_hindi: [
      "क्लिनिक का माहौल पूरी तरह शांत, स्वच्छ और सैनिटाइज रहा।",
      "चिकित्सीय स्वच्छता के उच्च मानकों का पालन दिखा।",
      "वेटिंग एरिया और केबिन पूरी तरह सुव्यवस्थित मिले।",
      "स्वच्छ और सुरक्षित क्लीनिकल वातावरण मिला।"
    ],
    phrases_mr: [
      "क्लिनिक अतिशय स्वच्छ, शांत आणि निर्जंतुक आढळले.",
      "वैद्यकीय स्वच्छतेचे योग्य नियम पाळले गेले.",
      "प्रतीक्षा कक्ष आणि डॉक्टरांची केबिन व्यवस्थित होती.",
      "सुरक्षित आणि स्वच्छ आरोग्यदायी वातावरण अनुभवले."
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
      "Prompt consultation without long queue delays."
    ],
    phrases_hi: [
      "Appointment time par consultation shuru hua.",
      "Punctuality kaafi achhi mili, bina delay consultation hua.",
      "Bina zyada intezaar ke doctor se milna hua.",
      "Schedule management kaafi organized laga."
    ],
    phrases_hinglish: [
      "Appointment time par consultation shuru hua.",
      "Punctuality kaafi achhi mili, bina delay consultation hua.",
      "Bina zyada intezaar ke doctor se milna hua.",
      "Schedule management kaafi organized laga."
    ],
    phrases_hindi: [
      "अपॉइंटमेंट के समय पर ही परामर्श शुरू हो गया।",
      "समय की पाबंदी बहुत अच्छी रही, बिना फालतू इंतजार के परामर्श मिला।",
      "कतार प्रबंधन बहुत ही व्यवस्थित रहा।",
      "समय पर डॉक्टर से मिलना हुआ, बहुत संतोषजनक रहा।"
    ],
    phrases_mr: [
      "अपॉइंटमेंटच्या वेळेतच तपासणी सुरू झाली.",
      "वेळेचे अचूक नियोजन असल्यामुळे जास्त थांबावे लागले नाही.",
      "रांगेचे व्यवस्थापन अतिशय सुरळीत होते.",
      "वेळेवर सल्ला मिळाल्यामुळे वेळेची बचत झाली."
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
      "Could have used a more relaxed and detailed discussion."
    ],
    phrases_hi: [
      "Consultation thoda rushed aur jaldi mein laga.",
      "Doubts clear karne ke liye thoda aur time chahiye.",
      "Questions discuss karne mein thodi jaldi mehsoos hui.",
      "Doctor se aur detail discussion expect kiya."
    ],
    phrases_hinglish: [
      "Consultation thoda rushed aur jaldi mein laga.",
      "Doubts clear karne ke liye thoda aur time chahiye.",
      "Questions discuss karne mein thodi jaldi mehsoos hui.",
      "Doctor se aur detail discussion expect kiya."
    ],
    phrases_hindi: [
      "परामर्श में कुछ जल्दबाजी महसूस हुई।",
      "सवालों और शंकाओं के समाधान के लिए थोड़ा और समय मिलना चाहिए था।",
      "बातचीत जल्दी समाप्त हो गई, पूर्ण विवरण नहीं मिल सका।",
      "थोड़ा और तसल्ली से परामर्श अपेक्षित रहा।"
    ],
    phrases_mr: [
      "तपासणी काहीशी घाईगडबडीत झाली असे वाटले.",
      "शंकांचे निरसन करण्यासाठी आणखी थोडा वेळ मिळायला हवा होता.",
      "सल्ला लवकर संपला, सविस्तर चर्चा होऊ शकली नाही.",
      "अधिक निवांतपणे बोलणे अपेक्षित होते."
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
      "Extremely long wait before being called in."
    ],
    phrases_hi: [
      "Appointment time ke baad bhi lamba wait mila.",
      "Waiting area mein delay kaafi zyada laga.",
      "Queue management better hone ki zaroorat hai.",
      "Consultation ke liye kaafi der intezaar karna pada."
    ],
    phrases_hinglish: [
      "Appointment time ke baad bhi lamba wait mila.",
      "Waiting area mein delay kaafi zyada laga.",
      "Queue management better hone ki zaroorat hai.",
      "Consultation ke liye kaafi der intezaar karna pada."
    ],
    phrases_hindi: [
      "अपॉइंटमेंट के समय के बाद भी बहुत देर इंतजार करना पड़ा।",
      "वेटिंग एरिया में काफी भीड़ और देरी रही।",
      "कतार और समय प्रबंधन में सुधार की बहुत आवश्यकता है।",
      "डॉक्टर के पास जाने से पहले काफी समय व्यतीत हो गया।"
    ],
    phrases_mr: [
      "अपॉइंटमेंटची वेळ उलटून गेल्यानंतरही बराच वेळ थांबावे लागले.",
      "प्रतीक्षा कक्षात गर्दी आणि जास्त वेळ गेला.",
      "नंबरच्या नियोजनात सुधारणा होण्याची गरज आहे.",
      "तपासणीसाठी खूप वेळ प्रतीक्षा करावी लागली."
    ],
  },
  {
    id: "clinic_appoint_process",
    label: "Clear appointment process",
    sentiment: "positive",
    phrases_en: [
      "The appointment booking process was clear and smooth.",
      "Easy scheduling with prompt confirmation.",
      "Straightforward appointment setup without hassle.",
      "Booking was organized and well coordinated."
    ],
    phrases_hi: [
      "Appointment booking process kaafi clear aur smooth laga.",
      "Scheduling aasan lagi aur quick confirmation mila.",
      "Bina kisi hassle ke appointment setup complete mila.",
      "Booking coordination kaafi organized laga."
    ],
    phrases_hinglish: [
      "Appointment booking process kaafi clear aur smooth laga.",
      "Scheduling aasan lagi aur quick confirmation mila.",
      "Bina kisi hassle ke appointment setup complete mila.",
      "Booking coordination kaafi organized laga."
    ],
    phrases_hindi: [
      "अपॉइंटमेंट लेने की प्रक्रिया बहुत स्पष्ट और सरल रही।",
      "त्वरित पुष्टि के साथ आसानी से समय तय हुआ।",
      "बिना किसी परेशानी के अपॉइंटमेंट मिल गई।",
      "बुकिंग और समन्वय काफी व्यवस्थित देखने को मिला।"
    ],
    phrases_mr: [
      "अपॉइंटमेंट घेण्याची प्रक्रिया अतिशय सोपी आणि स्पष्ट होती.",
      "त्वरित खात्रीसह वेळेचे नियोजन सहज झाले.",
      "कोणत्याही अडचणीशिवाय वेळ निश्चित करता आली.",
      "नोंदणी आणि नियोजन अतिशय शिस्तबद्ध होते."
    ],
  },
  {
    id: "clinic_instructions_clear",
    label: "Instructions explained properly",
    sentiment: "positive",
    phrases_en: [
      "Post-consultation instructions were explained properly.",
      "Clear advice given on precautions and daily care.",
      "Treatment instructions were easy to understand and follow.",
      "Doctor clearly outlined what to do next."
    ],
    phrases_hi: [
      "Care aur precautions acche se samjhaye gaye.",
      "Instructions bilkul clear aur easy to follow lage.",
      "Next steps ka guidance kaafi acche se mila.",
      "Doctor ne sari guidelines clear batai."
    ],
    phrases_hinglish: [
      "Care aur precautions acche se samjhaye gaye.",
      "Instructions bilkul clear aur easy to follow lage.",
      "Next steps ka guidance kaafi acche se mila.",
      "Doctor ne sari guidelines clear batai."
    ],
    phrases_hindi: [
      "परामर्श के बाद के निर्देश बहुत अच्छी तरह समझाए गए।",
      "सावधानियों और दैनिक देखभाल पर स्पष्ट सलाह मिली।",
      "उपचार के निर्देशों को समझना और पालन करना आसान रहा।",
      "डॉक्टर ने आगे की प्रक्रिया बहुत स्पष्ट रूप से बताई।"
    ],
    phrases_mr: [
      "तपासणीनंतरच्या सूचना अतिशय व्यवस्थित समजावून सांगितल्या.",
      "काळजी आणि पथ्ये याविषयी स्पष्ट मार्गदर्शन मिळाले.",
      "उपचारांचे नियम समजून घेणे आणि पाळणे सोपे झाले.",
      "डॉक्टरांनी पुढील पायऱ्या स्पष्टपणे समजावल्या."
    ],
  },
  {
    id: "clinic_questions_answered",
    label: "Questions addressed",
    sentiment: "positive",
    phrases_en: [
      "All health questions were addressed with patience.",
      "Doctor took time to resolve all my doubts.",
      "Every question was answered clearly and politely.",
      "Appreciated having my concerns answered thoroughly."
    ],
    phrases_hi: [
      "Saare health doubts patience ke saath clear huye.",
      "Doctor ne har question ka clear answer diya.",
      "Doubts acche se address kiye gaye.",
      "Questions poochhne par helpful clarity mili."
    ],
    phrases_hinglish: [
      "Saare health doubts patience ke saath clear huye.",
      "Doctor ne har question ka clear answer diya.",
      "Doubts acche se address kiye gaye.",
      "Questions poochhne par helpful clarity mili."
    ],
    phrases_hindi: [
      "स्वास्थ्य से जुड़े सभी सवालों के जवाब बहुत धैर्य से मिले।",
      "डॉक्टर ने सभी शंकाओं का समाधान करने के लिए समय दिया।",
      "हर प्रश्न का उत्तर स्पष्टता और विनम्रता से दिया गया।",
      "अपनी सभी चिंताओं का स्पष्ट समाधान पाकर संतुष्टि हुई।"
    ],
    phrases_mr: [
      "आरोग्याविषयीच्या सर्व प्रश्नांची उत्तरे अतिशय संयमाने मिळाली.",
      "डॉक्टरांनी प्रत्येक शंकेचे काळजीपूर्वक निरसन केले.",
      "सर्व शंकांचे स्पष्ट आणि समाधानकारक उत्तर मिळाले.",
      "प्रश्नांना मिळालेले योग्य उत्तर खूप दिलासा देणारे ठरले."
    ],
  },
  {
    id: "clinic_polite_staff",
    label: "Staff communicated politely",
    sentiment: "positive",
    phrases_en: [
      "Reception and nursing staff communicated very politely.",
      "Courteous and supportive communication from the team.",
      "Helpful front desk staff that assisted with paperwork.",
      "Staff was polite, respectful, and attentive."
    ],
    phrases_hi: [
      "Reception aur nursing staff kaafi politely communicate karta mila.",
      "Staff ka behavior supportive aur respectful laga.",
      "Paperwork aur guidance mein staff helpful laga.",
      "Polite aur courteous interaction dekhne ko mila."
    ],
    phrases_hinglish: [
      "Reception aur nursing staff kaafi politely communicate karta mila.",
      "Staff ka behavior supportive aur respectful laga.",
      "Paperwork aur guidance mein staff helpful laga.",
      "Polite aur courteous interaction dekhne ko mila."
    ],
    phrases_hindi: [
      "रिसेप्शन और नर्सिंग स्टाफ ने बहुत विनम्रता से बातचीत की।",
      "पूरी टीम का संवाद बहुत ही मददगार और आदरपूर्ण रहा।",
      "कागजी कार्रवाई और मार्गदर्शन में पूरा सहयोग मिला।",
      "कर्मचारियों का व्यवहार बहुत ही शिष्ट और सहयोगी था।"
    ],
    phrases_mr: [
      "स्वागत कक्ष आणि परिचारिकांचे वर्तन अतिशय नम्र होते.",
      "सर्व कर्मचाऱ्यांचा संवाद अतिशय आदरयुक्त आणि सहकार्याचा होता.",
      "नोंदणी आणि कागदपत्रांच्या कामात उत्तम मदत मिळाली.",
      "कर्मचाऱ्यांची नम्रता मनाला समाधान देणारी ठरली."
    ],
  },
  {
    id: "clinic_organised_waiting",
    label: "Organised waiting process",
    sentiment: "positive",
    phrases_en: [
      "The waiting area and token process were organized.",
      "Orderly patient queue management.",
      "Comfortable and systematic waiting room experience.",
      "Good organization in calling patients in turn."
    ],
    phrases_hi: [
      "Waiting area aur token process kaafi organized laga.",
      "Patient queue management systematic mila.",
      "Comfortable aur disciplined waiting space laga.",
      "Turn wise calling process acche se maintain hua."
    ],
    phrases_hinglish: [
      "Waiting area aur token process kaafi organized laga.",
      "Patient queue management systematic mila.",
      "Comfortable aur disciplined waiting space laga.",
      "Turn wise calling process acche se maintain hua."
    ],
    phrases_hindi: [
      "प्रतीक्षा कक्ष और टोकन की व्यवस्था बहुत व्यवस्थित थी।",
      "मरीजों की कतार का प्रबंधन बहुत ही अनुशासित रहा।",
      "आरामदायक और व्यवस्थित प्रतीक्षा का अनुभव मिला।",
      "क्रमबद्ध तरीके से बुलाने की प्रक्रिया बहुत अच्छी लगी।"
    ],
    phrases_mr: [
      "प्रतीक्षा कक्ष आणि टोकन व्यवस्था अत्यंत नियोजनबद्ध होती.",
      "रुग्णांच्या रांगेचे व्यवस्थापन अतिशय शिस्तबद्ध दिसले.",
      "आरामदायी आणि सुनियोजित वेटिंग एरिया होता.",
      "क्रमाप्रमाणे रुग्णांना बोलावण्याची पद्धत उत्तम वाटली."
    ],
  },
  {
    id: "clinic_doctor_listened",
    label: "Doctor listened attentively",
    sentiment: "positive",
    phrases_en: [
      "Doctor listened carefully without interrupting.",
      "Took detailed medical history with patience.",
      "Felt that my symptoms were taken seriously.",
      "Attentive listening before making recommendations."
    ],
    phrases_hi: [
      "Doctor ne bina interrupt kiye dhyan se suna.",
      "Medical history acche se note dekhne ko mili.",
      "Symptoms ko seriously aur dhyan se evaluate kiya.",
      "Attentive listening dekhne ko mili."
    ],
    phrases_hinglish: [
      "Doctor ne bina interrupt kiye dhyan se suna.",
      "Medical history acche se note dekhne ko mili.",
      "Symptoms ko seriously aur dhyan se evaluate kiya.",
      "Attentive listening dekhne ko mili."
    ],
    phrases_hindi: [
      "डॉक्टर ने बिना टोके पूरी बात बहुत ध्यान से सुनी।",
      "पिछली बीमारी और लक्षणों को बहुत धैर्य से समझा।",
      "लक्षणों को गंभीरता से लेकर सही सलाह दी गई।",
      "दवा लिखने से पहले पूरी बात सुनने का दृष्टिकोण सराहनीय था।"
    ],
    phrases_mr: [
      "डॉक्टरांनी मध्ये न थांबवता संपूर्ण तक्रार लक्षपूर्वक ऐकली.",
      "आरोग्याचा पूर्वेतिहास अतिशय संयमाने नोंदवून घेतला.",
      "लक्षणांची योग्य दखल घेऊन मार्गदर्शन केले गेले.",
      "प्रथम सविस्तर ऐकून घेण्याची पद्धत खूप आवडली."
    ],
  },
  {
    id: "clinic_treatment_discussed",
    label: "Treatment steps discussed",
    sentiment: "positive",
    phrases_en: [
      "Treatment plan was discussed transparently.",
      "Doctor walked me through the recovery expectations.",
      "Understood the course of treatment clearly.",
      "Clear discussion on diagnosis and next steps."
    ],
    phrases_hi: [
      "Treatment plan transparently discuss hua.",
      "Recovery process aur expectations clear samjhaye gaye.",
      "Course of treatment samajhne mein clarity mili.",
      "Treatment steps clearly explain kiye gaye."
    ],
    phrases_hinglish: [
      "Treatment plan transparently discuss hua.",
      "Recovery process aur expectations clear samjhaye gaye.",
      "Course of treatment samajhne mein clarity mili.",
      "Treatment steps clearly explain kiye gaye."
    ],
    phrases_hindi: [
      "उपचार योजना पर बहुत पारदर्शी तरीके से चर्चा की गई।",
      "ठीक होने की प्रक्रिया और समय की सही जानकारी मिली।",
      "उपचार के हर चरण को समझना बहुत आसान रहा।",
      "निदान और आगे के कदमों पर स्पष्ट मार्गदर्शन मिला।"
    ],
    phrases_mr: [
      "उपचार पद्धतीवर अतिशय पारदर्शकपणे चर्चा करण्यात आली.",
      "बरे होण्याच्या प्रक्रियेची योग्य कल्पना देण्यात आली.",
      "उपचारांचे नियोजन नीट समजून घेता आले.",
      "पुढील उपचारांची दिशा स्पष्ट झाल्यामुळे दिलासा मिळाला."
    ],
  },
  {
    id: "clinic_followup_guidance",
    label: "Clear follow-up guidance",
    sentiment: "positive",
    phrases_en: [
      "Follow-up timeline and schedule were clearly outlined.",
      "Good guidance on when to check back.",
      "Clear advice on monitoring symptoms at home.",
      "Reassuring follow-up instructions provided."
    ],
    phrases_hi: [
      "Follow-up schedule clearly bataya mila.",
      "Kab wapas aana hai uski clear guidance mili.",
      "Home monitoring ke guidelines acche se samjhaye gaye.",
      "Follow-up clarity se confidence bana."
    ],
    phrases_hinglish: [
      "Follow-up schedule clearly bataya mila.",
      "Kab wapas aana hai uski clear guidance mili.",
      "Home monitoring ke guidelines acche se samjhaye gaye.",
      "Follow-up clarity se confidence bana."
    ],
    phrases_hindi: [
      "फॉलो-अप का समय और तारीख बहुत स्पष्ट रूप से बताई गई।",
      "पुनः जांच के लिए कब आना है इसका सही मार्गदर्शन मिला।",
      "घर पर स्वास्थ्य की निगरानी के आसान निर्देश दिए गए।",
      "आश्वस्त करने वाला फॉलो-अप मार्गदर्शन मिला।"
    ],
    phrases_mr: [
      "पुन्हा कधी तपासणीसाठी यायचे याचे स्पष्ट नियोजन दिले.",
      "फॉलो-अपविषयी योग्य आणि वेळेवर माहिती मिळाली.",
      "घरी असताना कोणती काळजी घ्यावी हे समजावून सांगितले.",
      "फॉलो-अपच्या सूचनांमुळे मन निश्चिंत झाले."
    ],
  },
  {
    id: "clinic_gentle_care",
    label: "Gentle examination",
    sentiment: "positive",
    phrases_en: [
      "Examination was handled very gently and professionally.",
      "Doctor made sure I was comfortable during check-up.",
      "Considerate approach that minimized any discomfort.",
      "Gentle procedure with great care."
    ],
    phrases_hi: [
      "Examination kaafi gently aur professionally handle hua.",
      "Check-up ke dauraan comfort ka pura dhyan dekhne ko mila.",
      "Discomfort minimize karne ki careful approach mili.",
      "Gentle aur reassuring care dekhne ko mili."
    ],
    phrases_hinglish: [
      "Examination kaafi gently aur professionally handle hua.",
      "Check-up ke dauraan comfort ka pura dhyan dekhne ko mila.",
      "Discomfort minimize karne ki careful approach mili.",
      "Gentle aur reassuring care dekhne ko mili."
    ],
    phrases_hindi: [
      "जांच बहुत ही सौम्यता और पेशेवर तरीके से की गई।",
      "जांच के दौरान मरीज के आराम का पूरा ध्यान रखा गया।",
      "किसी भी प्रकार की असुविधा न हो इसका खास खयाल रखा गया।",
      "बहुत ही कोमल और आश्वस्त करने वाला अनुभव रहा।"
    ],
    phrases_mr: [
      "तपासणी अतिशय सौम्यतेने आणि काळजीपूर्वक केली गेली.",
      "तपासणीदरम्यान कोणताही त्रास होणार नाही याची काळजी घेतली.",
      "अतिशय हळुवार आणि आदरयुक्त वैद्यकीय सेवा मिळाली.",
      "रुग्णाच्या सोयीकडे दिलेले लक्ष खूप भावले."
    ],
  },
  {
    id: "clinic_clear_prescription",
    label: "Prescription explained well",
    sentiment: "positive",
    phrases_en: [
      "Prescription and dosage were explained very clearly.",
      "Doctor wrote out clear instructions for medications.",
      "Understood when and how to take each medicine.",
      "No confusion regarding prescription details."
    ],
    phrases_hi: [
      "Dawaiyon ki dosage aur timings clearly explain kiye gaye.",
      "Prescription bilkul clear aur easy to understand mila.",
      "Dawai lene ka schedule acche se samjhaya mila.",
      "Prescription details mein koi confusion nahi laga."
    ],
    phrases_hinglish: [
      "Dawaiyon ki dosage aur timings clearly explain kiye gaye.",
      "Prescription bilkul clear aur easy to understand mila.",
      "Dawai lene ka schedule acche se samjhaya mila.",
      "Prescription details mein koi confusion nahi laga."
    ],
    phrases_hindi: [
      "दवाओं की खुराक और समय बहुत स्पष्ट रूप से समझाए गए।",
      "प्रिस्क्रिप्शन में दवा लेने के निर्देश बिल्कुल साफ लिखे मिले।",
      "दवाइयां कब और कैसे लेनी हैं इसकी पूरी समझ दी गई।",
      "दवाओं के विवरण में कोई भ्रम नहीं रहा।"
    ],
    phrases_mr: [
      "औषधांचे प्रमाण आणि वेळा अतिशय स्पष्टपणे समजावून सांगितल्या.",
      "प्रिस्क्रिप्शनवरील सूचना वाचायला आणि समजायला सोप्या होत्या.",
      "औषधे कशी आणि केव्हा घ्यावीत याची योग्य माहिती मिळाली.",
      "औषधांच्या नियोजनात कोणताही गोंधळ राहिला नाही."
    ],
  }
];

// ─── 5. Retail & Shopping Chips ──────────────────────────────────────────────

export const RETAIL_CHIPS = [
  {
    id: "retail_variety",
    label: "Good variety",
    sentiment: "positive",
    phrases_en: [
      "Great variety of products to choose from.",
      "Impressive range of items in stock.",
      "Lots of good choices and diverse product selection.",
      "Found multiple great options matching my needs."
    ],
    phrases_hi: [
      "Products ki kaafi wide variety dekhne ko mila.",
      "Kaafi achha aur diverse collection mila.",
      "Har category mein kaafi options available lage.",
      "Variety aur options kaafi impressive lage."
    ],
    phrases_hinglish: [
      "Products ki kaafi wide variety dekhne ko mila.",
      "Kaafi achha aur diverse collection mila.",
      "Har category mein kaafi options available lage.",
      "Variety aur options kaafi impressive lage."
    ],
    phrases_hindi: [
      "सामानों की बहुत विस्तृत और बेहतरीन वैरायटी देखने को मिली।",
      "स्टॉक में कई अच्छे विकल्प उपलब्ध रहे।",
      "हर वर्ग के अनुसार भरपूर चॉइस मौजूद रही।",
      "पसंद के अनुसार कई उत्तम विकल्प आसानी से मिल गए।"
    ],
    phrases_mr: [
      "वस्तूंचे अनेक प्रकार आणि मोठी विविधता पाहायला मिळाली.",
      "दुकानात विविध प्रकारच्या वस्तूंचा साठा उपलब्ध होता.",
      "निवडीसाठी भरपूर आणि चांगले पर्याय मिळाले.",
      "गरजेनुसार अनेक उत्तम पर्याय सहज उपलब्ध झाले."
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
      "Great support and recommendations from staff."
    ],
    phrases_hi: [
      "Staff ne items dhundhne mein kaafi help ki.",
      "Sales team kaafi polite aur supportive lagi.",
      "Helpful staff ki wajah se shopping kaafi easy hui.",
      "Staff guidance aur recommendations helpful lage."
    ],
    phrases_hinglish: [
      "Staff ne items dhundhne mein kaafi help ki.",
      "Sales team kaafi polite aur supportive lagi.",
      "Helpful staff ki wajah se shopping kaafi easy hui.",
      "Staff guidance aur recommendations helpful lage."
    ],
    phrases_hindi: [
      "स्टाफ ने सामान चुनने और ढूंढने में काफी मदद की।",
      "सेल्स टीम का व्यवहार बहुत विनम्र और सहयोगी रहा।",
      "स्टाफ के सहयोग से खरीदारी बहुत आसान और सुखद रही।",
      "स्टाफ की जानकारी और सुझाव काफी उपयोगी साबित हुए।"
    ],
    phrases_mr: [
      "कर्मचाऱ्यांनी वस्तू शोधण्यात आणि निवडण्यात चांगली मदत केली.",
      "विक्री प्रतिनिधी अतिशय नम्र आणि सहकार्य करणारे होते.",
      "मदतनीस कर्मचाऱ्यांमुळे खरेदी अतिशय सोपी झाली.",
      "कर्मचाऱ्यांचे मार्गदर्शन आणि सहकार्य उपयुक्त ठरले."
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
      "Great build quality and finish on items."
    ],
    phrases_hi: [
      "Products genuine aur high quality ke lage.",
      "Purchased items ki quality top-class mili.",
      "Finishing aur durability kaafi achhi lagi.",
      "Quality standards bilkul reliable lage."
    ],
    phrases_hinglish: [
      "Products genuine aur high quality ke lage.",
      "Purchased items ki quality top-class mili.",
      "Finishing aur durability kaafi achhi lagi.",
      "Quality standards bilkul reliable lage."
    ],
    phrases_hindi: [
      "सामानों की गुणवत्ता पूरी तरह असली और उच्च कोटि की रही।",
      "टिकाऊ और प्रामाणिक उत्पाद मिले।",
      "खरीदे गए सामान की फिनिशिंग और स्तर से पूरा संतोष मिला।",
      "गुणवत्ता के मामले में उत्पाद पूरी तरह भरोसेमंद रहे।"
    ],
    phrases_mr: [
      "वस्तूंचा दर्जा अस्सल आणि उच्च दर्जाचा आढळला.",
      "उत्पादने टिकाऊ आणि चांगल्या बनावटीची आहेत.",
      "खरेदी केलेल्या मालाच्या गुणवत्तेबाबत पूर्ण समाधान वाटले.",
      "वस्तूंची फिनिशिंग आणि मजबुती उत्तम आहे."
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
      "Smooth shopping experience with well-arranged shelves."
    ],
    phrases_hi: [
      "Store ka arrangement neat aur well organized mila.",
      "Sections clearly marked hone se items easily mile.",
      "Aisle layout simple aur navigation convenient laga.",
      "Shopping experience kaafi easy aur systematic mila."
    ],
    phrases_hinglish: [
      "Store ka arrangement neat aur well organized mila.",
      "Sections clearly marked hone se items easily mile.",
      "Aisle layout simple aur navigation convenient laga.",
      "Shopping experience kaafi easy aur systematic mila."
    ],
    phrases_hindi: [
      "स्टोर की व्यवस्था बहुत ही साफ और सुव्यवस्थित रही।",
      "सभी सेक्शन साफ तौर पर चिह्नित होने से सामान आसानी से मिल गया।",
      "खरीदारी का अनुभव काफी सरल और सुविधाजनक रहा।",
      "शेल्व्स का रख-रखाव बहुत ही व्यवस्थित दिखा।"
    ],
    phrases_mr: [
      "दुकान अतिशय नीटनेटके आणि व्यवस्थित मांडलेले होते.",
      "प्रत्येक विभाग स्पष्ट असल्यामुळे वस्तू शोधणे सोपे झाले.",
      "खरेदीचा अनुभव अतिशय सोपा आणि सोयीस्कर ठरला.",
      "मांडणी उत्तम असल्यामुळे वेळ वाचला."
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
      "Slightly on the expensive side."
    ],
    phrases_hi: [
      "Market ke muqable prices thode high lage.",
      "Kuch items thode overpriced mehsoos hue.",
      "Pricing thodi zyada competitive honi chahiye.",
      "Cost thodi steep lagi."
    ],
    phrases_hinglish: [
      "Market ke muqable prices thode high lage.",
      "Kuch items thode overpriced mehsoos hue.",
      "Pricing thodi zyada competitive honi chahiye.",
      "Cost thodi steep lagi."
    ],
    phrases_hindi: [
      "बाजार भाव की तुलना में कीमतें कुछ ज्यादा लगीं।",
      "कुछ सामान अपनी उपयोगिता के मुकाबले महंगे महसूस हुए।",
      "दरों में थोड़ी अधिक प्रतिस्पर्धा होनी चाहिए।",
      "कीमतें कुछ ज्यादा रहीं।"
    ],
    phrases_mr: [
      "बाजारातील दरांच्या तुलनेत भाव थोडे जास्त वाटले.",
      "काही वस्तूंच्या किमती जास्त असल्याचे जाणवले.",
      "दरांमध्ये अधिक सवलत किंवा स्पर्धात्मकता हवी होती.",
      "खर्च काहीसा महाग वाटला."
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
      "Missing sizes or models during the visit."
    ],
    phrases_hi: [
      "Kuch zaroori items stock mein available nahi mile.",
      "Inventory availability improve hone ki zaroorat hai.",
      "Popular sizes ya models shelves par missing the.",
      "Stock availability par dhyan dena chahiye."
    ],
    phrases_hinglish: [
      "Kuch zaroori items stock mein available nahi mile.",
      "Inventory availability improve hone ki zaroorat hai.",
      "Popular sizes ya models shelves par missing the.",
      "Stock availability par dhyan dena chahiye."
    ],
    phrases_hindi: [
      "कुछ जरूरी सामान स्टॉक में उपलब्ध नहीं मिले।",
      "इन्वेंट्री की उपलब्धता में और बेहतर प्रबंधन की आवश्यकता है।",
      "पॉपुलर साइज और मॉडल शेल्व्स पर उपलब्ध नहीं रहे।",
      "स्टॉक की उपलब्धता पर ध्यान दिया जाना चाहिए।"
    ],
    phrases_mr: [
      "काही आवश्यक वस्तूंचा साठा संपलेला आढळला.",
      "मालाची उपलब्धता अधिक चांगली ठेवणे आवश्यक आहे.",
      "मागणी असलेल्या वस्तू दुकानात उपलब्ध नव्हत्या.",
      "स्टॉकचे व्यवस्थापन अधिक चांगले व्हायला हवे."
    ],
  },
  {
    id: "retail_find_product",
    label: "Help finding right product",
    sentiment: "positive",
    phrases_en: [
      "Staff was very helpful in finding the right product.",
      "Assisted immediately in locating what I needed.",
      "Great support from the team to find the exact item.",
      "Staff helped navigate the options to find the best match."
    ],
    phrases_hi: [
      "Sahi product dhoondhne mein staff ne kaafi help ki.",
      "Zaroorat ka item jaldi dhoondhne mein support mila.",
      "Staff assistance ki wajah se exact item mil mila.",
      "Options navigate karne mein staff kaafi attentive laga."
    ],
    phrases_hinglish: [
      "Sahi product dhoondhne mein staff ne kaafi help ki.",
      "Zaroorat ka item jaldi dhoondhne mein support mila.",
      "Staff assistance ki wajah se exact item mil mila.",
      "Options navigate karne mein staff kaafi attentive laga."
    ],
    phrases_hindi: [
      "सही उत्पाद ढूंढने में कर्मचारियों ने बहुत मदद की।",
      "जरूरत की वस्तु तुरंत खोजने में पूरा सहयोग मिला।",
      "कर्मचारियों की सहायता से मनपसंद वस्तु आसानी से मिल गई।",
      "सही विकल्प चुनने में कर्मचारियों का मार्गदर्शन बहुत अच्छा रहा।"
    ],
    phrases_mr: [
      "योग्य वस्तू शोधून देण्यासाठी कर्मचाऱ्यांनी उत्तम मदत केली.",
      "हवी असलेली वस्तू शोधण्यासाठी लगेच सहकार्य लाभले.",
      "कर्मचाऱ्यांच्या मदतीमुळे अचूक उत्पादन निवडता आले.",
      "निवडीमध्ये कर्मचाऱ्यांचा पाठिंबा अतिशय उपयुक्त ठरला."
    ],
  },
  {
    id: "retail_options_explained",
    label: "Product options explained",
    sentiment: "positive",
    phrases_en: [
      "Different product options and features were clearly explained.",
      "Staff walked me through the pros and cons of each choice.",
      "Clear explanation of product differences and specifications.",
      "Helpful guidance on comparing different models or brands."
    ],
    phrases_hi: [
      "Products ke features aur options acche se explain kiye gaye.",
      "Choices ke pros aur cons samajhne mein clarity mili.",
      "Product comparison mein helpful guidance dekhne ko mila.",
      "Har option ki details clearly dekhne ko mili."
    ],
    phrases_hinglish: [
      "Products ke features aur options acche se explain kiye gaye.",
      "Choices ke pros aur cons samajhne mein clarity mili.",
      "Product comparison mein helpful guidance dekhne ko mila.",
      "Har option ki details clearly dekhne ko mili."
    ],
    phrases_hindi: [
      "विभिन्न उत्पादों की विशेषताओं को बहुत स्पष्ट रूप से समझाया गया।",
      "विकल्पों के फायदे और नुकसान समझने में पूरी मदद मिली।",
      "उत्पादों के अंतर और विशिष्टताओं की स्पष्ट जानकारी दी गई।",
      "विभिन्न विकल्पों की तुलना करने में बहुत अच्छा मार्गदर्शन मिला।"
    ],
    phrases_mr: [
      "विविध उत्पादनांचे वैशिष्ट्ये अतिशय स्पष्टपणे समजावून सांगितले.",
      "प्रत्येक पर्यायाचे फायदे-तोटे नीट समजून घेता आले.",
      "उत्पादनांमधील फरक समजावून सांगण्यात आला.",
      "तुलना करून योग्य वस्तू निवडण्यासाठी छान मार्गदर्शन लाभले."
    ],
  },
  {
    id: "retail_answers_questions",
    label: "Staff answered questions",
    sentiment: "positive",
    phrases_en: [
      "Staff answered all my product questions patiently.",
      "Every query about warranty and usage was resolved.",
      "Knowledgeable answers without any hesitation.",
      "Appreciated having my questions answered clearly."
    ],
    phrases_hi: [
      "Staff ne product questions ka patience ke saath answer diya.",
      "Warranty aur usage ke saare doubts clear huye.",
      "Knowledgeable aur accurate answers dekhne ko mile.",
      "Queries par prompt aur clear response mila."
    ],
    phrases_hinglish: [
      "Staff ne product questions ka patience ke saath answer diya.",
      "Warranty aur usage ke saare doubts clear huye.",
      "Knowledgeable aur accurate answers dekhne ko mile.",
      "Queries par prompt aur clear response mila."
    ],
    phrases_hindi: [
      "कर्मचारियों ने सभी सवालों के जवाब बहुत धैर्य से दिए।",
      "वारंटी और उपयोग से जुड़ी हर शंका का समाधान हुआ।",
      "उत्पाद के बारे में सटीक और ज्ञानवर्धक उत्तर मिले।",
      "सभी प्रश्नों का स्पष्ट उत्तर पाकर संतोष हुआ।"
    ],
    phrases_mr: [
      "कर्मचाऱ्यांनी सर्व प्रश्नांची उत्तरे अतिशय संयमाने दिली.",
      "वॉरंटी आणि वापराविषयीच्या सर्व शंका दूर झाल्या.",
      "माहितीपूर्ण आणि खात्रीशीर उत्तरे मिळाली.",
      "प्रश्नांचे समाधानकारक निरसन झाल्यामुळे समाधान वाटले."
    ],
  },
  {
    id: "retail_billing_clear",
    label: "Billing was straightforward",
    sentiment: "positive",
    phrases_en: [
      "Billing was quick, accurate, and straightforward.",
      "Itemized bill with discounts clearly reflected.",
      "No confusion or delays at the billing counter.",
      "Smooth and transparent checkout process."
    ],
    phrases_hi: [
      "Billing kaafi quick aur straightforward lagi.",
      "Discounts aur bill details clearly mention huye.",
      "Counter par koi delay ya confusion nahi laga.",
      "Checkout process smooth aur transparent mila."
    ],
    phrases_hinglish: [
      "Billing kaafi quick aur straightforward lagi.",
      "Discounts aur bill details clearly mention huye.",
      "Counter par koi delay ya confusion nahi laga.",
      "Checkout process smooth aur transparent mila."
    ],
    phrases_hindi: [
      "बिलिंग बहुत त्वरित, सटीक और सरल रही।",
      "छूट और वस्तु का विवरण बिल में स्पष्ट रूप से दर्शाया गया।",
      "बिलिंग काउंटर पर कोई भ्रम या देरी नहीं हुई।",
      "चेकआउट प्रक्रिया बहुत ही पारदर्शी और सहज रही।"
    ],
    phrases_mr: [
      "बिलिंगची प्रक्रिया अतिशय जलद, अचूक आणि सोपी झाली.",
      "सूट आणि अंतिम रक्कम बिलावर स्पष्टपणे नमूद होती.",
      "बिलिंग काउंटरवर कोणताही गोंधळ किंवा उशीर झाला नाही.",
      "पारदर्शक आणि सोपी चेकआउट सेवा मिळाली."
    ],
  },
  {
    id: "retail_matched_desc",
    label: "Product matched description",
    sentiment: "positive",
    phrases_en: [
      "The product matched its description and specifications.",
      "Delivered exactly what was promised on the label.",
      "No surprises — item was identical to the display piece.",
      "Great to receive merchandise that matches its advertised features."
    ],
    phrases_hi: [
      "Product description ke hisab se exact match hua.",
      "Display piece jaisa item intact mila.",
      "Label specs aur actual item bilkul consistent rahe.",
      "Product features promised description se match huye."
    ],
    phrases_hinglish: [
      "Product description ke hisab se exact match hua.",
      "Display piece jaisa item intact mila.",
      "Label specs aur actual item bilkul consistent rahe.",
      "Product features promised description se match huye."
    ],
    phrases_hindi: [
      "उत्पाद बिल्कुल अपने विवरण और विशेषताओं के अनुरूप था।",
      "जो लेबल पर वादा किया गया था वही प्राप्त हुआ।",
      "दिखाए गए नमूने के बिल्कुल समान सामान मिला।",
      "विज्ञापित सुविधाओं के अनुसार उत्पाद पाकर खुशी हुई।"
    ],
    phrases_mr: [
      "उत्पादन त्याच्या वर्णनानुसार आणि वैशिष्ट्यांनुसार तंतोतंत होते.",
      "माहितीपत्रकात सांगितल्याप्रमाणेच वस्तू दर्जेदार निघाली.",
      "दाखवलेल्या नमुन्याप्रमाणे हुबेहूब वस्तू मिळाली.",
      "उत्पादनाच्या गुणवत्तेत कोणताही फरक आढळला नाही."
    ],
  },
  {
    id: "retail_organised_store",
    label: "Neatly organised store",
    sentiment: "positive",
    phrases_en: [
      "Store was very neatly organised and easy to navigate.",
      "Clean shelves with properly arranged sections.",
      "Pleasant shopping experience in a tidy environment.",
      "Well-kept aisles that made finding items effortless."
    ],
    phrases_hi: [
      "Store kaafi neatly organized aur clean mila.",
      "Shelves aur sections properly arranged lage.",
      "Shopping experience organized setup ki wajah se easy laga.",
      "Aisles saaf aur well-kept dekhne ko mile."
    ],
    phrases_hinglish: [
      "Store kaafi neatly organized aur clean mila.",
      "Shelves aur sections properly arranged lage.",
      "Shopping experience organized setup ki wajah se easy laga.",
      "Aisles saaf aur well-kept dekhne ko mile."
    ],
    phrases_hindi: [
      "दुकान बहुत ही सुव्यवस्थित और साफ-सुथरी थी।",
      "अलमारियों में सामान बहुत करीने से लगाया गया था।",
      "स्वच्छ परिवेश में खरीदारी का अनुभव बहुत सुखद रहा।",
      "गलियारे साफ होने से सामान ढूंढना आसान हो गया।"
    ],
    phrases_mr: [
      "दुकान अतिशय व्यवस्थित आणि नेटके होते.",
      "कपाटांमध्ये वस्तूंचे मांडणी अतिशय छान केलेली होती.",
      "स्वच्छ वातावरणात खरेदी करण्याचा अनुभव आनंददायी ठरला.",
      "सुव्यवस्थित रचनेमुळे फिरणे आणि पाहणे सोपे झाले."
    ],
  },
  {
    id: "retail_easy_browsing",
    label: "Easy to browse displays",
    sentiment: "positive",
    phrases_en: [
      "Product displays made browsing effortless and engaging.",
      "Clear pricing tags and visible product information.",
      "Well-lit displays that showcased products nicely.",
      "Easy to explore different categories at my own pace."
    ],
    phrases_hi: [
      "Displays ki wajah se browsing kaafi effortless lagi.",
      "Price tags aur details clearly visible mile.",
      "Lighting aur presentation kaafi acchi lagi.",
      "Aaram se explore karne ka accha setup mila."
    ],
    phrases_hinglish: [
      "Displays ki wajah se browsing kaafi effortless lagi.",
      "Price tags aur details clearly visible mile.",
      "Lighting aur presentation kaafi acchi lagi.",
      "Aaram se explore karne ka accha setup mila."
    ],
    phrases_hindi: [
      "उत्पादों के प्रदर्शन से खरीदारी और खोजबीन बहुत आसान हो गई।",
      "मूल्य टैग और उत्पाद की जानकारी स्पष्ट रूप से प्रदर्शित थी।",
      "उचित प्रकाश व्यवस्था से उत्पाद बहुत आकर्षक दिखे।",
      "अपनी गति से सामान देखने में बहुत सुविधा रही।"
    ],
    phrases_mr: [
      "वस्तूंची मांडणी आकर्षक असल्याने पाहणे आणि निवडणे सोपे गेले.",
      "किंमतीचे लेबल आणि माहिती स्पष्टपणे दिसत होती.",
      "उत्तम प्रकाशयोजना आणि आकर्षक मांडणी पाहायला मिळाली.",
      "आपल्या गतीने खरेदीचा आनंद घेता आला."
    ],
  },
  {
    id: "retail_quick_checkout",
    label: "Quick checkout counter",
    sentiment: "positive",
    phrases_en: [
      "Checkout counter was fast and efficiently managed.",
      "Minimal wait time at the cashier.",
      "Cashier was polite, swift, and organized.",
      "Quick billing made for a prompt exit."
    ],
    phrases_hi: [
      "Checkout counter par kaam kaafi fast hua.",
      "Billing line mein zyada wait nahi karna pada.",
      "Cashier polite aur efficient mila.",
      "Quick billing ki wajah se time bacha."
    ],
    phrases_hinglish: [
      "Checkout counter par kaam kaafi fast hua.",
      "Billing line mein zyada wait nahi karna pada.",
      "Cashier polite aur efficient mila.",
      "Quick billing ki wajah se time bacha."
    ],
    phrases_hindi: [
      "चेकआउट काउंटर बहुत तेज और व्यवस्थित ढंग से संचालित था।",
      "कैशियर के पास बहुत कम प्रतीक्षा समय रहा।",
      "बिलिंग स्टाफ बहुत ही विनम्र और फुर्तीला था।",
      "त्वरित बिलिंग के कारण समय की काफी बचत हुई।"
    ],
    phrases_mr: [
      "चेकआउट काउंटरवरील सेवा अतिशय वेगवान आणि कार्यक्षम होती.",
      "बिलिंगसाठी जास्त वेळ थांबावे लागले नाही.",
      "कॅशियर अतिशय तत्पर आणि नम्र होते.",
      "जलद बिलिंगमुळे खरेदीचा अनुभव सुखद झाला."
    ],
  },
  {
    id: "retail_fair_policy",
    label: "Clear return policy",
    sentiment: "positive",
    phrases_en: [
      "Return and exchange policy was explained transparently.",
      "Clear terms on warranty and returns.",
      "Reassuring exchange policy that gave peace of mind.",
      "Hassle-free return policy clearly communicated."
    ],
    phrases_hi: [
      "Return aur exchange policy clearly explain dekhne ko mili.",
      "Warranty terms bilkul transparent lage.",
      "Customer-friendly exchange terms dekhne ko mile.",
      "Return process mein koi confusion nahi laga."
    ],
    phrases_hinglish: [
      "Return aur exchange policy clearly explain dekhne ko mili.",
      "Warranty terms bilkul transparent lage.",
      "Customer-friendly exchange terms dekhne ko mile.",
      "Return process mein koi confusion nahi laga."
    ],
    phrases_hindi: [
      "वापसी और विनिमय नीति बहुत पारदर्शी तरीके से समझाई गई।",
      "वारंटी और रिटर्न की शर्तें बिल्कुल स्पष्ट थीं।",
      "ग्राहक-अनुकूल नीति से मन को पूरा भरोसा मिला।",
      "आसान रिटर्न प्रक्रिया की जानकारी पहले ही दे दी गई।"
    ],
    phrases_mr: [
      "परतावा आणि एक्सचेंजचे नियम अतिशय स्पष्टपणे समजावून सांगितले.",
      "वॉरंटीच्या अटी अतिशय पारदर्शक होत्या.",
      "ग्राहकांच्या हिताचे नियम असल्यामुळे विश्वास वाटला.",
      "कोणत्याही अडचणीशिवाय परताव्याची सोय उपलब्ध होती."
    ],
  },
  {
    id: "retail_trial_clean",
    label: "Clean fitting rooms",
    sentiment: "positive",
    phrases_en: [
      "Fitting rooms were spacious, clean, and well-lit.",
      "Hygienic trial rooms with good mirrors and hooks.",
      "Comfortable trial room experience with proper ventilation.",
      "Neat changing area that was maintained regularly."
    ],
    phrases_hi: [
      "Fitting rooms kaafi clean aur spacious mile.",
      "Trial rooms mein proper lighting aur mirrors lage the.",
      "Hygienic changing area dekhne ko mila.",
      "Trial room maintenance kaafi accha laga."
    ],
    phrases_hinglish: [
      "Fitting rooms kaafi clean aur spacious mile.",
      "Trial rooms mein proper lighting aur mirrors lage the.",
      "Hygienic changing area dekhne ko mila.",
      "Trial room maintenance kaafi accha laga."
    ],
    phrases_hindi: [
      "ट्रायल रूम काफी साफ-सुथरे, बड़े और रोशनी से युक्त थे।",
      "अच्छे शीशों और स्वच्छता के साथ चेंजिंग रूम मिले।",
      "आरामदायक और हवादार ट्रायल रूम का अनुभव रहा।",
      "नियमित रूप से साफ किए गए चेंजिंग एरिया ने अच्छा प्रभाव डाला।"
    ],
    phrases_mr: [
      "ट्रायल रूम अत्यंत स्वच्छ, प्रशस्त आणि योग्य प्रकाश असलेली होती.",
      "स्वच्छता आणि आरशांची सोय उत्तम होती.",
      "आरामशीर आणि व्यवस्थित चेंजिंग रूम अनुभवायला मिळाली.",
      "नियमित देखभालीमुळे ट्रायल रूम अतिशय नीटनेटकी वाटली."
    ],
  }
];

// ─── 6. Fitness & Gym Chips ──────────────────────────────────────────────────

export const FITNESS_CHIPS = [
  {
    id: "fit_equipment",
    label: "Modern equipment",
    sentiment: "positive",
    phrases_en: [
      "Great range of modern and well-maintained equipment.",
      "All workout machines and free weights are in top condition.",
      "Excellent gym equipment with plenty of variety.",
      "Modern machinery that caters to all training needs."
    ],
    phrases_hi: [
      "Gym mein modern aur well-maintained equipment mile.",
      "Saari workout machines aur weights top condition mein mile.",
      "Equipments ki variety aur maintenance kaafi achha laga.",
      "Machines smooth aur safe working condition mein the."
    ],
    phrases_hinglish: [
      "Gym mein modern aur well-maintained equipment mile.",
      "Saari workout machines aur weights top condition mein mile.",
      "Equipments ki variety aur maintenance kaafi achha laga.",
      "Machines smooth aur safe working condition mein the."
    ],
    phrases_hindi: [
      "जिम में आधुनिक और अच्छी तरह मेंटेन किए गए उपकरण मिले।",
      "सभी वर्कआउट मशीनें और फ्री-वेट्स बेहतरीन कंडीशन में रहे।",
      "उपकरणों की वैरायटी और मेंटेनेंस काफी अच्छा रहा।",
      "हर तरह की फिटनेस ट्रेनिंग के लिए उपयुक्त मशीनें उपलब्ध रहीं।"
    ],
    phrases_mr: [
      "जिममधील सर्व उपकरणे आधुनिक आणि सुस्थितीत आढळली.",
      "वर्कआउट मशिन्स आणि वेट्स उत्तम स्थितीत मिळाले.",
      "उपकरणांची विविधता आणि देखभाल अतिशय उत्तम वाटली.",
      "सर्व प्रकारच्या व्यायामासाठी योग्य मशिन्स उपलब्ध होत्या."
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
      "Personalized attention and safe training tips provided."
    ],
    phrases_hi: [
      "Trainers kaafi helpful aur knowledgeable mile.",
      "Workout guidance aur posture support kaafi achha mila.",
      "Friendly aur motivating training environment laga.",
      "Floor par trainers ka attention kaafi supportive mila."
    ],
    phrases_hinglish: [
      "Trainers kaafi helpful aur knowledgeable mile.",
      "Workout guidance aur posture support kaafi achha mila.",
      "Friendly aur motivating training environment laga.",
      "Floor par trainers ka attention kaafi supportive mila."
    ],
    phrases_hindi: [
      "ट्रेनर्स काफी मददगार और सही गाइडेंस देने वाले मिले।",
      "वर्कआउट के दौरान सही पोस्चर और सपोर्ट का पूरा ध्यान मिला।",
      "सपोर्टिव और मोटिवेटिंग ट्रेनर्स का साथ रहा।",
      "ट्रेनिंग में बारीकियों और सुरक्षा पर पूरा जोर दिया गया।"
    ],
    phrases_mr: [
      "ट्रेनर्स अतिशय अनुभवी आणि योग्य मार्गदर्शन करणारे आढळले.",
      "व्यायामादरम्यान योग्य मार्गदर्शन आणि सहकार्य मिळाले.",
      "उत्साहवर्धक आणि सहकार्य करणारा ट्रेनर वर्ग लाभला.",
      "व्यायामाच्या योग्य पद्धती समजावून सांगण्यात आल्या."
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
      "Clean workout stations and fresh air circulation."
    ],
    phrases_hi: [
      "Gym floor aur locker rooms bilkul clean aur hygienic mile.",
      "Cleanliness aur hygiene ka level kaafi impressive laga.",
      "Equipment sanitized aur fresh environment mila.",
      "Hygiene standards regular basis par maintain mile."
    ],
    phrases_hinglish: [
      "Gym floor aur locker rooms bilkul clean aur hygienic mile.",
      "Cleanliness aur hygiene ka level kaafi impressive laga.",
      "Equipment sanitized aur fresh environment mila.",
      "Hygiene standards regular basis par maintain mile."
    ],
    phrases_hindi: [
      "जिम फ्लोर और चेंजिंग रूम्स काफी साफ और हाइजीनिक मिले।",
      "मशीनों और लॉकर एरिया में सफाई का पूरा ध्यान रखा गया।",
      "सफाई और हाइजीन का स्तर बहुत बढ़िया रहा।",
      "फ्रेश एयर सर्कुलेशन और स्वच्छ वातावरण मिला।"
    ],
    phrases_mr: [
      "जिम परिसर आणि लॉकर रूम्स अतिशय स्वच्छ आणि टापटिप्प आढळल्या.",
      "स्वच्छता आणि आरोग्याची योग्य काळजी घेतली गेली.",
      "परिसर स्वच्छ आणि ताजेतवाने वाटले.",
      "मशिन्स निर्जंतुक आणि स्वच्छ ठेवल्या होत्या."
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
      "A fantastic space to stay focused and consistent."
    ],
    phrases_hi: [
      "Workout ke liye kaafi motivating aur energetic mahaul mila.",
      "Music aur fitness vibe workout boost karti hai.",
      "Positive aur focused workout environment laga.",
      "Energy aur motivation kaafi inspiring mila."
    ],
    phrases_hinglish: [
      "Workout ke liye kaafi motivating aur energetic mahaul mila.",
      "Music aur fitness vibe workout boost karti hai.",
      "Positive aur focused workout environment laga.",
      "Energy aur motivation kaafi inspiring mila."
    ],
    phrases_hindi: [
      "वर्कआउट के लिए काफी पॉजिटिव और मोटिवेटिंग माहौल मिला।",
      "जिम का म्यूजिक और एनर्जी लेवल वर्कआउट को आसान बनाता है।",
      "काफी एक्टिव और प्रेरणादायक माहौल रहा।",
      "नियमित वर्कआउट के लिए बहुत ही शानदार जगह है।"
    ],
    phrases_mr: [
      "व्यायामासाठी अतिशय प्रेरणादायी आणि उत्साही वातावरण लाभले.",
      "सकारात्मक ऊर्जा आणि उत्तम संगीतामुळे वर्कआउट छान झाले.",
      "उत्साहवर्धक आणि शिस्तबद्ध जिमचे वातावरण वाटले.",
      "नियमित व्यायाम करण्यासाठी उत्तम जागा आहे."
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
      "Space feels constrained during rush times."
    ],
    phrases_hi: [
      "Peak hours mein gym kaafi crowded ho jata hai.",
      "Machines aur bench ke liye kaafi wait karna pada.",
      "Crowd management better hone ki zaroorat lagti hai.",
      "Rush time par workout space thodi kam lagti hai."
    ],
    phrases_hinglish: [
      "Peak hours mein gym kaafi crowded ho jata hai.",
      "Machines aur bench ke liye kaafi wait karna pada.",
      "Crowd management better hone ki zaroorat lagti hai.",
      "Rush time par workout space thodi kam lagti hai."
    ],
    phrases_hindi: [
      "पीक ऑवर्स में जिम में काफी ज्यादा भीड़ रहती है।",
      "मशीनों और बेंच के लिए काफी इंतजार करना पड़ा।",
      "भीड़ प्रबंधन में सुधार की आवश्यकता महसूस हुई।",
      "ज्यादा भीड़ के समय वर्कआउट के लिए जगह कम लगी।"
    ],
    phrases_mr: [
      "गर्दीच्या वेळेत जिममध्ये प्रचंड गर्दी जाणवली.",
      "मशिन्स वापरण्यासाठी बराच वेळ थांबावे लागले.",
      "गर्दीचे नियोजन अधिक चांगले होण्याची गरज आहे.",
      "जास्त गर्दीमुळे व्यायामासाठी जागा अपुरी वाटली."
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
      "Worn out grips and cables need attention."
    ],
    phrases_hi: [
      "Kuch machines out of order theen aur repair pending laga.",
      "AC aur ventilation thoda better hona chahiye.",
      "Equipment maintenance time par hona zaroori laga.",
      "Grips aur cables par dhyan dena zaroori hai."
    ],
    phrases_hinglish: [
      "Kuch machines out of order theen aur repair pending laga.",
      "AC aur ventilation thoda better hona chahiye.",
      "Equipment maintenance time par hona zaroori laga.",
      "Grips aur cables par dhyan dena zaroori hai."
    ],
    phrases_hindi: [
      "कुछ मशीनें काम नहीं कर रही थीं और रिपेयर की जरूरत थी।",
      "वेंटिलेशन और एसी की व्यवस्था और बेहतर हो सकती है।",
      "मशीनों का समय पर मेंटेनेंस होना जरूरी लगता है।",
      "उपकरणों की नियमित जांच और सर्विसिंग आवश्यक है।"
    ],
    phrases_mr: [
      "काही मशिन्स बंद होत्या आणि दुरुस्तीची गरज जाणवली.",
      "वातानुकूलन आणि हवेची सोय अधिक चांगली हवी होती.",
      "उपकरणांची नियमित देखभाल वेळेवर होणे गरजेचे वाटले.",
      "मशिन्सची वेळीच दुरुस्ती होणे आवश्यक आहे."
    ],
  },
  {
    id: "fit_exercises_explained",
    label: "Exercises explained clearly",
    sentiment: "positive",
    phrases_en: [
      "Exercises and workouts were explained very clearly.",
      "Trainers broke down movements step by step.",
      "Clear demonstration of correct workout routines.",
      "Understood the purpose of each exercise easily."
    ],
    phrases_hi: [
      "Exercises ka tarika clearly explain dekhne ko mila.",
      "Trainers ne step-by-step workout samjhaya.",
      "Routine aur posture ki clarity kaafi acchi mili.",
      "Har exercise ka purpose samajhna easy laga."
    ],
    phrases_hinglish: [
      "Exercises ka tarika clearly explain dekhne ko mila.",
      "Trainers ne step-by-step workout samjhaya.",
      "Routine aur posture ki clarity kaafi acchi mili.",
      "Har exercise ka purpose samajhna easy laga."
    ],
    phrases_hindi: [
      "व्यायाम और कसरत के तरीकों को बहुत स्पष्ट रूप से समझाया गया।",
      "प्रशिक्षकों ने हर गतिविधि को चरणबद्ध तरीके से सिखाया।",
      "कसरत की सही दिनचर्या का बहुत स्पष्ट प्रदर्शन मिला।",
      "हर व्यायाम का उद्देश्य समझना बहुत आसान रहा।"
    ],
    phrases_mr: [
      "व्यायामाचे प्रकार आणि पद्धती अतिशय सोप्या भाषेत समजावून सांगितल्या.",
      "प्रशिक्षकांनी प्रत्येक हालचाल बारकाईने शिकवली.",
      "व्यायामाचे योग्य प्रात्यक्षिक पाहायला मिळाले.",
      "प्रत्येक व्यायामाचे महत्त्व समजून घेणे सहज झाले."
    ],
  },
  {
    id: "fit_form_corrected",
    label: "Trainer corrected technique",
    sentiment: "positive",
    phrases_en: [
      "Trainer paid close attention and corrected my technique.",
      "Appreciated the timely posture and form adjustments.",
      "Safe training with constant form supervision.",
      "Helpful corrections that prevented unnecessary strain."
    ],
    phrases_hi: [
      "Trainer ne form aur technique par dhyan dekar correct kiya.",
      "Posture corrections timely aur helpful lage.",
      "Safe lifting aur training ka pura guidance mila.",
      "Injury avoid karne ke liye technical corrections mile."
    ],
    phrases_hinglish: [
      "Trainer ne form aur technique par dhyan dekar correct kiya.",
      "Posture corrections timely aur helpful lage.",
      "Safe lifting aur training ka pura guidance mila.",
      "Injury avoid karne ke liye technical corrections mile."
    ],
    phrases_hindi: [
      "प्रशिक्षक ने कसरत की तकनीक और मुद्रा पर पूरा ध्यान देकर सुधार करवाया।",
      "समय पर सही मुद्रा सिखाने से कसरत बहुत सुरक्षित रही।",
      "सुरक्षित प्रशिक्षण के साथ लगातार देखरेख मिली।",
      "तकनीकी सुधारों से अनावश्यक खिंचाव से बचने में मदद मिली।"
    ],
    phrases_mr: [
      "प्रशिक्षकांनी व्यायामाची पद्धत आणि पोश्चर दुरुस्त करण्यावर भर दिला.",
      "वेळोवेळी मिळालेल्या सूचनांमुळे व्यायाम अधिक सुरक्षित झाला.",
      "दुखापत टाळण्यासाठी तंत्रावर दिलेले लक्ष खूप उपयुक्त ठरले.",
      "योग्य पद्धतीचे मार्गदर्शन सतत लाभले."
    ],
  },
  {
    id: "fit_level_adapted",
    label: "Workout adapted to level",
    sentiment: "positive",
    phrases_en: [
      "Workouts were adapted to my current fitness level.",
      "No pressure to lift beyond capacity — gradual progression.",
      "Paced training that matched my endurance.",
      "Customized sets designed around personal strength."
    ],
    phrases_hi: [
      "Fitness level ke hisab se workout adapt dekhne ko mila.",
      "Capacity ke hisab se gradual progress dekhne ko mili.",
      "Pacing bilkul sahi lagi bina unnecessary pressure ke.",
      "Personal endurance ke hisab se sets customize huye."
    ],
    phrases_hinglish: [
      "Fitness level ke hisab se workout adapt dekhne ko mila.",
      "Capacity ke hisab se gradual progress dekhne ko mili.",
      "Pacing bilkul sahi lagi bina unnecessary pressure ke.",
      "Personal endurance ke hisab se sets customize huye."
    ],
    phrases_hindi: [
      "कसरत को मेरी वर्तमान फिटनेस क्षमता के अनुसार ढाला गया।",
      "क्षमता से अधिक भार उठाने का कोई दबाव नहीं रहा।",
      "धीमी और व्यवस्थित प्रगति पर ध्यान केंद्रित किया गया।",
      "व्यक्तिगत ताकत के अनुसार सेट्स की योजना बनाई गई।"
    ],
    phrases_mr: [
      "माझ्या शारीरिक क्षमतेनुसार व्यायामाची रचना करण्यात आली.",
      "क्षमतेपेक्षा जास्त भार उचलण्याचा कोणताही अवाजवी दबाव नव्हता.",
      "टप्प्याटप्प्याने क्षमता वाढवण्यावर भर दिला गेला.",
      "वैयक्तिक ताकदीनुसार व्यायामाचे योग्य नियोजन लाभले."
    ],
  },
  {
    id: "fit_equipment_available",
    label: "Equipment readily available",
    sentiment: "positive",
    phrases_en: [
      "Workout machines and free weights were readily available.",
      "No long waiting around to complete sets.",
      "Plenty of duplicate weights and stations to use.",
      "Smooth workout flow without having to wait."
    ],
    phrases_hi: [
      "Machines aur weights easily available mile bina wait ke.",
      "Sets complete karne mein waiting time nahi laga.",
      "Dumbbells aur stations kaafi sankhya mein available the.",
      "Workout routine bina rukawat ke smoothly chala."
    ],
    phrases_hinglish: [
      "Machines aur weights easily available mile bina wait ke.",
      "Sets complete karne mein waiting time nahi laga.",
      "Dumbbells aur stations kaafi sankhya mein available the.",
      "Workout routine bina rukawat ke smoothly chala."
    ],
    phrases_hindi: [
      "कसरत की मशीनें और डम्बल आसानी से उपलब्ध मिले।",
      "सेट्स पूरे करने के लिए अनावश्यक इंतजार नहीं करना पड़ा।",
      "पर्याप्त मात्रा में वजन और उपकरण उपलब्ध रहे।",
      "बिना किसी रुकावट के पूरी कसरत सुचारू रूप से हुई।"
    ],
    phrases_mr: [
      "व्यायामाची साधने आणि डंबेल सहजतेने उपलब्ध होते.",
      "व्यायामाचे सेट्स पूर्ण करण्यासाठी थांबावे लागले नाही.",
      "मुबलक उपकरणांमुळे व्यायामाचा क्रम तुटला नाही.",
      "विनाअडथळा आणि सुरळीत व्यायाम पूर्ण करता आला."
    ],
  },
  {
    id: "fit_progress_tracked",
    label: "Progress explained clearly",
    sentiment: "positive",
    phrases_en: [
      "Fitness progress and milestones were explained clearly.",
      "Good tracking of stamina and strength improvements.",
      "Clear feedback on how performance is improving.",
      "Encouraging updates on weekly workout achievements."
    ],
    phrases_hi: [
      "Progress aur achievements clearly explain kiye gaye.",
      "Stamina aur strength growth ka accha tracking mila.",
      "Performance feedback constructive aur clear laga.",
      "Milestones par motivating updates dekhne ko mile."
    ],
    phrases_hinglish: [
      "Progress aur achievements clearly explain kiye gaye.",
      "Stamina aur strength growth ka accha tracking mila.",
      "Performance feedback constructive aur clear laga.",
      "Milestones par motivating updates dekhne ko mile."
    ],
    phrases_hindi: [
      "फिटनेस की प्रगति और उपलब्धियों को बहुत स्पष्ट समझाया गया।",
      "स्टैमिना और ताकत में सुधार का बहुत अच्छा विवरण मिला।",
      "प्रदर्शन को लेकर बहुत ही उत्साहवर्धक समीक्षा मिली।",
      "साप्ताहिक सुधार पर प्रेरणादायी जानकारी साझा की गई।"
    ],
    phrases_mr: [
      "शारीरिक प्रगती आणि टप्प्यांविषयी स्पष्ट कल्पना देण्यात आली.",
      "स्टॅमिना आणि ताकदीतील सुधारणा व्यवस्थित समजावली गेली.",
      "कामगिरीविषयी उपयुक्त आणि प्रोत्साहन देणारा आढावा मिळाला.",
      "प्रगतीचा आलेख स्पष्ट झाल्यामुळे अधिक हुरूप आला."
    ],
  },
  {
    id: "fit_floor_clean",
    label: "Gym floor kept clean",
    sentiment: "positive",
    phrases_en: [
      "Workout floor and rubber mats were sanitized and spotless.",
      "Clean floor space free of clutter and sweat.",
      "Staff wiped down machines and stations regularly.",
      "Impressed by the hygiene maintained on the gym floor."
    ],
    phrases_hi: [
      "Gym floor aur mats bilkul saaf aur sanitized mile.",
      "Regular wiping aur cleaning dekhne ko mili.",
      "Clean workout surface bina clutter ke maintain laga.",
      "Floor cleanliness ka standard kaafi badhiya laga."
    ],
    phrases_hinglish: [
      "Gym floor aur mats bilkul saaf aur sanitized mile.",
      "Regular wiping aur cleaning dekhne ko mili.",
      "Clean workout surface bina clutter ke maintain laga.",
      "Floor cleanliness ka standard kaafi badhiya laga."
    ],
    phrases_hindi: [
      "कसरत का फर्श और रबर मैट पूरी तरह साफ और रोगाणुरहित थे।",
      "मशीनों और फर्श की नियमित रूप से सफाई देखने को मिली।",
      "साफ-सुथरे स्थान पर कसरत करने का बहुत अच्छा अनुभव रहा।",
      "स्वच्छता के प्रति कर्मचारियों की सजगता सराहनीय थी।"
    ],
    phrases_mr: [
      "व्यायामाचा परिसर आणि मॅट्स अत्यंत स्वच्छ ठेवलेले होते.",
      "मशिन्स आणि जमिनीची नियमित स्वच्छता केली जात होती.",
      "परिसरातील स्वच्छता आणि टापटीप मनाला समाधान देणारी होती.",
      "स्वच्छतेच्या चांगल्या दर्जाचा अनुभव आला."
    ],
  },
  {
    id: "fit_warmup_helpful",
    label: "Helpful warmup guidance",
    sentiment: "positive",
    phrases_en: [
      "Thorough warmup and mobility routine guided by the staff.",
      "Helpful stretching guidance that prepared me for lifting.",
      "Proper warmup ensured no stiffness or injury.",
      "Appreciated the dedicated mobility work before training."
    ],
    phrases_hi: [
      "Warmup aur stretching guidance kaafi thorough mila.",
      "Mobility exercises se workout ke liye body ready hui.",
      "Injury prevention ke liye warmup routine accha sikhaya.",
      "Proper stretching se stiffness avoid karne mein help hui."
    ],
    phrases_hinglish: [
      "Warmup aur stretching guidance kaafi thorough mila.",
      "Mobility exercises se workout ke liye body ready hui.",
      "Injury prevention ke liye warmup routine accha sikhaya.",
      "Proper stretching se stiffness avoid karne mein help hui."
    ],
    phrases_hindi: [
      "कसरत से पहले वार्मअप और स्ट्रेचिंग का बहुत अच्छा अभ्यास कराया गया।",
      "शरीर को कसरत के लिए तैयार करने में उचित मार्गदर्शन मिला।",
      "सही वार्मअप के कारण मांसपेशियों में कोई खिंचाव नहीं आया।",
      "कसरत से पहले मोबिलिटी वर्कआउट बहुत उपयोगी साबित हुआ।"
    ],
    phrases_mr: [
      "व्यायामापूर्वी योग्य वॉर्मअप आणि स्ट्रेचिंगचे उत्तम मार्गदर्शन मिळाले.",
      "शरीर व्यायामासाठी तयार करण्यासाठी उत्तम हालचाली शिकवल्या.",
      "योग्य वॉर्मअपमुळे स्नायूंवर कोणताही अवाजवी ताण आला नाही.",
      "सुरुवातीचे व्यायाम अतिशय काळजीपूर्वक करून घेतले गेले."
    ],
  },
  {
    id: "fit_friendly_space",
    label: "Friendly motivating space",
    sentiment: "positive",
    phrases_en: [
      "Very friendly and welcoming environment for all fitness levels.",
      "Supportive crowd that makes beginners feel comfortable.",
      "No intimidation — just a motivating, positive space.",
      "Great community atmosphere that keeps you consistent."
    ],
    phrases_hi: [
      "Har fitness level ke liye welcoming aur friendly space mila.",
      "Beginners ke liye kaafi supportive atmosphere laga.",
      "Positive community vibe dekhne ko mili.",
      "Friendly setup se consistency maintain karna aasan laga."
    ],
    phrases_hinglish: [
      "Har fitness level ke liye welcoming aur friendly space mila.",
      "Beginners ke liye kaafi supportive atmosphere laga.",
      "Positive community vibe dekhne ko mili.",
      "Friendly setup se consistency maintain karna aasan laga."
    ],
    phrases_hindi: [
      "सभी स्तरों के लोगों के लिए बहुत ही दोस्ताना और स्वागतपूर्ण माहौल था।",
      "शुरुआती लोगों के लिए बहुत ही उत्साहवर्धक और सहयोगी परिवेश रहा।",
      "बिना किसी झिझक के कसरत करने का सकारात्मक अनुभव मिला।",
      "एक अच्छा समुदाय जो नियमित रहने में मदद करता है।"
    ],
    phrases_mr: [
      "नवशिक्यांसाठी आणि सर्वांसाठी अतिशय आपुलकीचे वातावरण होते.",
      "कोणताही संकोच न वाटता मोकळेपणाने व्यायाम करता आला.",
      "सकारात्मक आणि एकमेकांना साथ देणारे वातावरण लाभले.",
      "नियमितता टिकवून ठेवण्यासाठी परिसरातील उत्साह उपयोगी ठरला."
    ],
  },
  {
    id: "fit_weights_arranged",
    label: "Free weights well arranged",
    sentiment: "positive",
    phrases_en: [
      "Dumbbells and weight plates were organized systematically.",
      "Racks were properly labeled and weights returned to order.",
      "Easy to find matching pairs without hunting around.",
      "Tidy weight section with good safety spacing."
    ],
    phrases_hi: [
      "Dumbbells aur plates properly arranged aur organized mile.",
      "Matching weights easily mil gaye bina dhoondhe.",
      "Free weights section kaafi neat aur systematic laga.",
      "Safety spacing aur organization kaafi acchi lagi."
    ],
    phrases_hinglish: [
      "Dumbbells aur plates properly arranged aur organized mile.",
      "Matching weights easily mil gaye bina dhoondhe.",
      "Free weights section kaafi neat aur systematic laga.",
      "Safety spacing aur organization kaafi acchi lagi."
    ],
    phrases_hindi: [
      "डम्बल और वजन की प्लेटें बहुत व्यवस्थित ढंग से रखी मिलीं।",
      "रैक में सही लेबलिंग होने से वजन खोजना आसान रहा।",
      "बिना किसी परेशानी के सही जोड़े मिल गए।",
      "वजन अनुभाग काफी साफ-सुथरा और सुरक्षित बनावट वाला था।"
    ],
    phrases_mr: [
      "डंबेल आणि वजनांची मांडणी अतिशय शिस्तबद्ध पद्धतीने केलेली होती.",
      "हवी ती वजने शोधण्यात वेळ वाया गेला नाही.",
      "फ्री वेट्स विभाग अतिशय नीटनेटका आणि सुटसुटीत होता.",
      "सुरक्षित अंतर आणि उत्कृष्ट व्यवस्था पाहायला मिळाली."
    ],
  },
  {
    id: "fit_cardio_balanced",
    label: "Good cardio setup",
    sentiment: "positive",
    phrases_en: [
      "Treadmills, cross-trainers, and cycles in top working order.",
      "Plenty of cardio options with screens and tracking.",
      "Cardio section was well ventilated and comfortable.",
      "Smooth cardio workout on quality machines."
    ],
    phrases_hi: [
      "Treadmills aur cardio machines top working condition mein mile.",
      "Cardio section mein accha ventilation aur comfort laga.",
      "Cardio options diverse aur properly maintained lage.",
      "Cardio workout kaafi smooth aur enjoyable laga."
    ],
    phrases_hinglish: [
      "Treadmills aur cardio machines top working condition mein mile.",
      "Cardio section mein accha ventilation aur comfort laga.",
      "Cardio options diverse aur properly maintained lage.",
      "Cardio workout kaafi smooth aur enjoyable laga."
    ],
    phrases_hindi: [
      "ट्रेडमिल और साइकिल आदि सभी कार्डियो उपकरण बहुत अच्छी स्थिति में थे।",
      "कार्डियो अनुभाग में अच्छा वेंटिलेशन और आराम देखने को मिला।",
      "कार्डियो के बहुत सारे और आधुनिक विकल्प उपलब्ध रहे।",
      "गुणवत्तापूर्ण मशीनों पर कसरत का अनुभव बहुत सुखद रहा।"
    ],
    phrases_mr: [
      "ट्रेडमिल आणि सायकलसारखी कार्डिओ साधने अतिशय उत्तम स्थितीत होती.",
      "कार्डिओ विभागात खेळती हवा आणि प्रसन्न वातावरण होते.",
      "विविध प्रकारची अद्ययावत साधने उपलब्ध होती.",
      "कार्डिओ व्यायामाचा अनुभव अतिशय आल्हाददायक ठरला."
    ],
  }
];

// ─── 7. Automotive & Garage Chips ────────────────────────────────────────────

export const AUTOMOTIVE_CHIPS = [
  {
    id: "auto_mechanic",
    label: "Skilled mechanics",
    sentiment: "positive",
    phrases_en: [
      "Mechanics were very skilled and diagnosed the issue accurately.",
      "Quick and correct troubleshooting of vehicle problems.",
      "Technical knowledge of the service team was impressive.",
      "Work was handled with great technical expertise."
    ],
    phrases_hi: [
      "Mechanics kaafi skilled mile aur issue accurately diagnose kiya.",
      "Gaadi ki problem ka quick aur correct solution mila.",
      "Technical knowledge aur expertise kaafi badhiya lagi.",
      "Work handling aur troubleshooting kaafi sharp lagi."
    ],
    phrases_hinglish: [
      "Mechanics kaafi skilled mile aur issue accurately diagnose kiya.",
      "Gaadi ki problem ka quick aur correct solution mila.",
      "Technical knowledge aur expertise kaafi badhiya lagi.",
      "Work handling aur troubleshooting kaafi sharp lagi."
    ],
    phrases_hindi: [
      "मैकेनिक काफी कुशल मिले और समस्या की सही पहचान की।",
      "गाड़ी की समस्या का तुरंत और सटीक समाधान मिला।",
      "सर्विस टीम की तकनीकी जानकारी काफी प्रभावशाली रही।",
      "समस्या निवारण में बहुत ही पेशेवर अनुभव रहा।"
    ],
    phrases_mr: [
      "मेकॅनिक अतिशय कुशल आढळले आणि गाडीतील बिघाड अचूक ओळखला.",
      "वाहनातील समस्येचे जलद आणि योग्य निवारण झाले.",
      "तांत्रिक कौशल्य आणि कामाचा अनुभव कौतुकास्पद वाटला.",
      "गाडीचे काम अतिशय चांगल्या पद्धतीने पार पडले."
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
      "Ready right on schedule as committed."
    ],
    phrases_hi: [
      "Gaadi time par service hokar delivery mili.",
      "Bina delay ke promised time par kaam complete hua.",
      "Prompt delivery aur punctual turnaround kaafi achha laga.",
      "Committed timeline par vehicle ready mila."
    ],
    phrases_hinglish: [
      "Gaadi time par service hokar delivery mili.",
      "Bina delay ke promised time par kaam complete hua.",
      "Prompt delivery aur punctual turnaround kaafi achha laga.",
      "Committed timeline par vehicle ready mila."
    ],
    phrases_hindi: [
      "गाड़ी की सर्विस तय समय पर पूरी करके डिलीवरी दी गई।",
      "बिना किसी देरी के समय पर काम पूरा हुआ।",
      "प्रॉमिस किए गए समय पर डिलीवरी मिलना काफी अच्छा लगा।",
      "समय की पाबंदी बहुत संतोषजनक रही।"
    ],
    phrases_mr: [
      "गाडी वेळेवर सर्व्हिस होऊन ठरलेल्या वेळेत परत मिळाली.",
      "अनावश्यक विलंब न होता वेळेवर काम पूर्ण झाले.",
      "वचनाप्रमाणे वेळेत गाडी मिळाल्यामुळे समाधान वाटले.",
      "ठरलेल्या वेळेत गाडी तयार मिळाली."
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
      "Fair and justified quotation for the repairs."
    ],
    phrases_hi: [
      "Kaam se pehle clear estimate mila, koi hidden charges nahi the.",
      "Fair pricing aur transparent billing kaafi achhi lagi.",
      "Reasonable charges aur detailed bill provide kiya.",
      "Quotation clear aur justified mila."
    ],
    phrases_hinglish: [
      "Kaam se pehle clear estimate mila, koi hidden charges nahi the.",
      "Fair pricing aur transparent billing kaafi achhi lagi.",
      "Reasonable charges aur detailed bill provide kiya.",
      "Quotation clear aur justified mila."
    ],
    phrases_hindi: [
      "काम से पहले स्पष्ट एस्टीमेट दिया गया और कोई हिडन चार्ज नहीं रहा।",
      "खर्च वाजिब और बिलिंग पूरी तरह पारदर्शी रही।",
      "ईमानदार प्राइसिंग और डिटेल इनवॉइस मिला।",
      "सर्विस के चार्ज पूरी तरह न्यायसंगत लगे।"
    ],
    phrases_mr: [
      "कामापूर्वी खर्चाचा स्पष्ट अंदाज दिला गेला, कोणतेही छुपे शुल्क नव्हते.",
      "वाजवी दर आणि पारदर्शक बिलिंग पद्धत आढळली.",
      "खर्च रास्त आणि प्रत्येक कामाचा तपशीलवार हिशोब मिळाला.",
      "कामाचे दर पूर्णपणे योग्य वाटले."
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
      "Reliable components used throughout the repair."
    ],
    phrases_hi: [
      "Original spare parts use kiye gaye aur box show kiya.",
      "Quality servicing aur genuine parts se trust bana.",
      "Reliable parts aur safe fitting provide ki hui mili.",
      "Authentic parts se gaadi ka performance improve hua."
    ],
    phrases_hinglish: [
      "Original spare parts use kiye gaye aur box show kiya.",
      "Quality servicing aur genuine parts se trust bana.",
      "Reliable parts aur safe fitting provide ki hui mili.",
      "Authentic parts se gaadi ka performance improve hua."
    ],
    phrases_hindi: [
      "ओरिजिनल स्पेयर पार्ट्स का इस्तेमाल किया गया।",
      "काम की क्वालिटी और पार्ट्स की ऑथेंटिसिटी पर पूरा भरोसा बना।",
      "विश्वसनीय पार्ट्स और बढ़िया सर्विसिंग मिली।",
      "सुरक्षा और परफॉर्मेंस दोनों में सुधार महसूस हुआ।"
    ],
    phrases_mr: [
      "ओरिजिनल स्पेअर पार्ट्सचा वापर केला गेला.",
      "कामाचा दर्जा आणि साहित्याची गुणवत्ता विश्वासार्ह वाटली.",
      "वाहनाच्या सुरक्षिततेची पूर्ण खात्री पटली.",
      "दर्जेदार पार्टसमुळे गाडीची कार्यक्षमता वाढली."
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
      "Waiting time for vehicle delivery was inconvenient."
    ],
    phrases_hi: [
      "Promised time se kaafi late delivery mili.",
      "Bina update ke delay hua, time management better hona chahiye.",
      "Delivery schedule follow karne mein kami lagi.",
      "Vehicle delivery mein lamba delay face karna pada."
    ],
    phrases_hinglish: [
      "Promised time se kaafi late delivery mili.",
      "Bina update ke delay hua, time management better hona chahiye.",
      "Delivery schedule follow karne mein kami lagi.",
      "Vehicle delivery mein lamba delay face karna pada."
    ],
    phrases_hindi: [
      "गाड़ी की डिलीवरी में प्रॉमिस किए गए समय से काफी ज्यादा देरी हुई।",
      "बिना पूर्व सूचना के काम में ज्यादा समय लगा।",
      "डिलीवरी टाइमिंग को लेकर बेहतर कम्युनिकेशन होना चाहिए।",
      "तय समय पर डिलीवरी न मिलने से परेशानी हुई।"
    ],
    phrases_mr: [
      "ठरवून दिलेल्या वेळेपेक्षा गाडी मिळण्यास बराच उशीर झाला.",
      "कोणतीही पूर्वकल्पना न देता कामात विलंब झाला.",
      "वेळेचे नियोजन अधिक काटेकोर असणे आवश्यक आहे.",
      "वेळेवर गाडी न मिळाल्यामुळे गैरसोय झाली."
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
      "Bill was higher than expected for standard maintenance."
    ],
    phrases_hi: [
      "Initial estimate se final cost kaafi high laga.",
      "Labor charges thode steep mehsoos hue.",
      "Cost aur competitive hone ki zaroorat hai.",
      "Service bill expected se zyada laga."
    ],
    phrases_hinglish: [
      "Initial estimate se final cost kaafi high laga.",
      "Labor charges thode steep mehsoos hue.",
      "Cost aur competitive hone ki zaroorat hai.",
      "Service bill expected se zyada laga."
    ],
    phrases_hindi: [
      "शुरुआती एस्टीमेट के मुकाबले रिपेयर खर्च काफी ज्यादा लगा।",
      "लेबर चार्ज अपेक्षा से अधिक महसूस हुआ।",
      "प्राइसिंग और वाजिब होनी चाहिए।",
      "बिल सामान्य सर्विसिंग की तुलना में अधिक रहा।"
    ],
    phrases_mr: [
      "सुरुवातीच्या अंदाजापेक्षा दुरुस्तीचा खर्च बराच जास्त आला.",
      "कामाचे दर अपेक्षेपेक्षा जास्त वाटले.",
      "दर अधिक वाजवी असायला हवे होते.",
      "बिल अपेक्षेपेक्षा जास्त आले."
    ],
  },
  {
    id: "auto_issue_explained",
    label: "Issue explained before work",
    sentiment: "positive",
    phrases_en: [
      "The mechanic explained the issue thoroughly before starting work.",
      "Took time to walk me under the car and show the problem.",
      "Clear explanation of what was wrong and why it needed fixing.",
      "Appreciated having the problem diagnosed and explained clearly."
    ],
    phrases_hi: [
      "Kaam shuru hone se pehle issue acche se samjhaya mila.",
      "Problem detail mein dikhai aur explain dekhne ko mili.",
      "Fault aur repair reason clearly bataya mila.",
      "Issue explanation se complete clarity mili."
    ],
    phrases_hinglish: [
      "Kaam shuru hone se pehle issue acche se samjhaya mila.",
      "Problem detail mein dikhai aur explain dekhne ko mili.",
      "Fault aur repair reason clearly bataya mila.",
      "Issue explanation se complete clarity mili."
    ],
    phrases_hindi: [
      "काम शुरू करने से पहले समस्या को बहुत विस्तार से समझाया गया।",
      "समस्या का कारण और समाधान स्पष्ट रूप से दिखाया गया।",
      "गाड़ी में क्या खराबी थी यह बहुत साफ समझ आया।",
      "समस्या की सटीक पहचान और व्याख्या बहुत अच्छी रही।"
    ],
    phrases_mr: [
      "काम सुरू करण्यापूर्वी बिघाडाचे नेमके कारण सविस्तर समजावून सांगितले.",
      "समस्या नेमकी काय आहे हे दाखवून खात्री दिली गेली.",
      "दुरुस्ती का आवश्यक आहे हे स्पष्टपणे कळाले.",
      "समस्येचे अचूक विश्लेषण ऐकून समाधान वाटले."
    ],
  },
  {
    id: "auto_options_discussed",
    label: "Repair options discussed",
    sentiment: "positive",
    phrases_en: [
      "Different repair and replacement options were discussed openly.",
      "Mechanic gave practical choices between repair and new parts.",
      "Helpful advice on prioritizing urgent versus routine fixes.",
      "No pressure — walked me through budget-friendly alternatives."
    ],
    phrases_hi: [
      "Repair aur replacement options openly discuss huye.",
      "Budget aur priority ke hisab se practical choices mili.",
      "Zaroori aur routine kaam ka clear difference bataya.",
      "Sahi options evaluate karne mein honest help mili."
    ],
    phrases_hinglish: [
      "Repair aur replacement options openly discuss huye.",
      "Budget aur priority ke hisab se practical choices mili.",
      "Zaroori aur routine kaam ka clear difference bataya.",
      "Sahi options evaluate karne mein honest help mili."
    ],
    phrases_hindi: [
      "मरम्मत और बदलने के विभिन्न विकल्पों पर खुलकर चर्चा की गई।",
      "बजट और प्राथमिकता के अनुसार व्यावहारिक सुझाव दिए गए।",
      "बिना किसी दबाव के सही निर्णय लेने में मदद मिली।",
      "आवश्यक और सामान्य मरम्मत का स्पष्ट अंतर समझाया गया।"
    ],
    phrases_mr: [
      "दुरुस्ती आणि भाग बदलण्याच्या पर्यायांवर मोकळेपणाने चर्चा झाली.",
      "खर्च आणि गरजेनुसार योग्य पर्याय निवडता आले.",
      "कोणताही अवाजवी दबाव न आणता योग्य सल्ला दिला.",
      "विविध उपायांचे स्पष्टीकरण खूप उपयुक्त ठरले."
    ],
  },
  {
    id: "auto_agreed_work",
    label: "Work completed as agreed",
    sentiment: "positive",
    phrases_en: [
      "All agreed repairs were completed exactly as discussed.",
      "Checklist of tasks was followed without skipping anything.",
      "Delivered on every repair item promised.",
      "Job was completed faithfully according to the work order."
    ],
    phrases_hi: [
      "Agreed work order ke hisab se pura kaam complete hua.",
      "Checklist ke saare tasks acche se cover huye.",
      "Discussion ke mutabiq har repair complete mila.",
      "Workmanship promised standards ke hisab se lagi."
    ],
    phrases_hinglish: [
      "Agreed work order ke hisab se pura kaam complete hua.",
      "Checklist ke saare tasks acche se cover huye.",
      "Discussion ke mutabiq har repair complete mila.",
      "Workmanship promised standards ke hisab se lagi."
    ],
    phrases_hindi: [
      "सहमति के अनुसार सभी मरम्मत का काम पूरी तरह संपन्न हुआ।",
      "काम की सूची का हर बिंदु ध्यानपूर्वक पूरा किया गया।",
      "दिए गए वादे के मुताबिक हर काम दुरुस्त मिला।",
      "कार्य आदेश के अनुसार पूरी गुणवत्ता के साथ काम हुआ।"
    ],
    phrases_mr: [
      "ठरल्याप्रमाणे सर्व काम अगदी व्यवस्थित पूर्ण केले गेले.",
      "कामाच्या यादीतील प्रत्येक मुद्दा अचूकपणे हाताळला गेला.",
      "दिलेल्या शब्दाप्रमाणे संपूर्ण दुरुस्ती चोख पार पडली.",
      "कामाच्या दर्जानुसार उत्तम परिणाम पाहायला मिळाला."
    ],
  },
  {
    id: "auto_charges_clear",
    label: "Charges explained clearly",
    sentiment: "positive",
    phrases_en: [
      "All charges and taxes were explained clearly on the bill.",
      "Breakdown of labor versus spare parts was transparent.",
      "Understood every single line item on the invoice.",
      "No surprises — bill was detailed and easy to review."
    ],
    phrases_hi: [
      "Bill par charges aur taxes clearly explain kiye gaye.",
      "Labour aur parts ka breakdown transparent mila.",
      "Invoice ka har item clearly samajh mila.",
      "Detailed bill mila bina kisi hidden charge ke."
    ],
    phrases_hinglish: [
      "Bill par charges aur taxes clearly explain kiye gaye.",
      "Labour aur parts ka breakdown transparent mila.",
      "Invoice ka har item clearly samajh mila.",
      "Detailed bill mila bina kisi hidden charge ke."
    ],
    phrases_hindi: [
      "बिल पर सभी शुल्क और कर बहुत स्पष्ट रूप से समझाए गए।",
      "मजदूरी और सुटे पुर्जों की लागत का विवरण पारदर्शी रहा।",
      "इनवॉइस की हर मद को समझना बहुत आसान था।",
      "बिना किसी आश्चर्य के एक विस्तृत और स्पष्ट बिल मिला।"
    ],
    phrases_mr: [
      "बिलावरील सर्व आकार आणि कर स्पष्टपणे समजावून सांगितले गेले.",
      "मजुरी आणि सुट्या भागांचे दर अतिशय पारदर्शक होते.",
      "इनव्हॉईसवरील प्रत्येक बाब नीट समजून घेता आली.",
      "सविस्तर आणि खात्रीशीर बिल मिळाल्याने समाधान वाटले."
    ],
  },
  {
    id: "auto_smooth_handover",
    label: "Smooth vehicle handover",
    sentiment: "positive",
    phrases_en: [
      "Vehicle handover was organized, quick, and smooth.",
      "Mechanic walked me through the car and completed test drive.",
      "Checklist reviewed together before signing off.",
      "Professional vehicle delivery process."
    ],
    phrases_hi: [
      "Vehicle handover ka process smooth aur organized laga.",
      "Car walk-through aur test check ke baad handover mila.",
      "Delivery time par checklist review hua.",
      "Handover experience kaafi professional laga."
    ],
    phrases_hinglish: [
      "Vehicle handover ka process smooth aur organized laga.",
      "Car walk-through aur test check ke baad handover mila.",
      "Delivery time par checklist review hua.",
      "Handover experience kaafi professional laga."
    ],
    phrases_hindi: [
      "वाहन सौंपने की प्रक्रिया बहुत व्यवस्थित और सुगम रही।",
      "काम की जांच और संतुष्टि के बाद ही गाड़ी सौंपी गई।",
      "सुपुर्दगी के समय सभी बिंदुओं की एक साथ समीक्षा की गई।",
      "गाड़ी वापस लेने का अनुभव बहुत ही पेशेवर रहा।"
    ],
    phrases_mr: [
      "गाडी ताब्यात देण्याची प्रक्रिया अतिशय सुरळीत आणि शिस्तबद्ध झाली.",
      "कामाची तपासणी करून आणि समाधान झाल्यावरच गाडी दिली गेली.",
      "गाडी सुपूर्द करताना सर्व बाबींची खात्री करून देण्यात आली.",
      "अतिशय व्यावसायिक पद्धतीने गाडी ताब्यात मिळाली."
    ],
  },
  {
    id: "auto_accurate_diagnosis",
    label: "Accurate problem diagnosis",
    sentiment: "positive",
    phrases_en: [
      "The mechanical diagnosis was accurate on the first attempt.",
      "Identified the root cause without unnecessary part replacements.",
      "Pinpointed the exact issue right away.",
      "Experienced diagnosis that saved time and unnecessary cost."
    ],
    phrases_hi: [
      "Pehle hi attempt mein issue accurately diagnose hua.",
      "Root cause sahi identify hui bina faltu parts change kiye.",
      "Exact problem turant pinpoint ho mili.",
      "Accurate diagnosis se time aur paise dono bache."
    ],
    phrases_hinglish: [
      "Pehle hi attempt mein issue accurately diagnose hua.",
      "Root cause sahi identify hui bina faltu parts change kiye.",
      "Exact problem turant pinpoint ho mili.",
      "Accurate diagnosis se time aur paise dono bache."
    ],
    phrases_hindi: [
      "पहली ही बार में समस्या की बिल्कुल सही पहचान की गई।",
      "अनावश्यक पुर्जे बदले बिना असली खराबी को ठीक किया गया।",
      "खराबी का सटीक कारण तुरंत पता लगा लिया गया।",
      "सटीक जांच से समय और अनावश्यक खर्च दोनों की बचत हुई।"
    ],
    phrases_mr: [
      "पहिल्याच प्रयत्नात गाडीतील दोषाचे अचूक निदान झाले.",
      "अनावश्यक भाग न बदलता मूळ समस्येचे निराकरण केले गेले.",
      "बिघाडाचे मूळ कारण अचूकपणे शोधून काढले.",
      "अनुभवी तपासणीमुळे वेळ आणि अवाजवी खर्च वाचला."
    ],
  },
  {
    id: "auto_clean_return",
    label: "Vehicle clean upon return",
    sentiment: "positive",
    phrases_en: [
      "Car was returned clean and tidy after servicing.",
      "No grease marks or dirt on the steering wheel or seats.",
      "Appreciated the careful handling of my vehicle interior.",
      "Washed and neat car handed back."
    ],
    phrases_hi: [
      "Servicing ke baad gaadi clean aur neat return mili.",
      "Seats ya steering par koi grease marks nahi the.",
      "Vehicle interior ki acchi care dekhne ko mili.",
      "Washed aur tidy car delivery mili."
    ],
    phrases_hinglish: [
      "Servicing ke baad gaadi clean aur neat return mili.",
      "Seats ya steering par koi grease marks nahi the.",
      "Vehicle interior ki acchi care dekhne ko mili.",
      "Washed aur tidy car delivery mili."
    ],
    phrases_hindi: [
      "सर्विसिंग के बाद गाड़ी बिल्कुल साफ-सुथरी वापस मिली।",
      "स्टीयरिंग या सीटों पर ग्रीस का कोई दाग नहीं था।",
      "गाड़ी के आंतरिक हिस्से की सफाई का पूरा ध्यान रखा गया।",
      "धुली हुई और स्वच्छ स्थिति में गाड़ी वापस सौंपी गई।"
    ],
    phrases_mr: [
      "सर्व्हिसिंगनंतर गाडी अतिशय स्वच्छ आणि चकचकीत करून परत मिळाली.",
      "स्टीअरिंग किंवा सीटवर तेलाचे कोणतेही डाग नव्हते.",
      "गाडीच्या आतील भागाची उत्तम स्वच्छता राखलेली दिसली.",
      "स्वच्छ आणि नीटनेटकी गाडी मिळाल्याने खूप आनंद झाला."
    ],
  },
  {
    id: "auto_helpful_advice",
    label: "Mechanic gave helpful advice",
    sentiment: "positive",
    phrases_en: [
      "Mechanic gave helpful maintenance advice for the future.",
      "Practical tips on preserving tire life and engine health.",
      "Helpful guidance without any aggressive upselling.",
      "Appreciated the honest automotive care recommendations."
    ],
    phrases_hi: [
      "Mechanic ne future maintenance ke liye helpful advice diya.",
      "Engine aur tires ki care ke practical tips mile.",
      "Bina kisi upselling ke genuine guidance mila.",
      "Car care recommendations kaafi useful lage."
    ],
    phrases_hinglish: [
      "Mechanic ne future maintenance ke liye helpful advice diya.",
      "Engine aur tires ki care ke practical tips mile.",
      "Bina kisi upselling ke genuine guidance mila.",
      "Car care recommendations kaafi useful lage."
    ],
    phrases_hindi: [
      "मैकेनिक ने भविष्य के रखरखाव के लिए बहुत उपयोगी सलाह दी।",
      "इंजन और टायरों की लंबी उम्र के लिए व्यावहारिक टिप्स मिले।",
      "अनावश्यक सामान बेचे बिना सच्ची सलाह दी गई।",
      "गाड़ी की देखभाल के बारे में बहुत अच्छा मार्गदर्शन मिला।"
    ],
    phrases_mr: [
      "मेकॅनिकने पुढील देखभालीसाठी अतिशय उपयुक्त मार्गदर्शन केले.",
      "इंजिन आणि टायर्सच्या चांगल्या आरोग्यासाठी सोप्या टिप्स दिल्या.",
      "कोणताही अवाजवी खर्च न सुचवता प्रामाणिक सल्ला दिला.",
      "गाडीच्या चांगल्या देखभालीसाठी मिळालेला सल्ला मोलाचा ठरला."
    ],
  },
  {
    id: "auto_itemised_bill",
    label: "Clear itemised bill",
    sentiment: "positive",
    phrases_en: [
      "Invoice was fully itemised with part numbers and prices.",
      "Every consumable and part was accounted for clearly.",
      "Transparent documentation of all tasks performed.",
      "Itemized bill that made reviewing costs simple."
    ],
    phrases_hi: [
      "Invoice fully itemized mila part numbers ke saath.",
      "Har part aur consumable clearly listed mila.",
      "Kaam aur charges ka clear record mila.",
      "Bill review karna kaafi simple aur clear laga."
    ],
    phrases_hinglish: [
      "Invoice fully itemized mila part numbers ke saath.",
      "Har part aur consumable clearly listed mila.",
      "Kaam aur charges ka clear record mila.",
      "Bill review karna kaafi simple aur clear laga."
    ],
    phrases_hindi: [
      "बिल में हर पुर्जे और काम का अलग-अलग विवरण दिया गया था।",
      "प्रत्येक सामग्री और लागत को साफ-साफ दर्ज किया गया।",
      "किए गए सभी कार्यों का पारदर्शी दस्तावेज मिला।",
      "विस्तृत बिल के कारण खर्च समझना बहुत आसान रहा।"
    ],
    phrases_mr: [
      "बिलामध्ये प्रत्येक भागाचा आणि कामाचा सविस्तर तपशील होता.",
      "सर्व खर्चाची नोंद अतिशय सुस्पष्ट होती.",
      "झालेल्या कामाचे पारदर्शक बिल हातात मिळाले.",
      "खर्च समजून घेणे आणि तपासणे अतिशय सोपे झाले."
    ],
  },
  {
    id: "auto_prompt_service",
    label: "Prompt intake and service",
    sentiment: "positive",
    phrases_en: [
      "Intake process was prompt and staff inspected the car right away.",
      "No waiting at the service desk — attended immediately.",
      "Prompt job card creation and quick check-in.",
      "Efficient start to the service session."
    ],
    phrases_hi: [
      "Gaadi ka intake prompt hua aur turant inspection shuru hui.",
      "Service desk par waiting nahi lagi.",
      "Job card quickly create complete mila.",
      "Efficient aur prompt service intake dekhne ko mila."
    ],
    phrases_hinglish: [
      "Gaadi ka intake prompt hua aur turant inspection shuru hui.",
      "Service desk par waiting nahi lagi.",
      "Job card quickly create complete mila.",
      "Efficient aur prompt service intake dekhne ko mila."
    ],
    phrases_hindi: [
      "गाड़ी जमा करने की प्रक्रिया त्वरित रही और तुरंत निरीक्षण हुआ।",
      "सर्विस डेस्क पर बिल्कुल इंतजार नहीं करना पड़ा।",
      "जॉब कार्ड तुरंत बन गया और काम समय पर शुरू हुआ।",
      "सेवा की शुरुआत बहुत ही त्वरित और व्यवस्थित रही।"
    ],
    phrases_mr: [
      "गाडी जमा करून घेण्याची प्रक्रिया अतिशय जलद आणि तत्पर झाली.",
      "सर्व्हिस डेस्कवर कोणतीही वाट पाहावी लागली नाही.",
      "जॉब कार्ड त्वरित बनवून गाडी तपासणीसाठी घेण्यात आली.",
      "कामाची सुरुवात अतिशय वेगाने आणि व्यवस्थित झाली."
    ],
  }
];

// ─── 8. Professional & Home Services Chips ───────────────────────────────────

export const SERVICES_CHIPS = [
  {
    id: "serv_expert",
    label: "Expert consultation",
    sentiment: "positive",
    phrases_en: [
      "Demonstrated deep domain expertise and sound advice.",
      "Understood requirements thoroughly with professional clarity.",
      "Very knowledgeable guidance on complex matters.",
      "High competence and clear strategic insights."
    ],
    phrases_hi: [
      "Domain expertise aur sound professional advice mila.",
      "Requirements ko kaafi thoroughly aur clearly samjha.",
      "Experienced guidance aur reliable consultation laga.",
      "Strategic insights aur understanding kaafi sharp lagi."
    ],
    phrases_hinglish: [
      "Domain expertise aur sound professional advice mila.",
      "Requirements ko kaafi thoroughly aur clearly samjha.",
      "Experienced guidance aur reliable consultation laga.",
      "Strategic insights aur understanding kaafi sharp lagi."
    ],
    phrases_hindi: [
      "कार्यक्षेत्र की गहरी समझ और सटीक सलाह मिली।",
      "ज़रूरतों को पूरी स्पष्टता और पेशेवर तरीके से समझा गया।",
      "सटीक और अनुभवी मार्गदर्शन प्राप्त हुआ।",
      "व्यावसायिक समझ और रणनीतिक सलाह बहुत ही उपयोगी रही।"
    ],
    phrases_mr: [
      "विषयाचे सखोल ज्ञान आणि योग्य सल्ला मिळाला.",
      "गरजा समजून घेऊन व्यावसायिक पद्धतीने मार्गदर्शन केले.",
      "अनुभवी आणि विश्वासार्ह सल्ल्याचा फायदा झाला.",
      "कामातील कौशल्य आणि सल्ला अत्यंत उपयुक्त ठरला."
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
      "Smooth coordination and professional handling."
    ],
    phrases_hi: [
      "Clear aur transparent communication mila.",
      "Har stage par regular updates aur prompt response mila.",
      "Queries patiently explain ki hui milin.",
      "Coordination aur updates kaafi reliable rahe."
    ],
    phrases_hinglish: [
      "Clear aur transparent communication mila.",
      "Har stage par regular updates aur prompt response mila.",
      "Queries patiently explain ki hui milin.",
      "Coordination aur updates kaafi reliable rahe."
    ],
    phrases_hindi: [
      "काम के दौरान स्पष्ट बातचीत और समय पर अपडेट्स मिले।",
      "सवालों का तुरंत और तसल्ली से जवाब दिया गया।",
      "पारदर्शी संचार और पेशेवर तरीका देखने को मिला।",
      "हर चरण पर सही जानकारी और सहयोग प्राप्त हुआ।"
    ],
    phrases_mr: [
      "स्पष्ट आणि पारदर्शक संवाद तसेच नियमित कामाचे अपडेट्स मिळाले.",
      "विचारलेल्या प्रश्नांची तत्परतेने उत्तरे दिली गेली.",
      "संवाद अतिशय सुलभ आणि व्यावसायिक राहिला.",
      "प्रत्येक टप्प्यावर योग्य मार्गदर्शन आणि सहकार्य लाभले."
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
      "Milestones were met on schedule as agreed."
    ],
    phrases_hi: [
      "Committed deadline ke andar kaam complete hua.",
      "Time management aur discipline kaafi impressive laga.",
      "Punctual delivery without delay.",
      "Agreed timeline bilkul properly follow hui."
    ],
    phrases_hinglish: [
      "Committed deadline ke andar kaam complete hua.",
      "Time management aur discipline kaafi impressive laga.",
      "Punctual delivery without delay.",
      "Agreed timeline bilkul properly follow hui."
    ],
    phrases_hindi: [
      "तय समयसीमा के भीतर पूरी जिम्मेदारी से काम पूरा हुआ।",
      "समय की पाबंदी और गुणवत्ता का बेहतरीन संतुलन मिला।",
      "अनुशासित और समय पर कार्य पूरा किया गया।",
      "दिए गए वचनों के अनुसार समयबद्ध डिलीवरी मिली।"
    ],
    phrases_mr: [
      "दिलेल्या मुदतीत काम पूर्ण केले गेले.",
      "वेळेची शिस्त आणि कामाचा दर्जा दोन्ही उत्तम राखले.",
      "वेळेचे योग्य नियोजन कौतुकास्पद वाटले.",
      "ठरलेल्या वेळापत्रकानुसार काम सुरळीत पार पडले."
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
      "A reliable partner for professional needs."
    ],
    phrases_hi: [
      "Trustworthy aur dependable team ke saath kaam hua.",
      "Documentation aur handling kaafi safe aur reliable lagi.",
      "Client satisfaction par achha focus mila.",
      "Professional partnership kaafi reassuring lagi."
    ],
    phrases_hinglish: [
      "Trustworthy aur dependable team ke saath kaam hua.",
      "Documentation aur handling kaafi safe aur reliable lagi.",
      "Client satisfaction par achha focus mila.",
      "Professional partnership kaafi reassuring lagi."
    ],
    phrases_hindi: [
      "पूरी तरह विश्वसनीय और ग्राहक-केंद्रित कार्यशैली मिली।",
      "गोपनीयता और जिम्मेदारी का पूरा ध्यान रखा गया।",
      "साथ काम करके पूरी संतुष्टि और भरोसा बना।",
      "व्यावसायिक जरूरतों के लिए एक भरोसेमंद टीम साबित हुई।"
    ],
    phrases_mr: [
      "अतिशय विश्वासार्ह आणि कामावर निष्ठा असणारी टीम आढळली.",
      "कामातील गोपनीयता आणि जबाबदारी योग्यरीत्या सांभाळली गेली.",
      "एकत्र काम करताना पूर्ण विश्वास वाटला.",
      "व्यावसायिक कामांसाठी अत्यंत भरवशाची संस्था वाटली."
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
      "Delays in addressing pending queries."
    ],
    phrases_hi: [
      "Calls aur messages ka response kaafi slow mila.",
      "Follow-up lene mein kaafi time laga.",
      "Communication turnaround fast hona chahiye.",
      "Pending queries address hone mein delay hua."
    ],
    phrases_hinglish: [
      "Calls aur messages ka response kaafi slow mila.",
      "Follow-up lene mein kaafi time laga.",
      "Communication turnaround fast hona chahiye.",
      "Pending queries address hone mein delay hua."
    ],
    phrases_hindi: [
      "कॉल और ईमेल का जवाब मिलने में काफी समय लगा।",
      "अपडेट्स के लिए कई बार फॉलो-अप करना पड़ा।",
      "बातचीत की रफ्तार और बेहतर होनी चाहिए।",
      "प्रश्नों के उत्तर में विलंब का सामना करना पड़ा।"
    ],
    phrases_mr: [
      "फोन किंवा ईमेलला उत्तर मिळण्यास बराच वेळ लागला.",
      "माहितीसाठी वारंवार पाठपुरावा करावा लागला.",
      "संवादाचा वेग अधिक जलद असायला हवा होता.",
      "प्रश्नांची उत्तरे मिळण्यात अनावश्यक विलंब झाला."
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
      "Lack of early clarity on deliverables."
    ],
    phrases_hi: [
      "Project scope aur timeline pehle clear nahi mili.",
      "Initial expectations mein ambiguity mehsoos hui.",
      "Clarity aur planning better honi chahiye.",
      "Deliverables ki outline aur sharp honi chahiye."
    ],
    phrases_hinglish: [
      "Project scope aur timeline pehle clear nahi mili.",
      "Initial expectations mein ambiguity mehsoos hui.",
      "Clarity aur planning better honi chahiye.",
      "Deliverables ki outline aur sharp honi chahiye."
    ],
    phrases_hindi: [
      "काम की समयसीमा और स्कोप शुरुआत में स्पष्ट नहीं था।",
      "अपेक्षाओं और प्रोसेस को लेकर असमंजस रहा।",
      "शुरुआत में अधिक स्पष्टता की आवश्यकता महसूस हुई।",
      "योजना और डिलीवरी के प्रारूप में और स्पष्टता होनी चाहिए।"
    ],
    phrases_mr: [
      "कामाची व्याप्ती आणि मुदत सुरुवातीला स्पष्ट नव्हती.",
      "अपेक्षा आणि कामाच्या पद्धतीबाबत संदिग्धता राहिली.",
      "सुरुवातीला अधिक स्पष्टता असणे गरजेचे होते.",
      "नियोजनाचा आराखडा अधिक स्पष्ट असायला हवा होता."
    ],
  },
  {
    id: "serv_requirements_met",
    label: "Requirements understood",
    sentiment: "positive",
    phrases_en: [
      "The team understood all requirements thoroughly.",
      "Took time to grasp our specific business needs.",
      "Listened carefully and framed the right solution.",
      "Understood our goals without any ambiguity."
    ],
    phrases_hi: [
      "Team ne requirements ko acche se samjha.",
      "Specific needs aur goals par pura dhyan dekhne ko mila.",
      "Dhyan se sunkar sahi solution design dekhne ko mila.",
      "Objectives bilkul clearly grasp kiye gaye."
    ],
    phrases_hinglish: [
      "Team ne requirements ko acche se samjha.",
      "Specific needs aur goals par pura dhyan dekhne ko mila.",
      "Dhyan se sunkar sahi solution design dekhne ko mila.",
      "Objectives bilkul clearly grasp kiye gaye."
    ],
    phrases_hindi: [
      "टीम ने सभी आवश्यकताओं को बहुत गहराई से समझा।",
      "हमारी विशिष्ट जरूरतों को समझने के लिए उचित समय दिया।",
      "ध्यान से सुनकर सही समाधान की रूपरेखा तैयार की गई।",
      "उद्देश्यों को बिना किसी अस्पष्टता के समझा गया।"
    ],
    phrases_mr: [
      "संघाने सर्व गरजा अतिशय काळजीपूर्वक समजून घेतल्या.",
      "विशिष्ट व्यावसायिक गरजांची योग्य दखल घेतली गेली.",
      "लक्षपूर्वक ऐकून योग्य तोडगा काढण्यात आला.",
      "उद्दिष्टे अचूक समजून घेतल्याने काम सोपे झाले."
    ],
  },
  {
    id: "serv_updates_provided",
    label: "Updates provided during work",
    sentiment: "positive",
    phrases_en: [
      "Regular updates were provided as work progressed.",
      "Kept in the loop with transparent status summaries.",
      "Appreciated the proactive milestone check-ins.",
      "Clear visibility on project progress throughout."
    ],
    phrases_hi: [
      "Kaam ke dauraan regular updates milti lagi.",
      "Transparent progress reports se sab clear laga.",
      "Milestone check-ins proactive aur helpful lage.",
      "Project progress par continuous visibility mili."
    ],
    phrases_hinglish: [
      "Kaam ke dauraan regular updates milti lagi.",
      "Transparent progress reports se sab clear laga.",
      "Milestone check-ins proactive aur helpful lage.",
      "Project progress par continuous visibility mili."
    ],
    phrases_hindi: [
      "काम की प्रगति के दौरान नियमित रूप से अपडेट मिलते रहे।",
      "पारदर्शी स्थिति रिपोर्ट के माध्यम से पूरी जानकारी रही।",
      "समय-समय पर प्रगति की समीक्षा बहुत उपयोगी रही।",
      "परियोजना की स्थिति पर हमेशा स्पष्टता बनी रही।"
    ],
    phrases_mr: [
      "कामाच्या प्रगतीची नियमित माहिती वेळेवर मिळत राहिली.",
      "पारदर्शक अहवालांमुळे कामाची सद्यस्थिती कळत होती.",
      "टप्प्याटप्प्याने घेतलेला आढावा अतिशय उपयुक्त ठरला.",
      "कामाच्या प्रगतीवर पूर्ण लक्ष ठेवता आले."
    ],
  },
  {
    id: "serv_options_explained",
    label: "Options explained clearly",
    sentiment: "positive",
    phrases_en: [
      "Different technical and service options were explained clearly.",
      "Walked me through the trade-offs of each approach.",
      "Clear breakdown of deliverables and strategy.",
      "Helpful guidance on choosing the right package."
    ],
    phrases_hi: [
      "Service options aur strategy acche se dekhne ko mili.",
      "Har approach ke pros aur cons clearly explain huye.",
      "Deliverables ka breakdown kaafi clear mila.",
      "Sahi package choose karne mein accha guidance mila."
    ],
    phrases_hinglish: [
      "Service options aur strategy acche se dekhne ko mili.",
      "Har approach ke pros aur cons clearly explain huye.",
      "Deliverables ka breakdown kaafi clear mila.",
      "Sahi package choose karne mein accha guidance mila."
    ],
    phrases_hindi: [
      "विभिन्न तकनीकी और सेवा विकल्पों को बहुत स्पष्ट समझाया गया।",
      "प्रत्येक दृष्टिकोण के फायदे और नुकसान विस्तार से बताए गए।",
      "रणनीति और परिणामों का बहुत साफ विवरण मिला।",
      "सही विकल्प चुनने में बहुत उपयोगी सलाह मिली।"
    ],
    phrases_mr: [
      "सेवेचे विविध पर्याय अतिशय सुस्पष्टपणे समजावून सांगितले गेले.",
      "प्रत्येक पद्धतीचे फायदे-तोटे नीट समजून घेता आले.",
      "कामाची दिशा आणि नियोजन स्पष्ट होते.",
      "योग्य पॅकेज निवडण्यासाठी मोलाचे मार्गदर्शन लाभले."
    ],
  },
  {
    id: "serv_scope_matched",
    label: "Work matched agreed scope",
    sentiment: "positive",
    phrases_en: [
      "Delivered work matched the agreed scope completely.",
      "All contractual deliverables were completed as promised.",
      "No deviations from the approved plan.",
      "Job was completed faithfully according to the contract."
    ],
    phrases_hi: [
      "Delivered kaam agreed scope se poori tarah match hua.",
      "Saare deliverables promised standards ke hisab se mile.",
      "Approved plan se koi deviation nahi laga.",
      "Contract ke mutabiq complete execution mila."
    ],
    phrases_hinglish: [
      "Delivered kaam agreed scope se poori tarah match hua.",
      "Saare deliverables promised standards ke hisab se mile.",
      "Approved plan se koi deviation nahi laga.",
      "Contract ke mutabiq complete execution mila."
    ],
    phrases_hindi: [
      "दिया गया काम पूरी तरह से तय किए गए दायरे के अनुरूप था।",
      "अनुबंध के सभी बिंदु वादे के अनुसार पूरे किए गए।",
      "स्वीकृत योजना से कोई भटकाव नहीं देखने को मिला।",
      "समझौते के अनुसार निष्ठापूर्वक काम संपन्न हुआ।"
    ],
    phrases_mr: [
      "दिलेले काम ठरलेल्या मर्यादेनुसार अगदी चोख पूर्ण झाले.",
      "करारातील सर्व बाबी दिलेल्या वचनानुसार पूर्ण केल्या गेल्या.",
      "योजनेनुसारच सर्व काम पार पडले.",
      "कराराप्रमाणे प्रामाणिक आणि दर्जेदार सेवा मिळाली."
    ],
  },
  {
    id: "serv_questions_answered",
    label: "Questions answered promptly",
    sentiment: "positive",
    phrases_en: [
      "All project questions were answered promptly and clearly.",
      "Great communication with swift email and call responses.",
      "No delays in addressing feedback or clarifications.",
      "Responsive team that resolved queries without delay."
    ],
    phrases_hi: [
      "Saare project questions ka prompt answer mila.",
      "Calls aur messages par quick response dekhne ko mila.",
      "Clarifications turant address kiye gaye.",
      "Team ka responsiveness kaafi impressive laga."
    ],
    phrases_hinglish: [
      "Saare project questions ka prompt answer mila.",
      "Calls aur messages par quick response dekhne ko mila.",
      "Clarifications turant address kiye gaye.",
      "Team ka responsiveness kaafi impressive laga."
    ],
    phrases_hindi: [
      "परियोजना से जुड़े सभी सवालों के तुरंत और स्पष्ट उत्तर दिए गए।",
      "ईमेल और फोन पर बहुत ही त्वरित संवाद देखने को मिला।",
      "सुझावों और स्पष्टीकरण पर बिना किसी देरी के काम हुआ।",
      "सक्रिय टीम जिसने हर शंका का तुरंत समाधान किया।"
    ],
    phrases_mr: [
      "कामाविषयीच्या सर्व प्रश्नांची तातडीने उत्तरे देण्यात आली.",
      "ईमेल आणि फोनवर अतिशय जलद संवाद साधला गेला.",
      "सूचना आणि शंकांचे निरसन लगेचच केले गेले.",
      "संघाची तत्परता अतिशय कौतुकास्पद वाटली."
    ],
  },
  {
    id: "serv_professional_team",
    label: "Professional approach",
    sentiment: "positive",
    phrases_en: [
      "The team demonstrated a very professional approach throughout.",
      "Courteous, organized, and focused on delivering quality.",
      "High professional standards reflected in their conduct.",
      "Pleasure to work with such a competent team."
    ],
    phrases_hi: [
      "Team ka professional approach kaafi impressive laga.",
      "Organized, courteous aur focused working style mili.",
      "High professional standards dekhne ko mile.",
      "Competent team ke saath kaam karke accha laga."
    ],
    phrases_hinglish: [
      "Team ka professional approach kaafi impressive laga.",
      "Organized, courteous aur focused working style mili.",
      "High professional standards dekhne ko mile.",
      "Competent team ke saath kaam karke accha laga."
    ],
    phrases_hindi: [
      "टीम ने पूरे कार्य के दौरान बहुत ही पेशेवर दृष्टिकोण दिखाया।",
      "विनम्र, व्यवस्थित और गुणवत्ता पर ध्यान केंद्रित करने वाली कार्यशैली रही।",
      "उनके आचरण में उच्च पेशेवर मानकों की झलक दिखी।",
      "ऐसी सक्षम टीम के साथ काम करना सुखद रहा।"
    ],
    phrases_mr: [
      "संघाने संपूर्ण कामात अतिशय व्यावसायिक दृष्टिकोन दाखवला.",
      "नम्र, शिस्तबद्ध आणि गुणवत्तेवर लक्ष केंद्रित करणारी पद्धत दिसली.",
      "त्यांच्या वागण्या-बोलण्यात उच्च दर्जाची व्यावहारिकता दिसली.",
      "अशा कुशल संघासोबत काम करण्याचा अनुभव छान होता."
    ],
  },
  {
    id: "serv_transparent_pricing",
    label: "Transparent pricing",
    sentiment: "positive",
    phrases_en: [
      "Pricing and terms were completely transparent from day one.",
      "Clear scope of work with detailed cost breakdown.",
      "No hidden fees or unexpected billing adjustments.",
      "Honest commercial terms that were respected."
    ],
    phrases_hi: [
      "Pricing aur terms day one se transparent rahe.",
      "Clear cost breakdown mila bina kisi confusion ke.",
      "Koi hidden fees ya unexpected charges nahi lage.",
      "Commercial terms honest aur fair rahe."
    ],
    phrases_hinglish: [
      "Pricing aur terms day one se transparent rahe.",
      "Clear cost breakdown mila bina kisi confusion ke.",
      "Koi hidden fees ya unexpected charges nahi lage.",
      "Commercial terms honest aur fair rahe."
    ],
    phrases_hindi: [
      "शुरुआत से ही कीमतें और शर्तें पूरी तरह पारदर्शी थीं।",
      "विस्तृत लागत विवरण के साथ कार्य का स्पष्ट दायरा मिला।",
      "कोई छिपा हुआ शुल्क या अप्रत्याशित बिलिंग नहीं थी।",
      "ईमानदार व्यावसायिक शर्तों का पूरा सम्मान किया गया।"
    ],
    phrases_mr: [
      "पहिल्या दिवसापासूनच दर आणि अटी पूर्णपणे पारदर्शक होत्या.",
      "सविस्तर खर्चासह कामाची स्पष्ट रूपरेषा देण्यात आली.",
      "कोणतेही लपलेले शुल्क किंवा अनपेक्षित आकार नव्हते.",
      "व्यावसायिक अटींचे काटेकोर पालन केले गेले."
    ],
  },
  {
    id: "serv_thorough_quality",
    label: "Thorough quality check",
    sentiment: "positive",
    phrases_en: [
      "Work underwent a thorough quality check before delivery.",
      "Attention to detail and quality assurance was evident.",
      "Delivered polished, error-free results.",
      "Rigorous review that ensured high output quality."
    ],
    phrases_hi: [
      "Delivery se pehle thorough quality check dekhne ko mila.",
      "Quality assurance aur attention to detail clearly dikha.",
      "Polished aur error-free output deliver hua.",
      "Kaam ki quality checks kaafi strict aur reliable rahe."
    ],
    phrases_hinglish: [
      "Delivery se pehle thorough quality check dekhne ko mila.",
      "Quality assurance aur attention to detail clearly dikha.",
      "Polished aur error-free output deliver hua.",
      "Kaam ki quality checks kaafi strict aur reliable rahe."
    ],
    phrases_hindi: [
      "काम सौंपने से पहले उसकी बहुत गहन गुणवत्ता जांच की गई।",
      "बारीकियों पर ध्यान और गुणवत्ता आश्वासन साफ दिखाई दिया।",
      "पूरी तरह त्रुटिहीन और परिष्कृत परिणाम प्राप्त हुआ।",
      "कड़े निरीक्षण ने काम की उच्च गुणवत्ता सुनिश्चित की।"
    ],
    phrases_mr: [
      "काम देण्यापूर्वी त्याची सखोल दर्जा तपासणी केली गेली.",
      "कामातील बारकावे आणि गुणवत्तेची खात्री स्पष्टपणे जाणवली.",
      "अतिशय परिपूर्ण आणि चुकांशिवाय काम मिळाले.",
      "कडक तपासणीमुळे कामाचा दर्जा उत्कृष्ट राहिला."
    ],
  },
  {
    id: "serv_helpful_support",
    label: "Helpful follow-up support",
    sentiment: "positive",
    phrases_en: [
      "Continued to assist with follow-up questions after delivery.",
      "Helpful post-service support that resolved minor tweaks.",
      "Dependable support even after project completion.",
      "Reassuring post-delivery assistance provided."
    ],
    phrases_hi: [
      "Delivery ke baad bhi follow-up queries mein help mili.",
      "Post-service support kaafi responsive aur helpful laga.",
      "Completion ke baad bhi reliable assistance mila.",
      "Support team ne tweaks quickly resolve kiye."
    ],
    phrases_hinglish: [
      "Delivery ke baad bhi follow-up queries mein help mili.",
      "Post-service support kaafi responsive aur helpful laga.",
      "Completion ke baad bhi reliable assistance mila.",
      "Support team ne tweaks quickly resolve kiye."
    ],
    phrases_hindi: [
      "काम पूरा होने के बाद भी सहायता और सवालों के जवाब मिलते रहे।",
      "सेवा के बाद का समर्थन बहुत ही मददगार और तत्पर रहा।",
      "परियोजना पूरी होने के बाद भी विश्वसनीय सहयोग मिला।",
      "काम के बाद भी पूरा ध्यान और मार्गदर्शन दिया गया।"
    ],
    phrases_mr: [
      "काम पूर्ण झाल्यानंतरही सातत्याने योग्य सहकार्य मिळाले.",
      "कामानंतरची सेवा अतिशय तत्पर आणि उपयुक्त ठरली.",
      "प्रकल्प पूर्ण झाल्यावरही विश्वासार्ह मदत लाभली.",
      "पुढील शंकांचे निरसन लगेचच करून देण्यात आले."
    ],
  },
  {
    id: "serv_clear_milestones",
    label: "Clear milestones and timelines",
    sentiment: "positive",
    phrases_en: [
      "Project milestones and deadlines were set clearly from the start.",
      "Kept strictly to the agreed calendar and phase reviews.",
      "Transparent timeline tracking gave great peace of mind.",
      "Milestone-based progress executed with precision."
    ],
    phrases_hi: [
      "Project milestones aur timelines shuru se clear set huye.",
      "Agreed calendar aur reviews strictly follow huye.",
      "Timeline tracking transparent laga jis se clarity bani lagi.",
      "Milestone-based progress precision ke saath execute hui."
    ],
    phrases_hinglish: [
      "Project milestones aur timelines shuru se clear set huye.",
      "Agreed calendar aur reviews strictly follow huye.",
      "Timeline tracking transparent laga jis se clarity bani lagi.",
      "Milestone-based progress precision ke saath execute hui."
    ],
    phrases_hindi: [
      "परियोजना के पड़ाव और समय सीमा शुरुआत से ही स्पष्ट तय थी।",
      "तय किए गए कैलेंडर और समीक्षा बैठकों का कड़ाई से पालन हुआ।",
      "पारदर्शी समय प्रबंधन से मन को पूरा भरोसा रहा।",
      "चरणबद्ध तरीके से काम बिल्कुल सटीक गति से आगे बढ़ा।"
    ],
    phrases_mr: [
      "कामाचे टप्पे आणि मुदत सुरुवातीपासूनच अतिशय स्पष्ट ठरवली होती.",
      "ठरलेल्या वेळापत्रकाचे काटेकोर पालन करण्यात आले.",
      "पारदर्शक नियोजनामुळे कामाविषयी पूर्ण विश्वास निर्माण झाला.",
      "टप्प्याटप्प्याने होणारी प्रगती अतिशय अचूक राहिली."
    ],
  }
];

// ─── 9. Hotel & Hospitality Chips ────────────────────────────────────────────

export const HOTEL_CHIPS = [
  {
    id: "hotel_clean",
    label: "Clean & comfy rooms",
    sentiment: "positive",
    phrases_en: [
      "Rooms were very clean, comfortable, and well appointed.",
      "Fresh bed linens, clean towels, and spotless bathrooms.",
      "Housekeeping did a wonderful job maintaining cleanliness.",
      "Quiet, peaceful, and immaculate room setup."
    ],
    phrases_hi: [
      "Rooms kaafi clean, comfortable aur well-maintained mile.",
      "Bed linen aur washrooms spotless mile.",
      "Housekeeping cleanliness kaafi impressive lagi.",
      "Peaceful aur tidy room environment mila."
    ],
    phrases_hinglish: [
      "Rooms kaafi clean, comfortable aur well-maintained mile.",
      "Bed linen aur washrooms spotless mile.",
      "Housekeeping cleanliness kaafi impressive lagi.",
      "Peaceful aur tidy room environment mila."
    ],
    phrases_hindi: [
      "कमरे बेहद साफ, आरामदायक और अच्छी तरह व्यवस्थित मिले।",
      "साफ बेडशीट, तौलिए और बिल्कुल स्वच्छ बाथरूम रहे।",
      "हाउसकीपिंग टीम ने सफाई का बहुत अच्छा ध्यान रखा।",
      "शांत, स्वच्छ और सुकूनभरा कमरा मिला।"
    ],
    phrases_mr: [
      "खोली अतिशय स्वच्छ, आरामदायी आणि नीटनेटकी आढळली.",
      "स्वच्छ चादरी, टॉवेल्स आणि बाथरूम अत्यंत स्वच्छ होते.",
      "स्वच्छतेची काळजी अतिशय उत्तम घेतली गेली.",
      "शांत आणि आरामदायी वास्तव्याचा अनुभव आला."
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
      "Hospitality was genuinely heartwarming."
    ],
    phrases_hi: [
      "Staff ka behavior kaafi courteous aur warm mila.",
      "Check-in se checkout tak kaafi welcoming vibe lagi.",
      "Front desk team genuinely helpful lagi.",
      "Hospitality aur service care kaafi achhi lagi."
    ],
    phrases_hinglish: [
      "Staff ka behavior kaafi courteous aur warm mila.",
      "Check-in se checkout tak kaafi welcoming vibe lagi.",
      "Front desk team genuinely helpful lagi.",
      "Hospitality aur service care kaafi achhi lagi."
    ],
    phrases_hindi: [
      "स्टाफ का व्यवहार बहुत ही विनम्र, गर्मजोशी भरा और मददगार रहा।",
      "चेक-इन से लेकर चेक-आउट तक बहुत सुखद अनुभव मिला।",
      "रिसेप्शन टीम हर जरूरत पर तुरंत मदद के लिए तैयार रही।",
      "आतिथ्य और सेवाभाव बहुत ही सराहनीय रहा।"
    ],
    phrases_mr: [
      "कर्मचाऱ्यांचे वर्तन अत्यंत नम्र, आदरयुक्त आणि मदत करणारे होते.",
      "सुरुवातीपासून शेवटपर्यंत अतिशय आतिथ्यशील वातावरण अनुभवले.",
      "रिसेप्शनवरील कर्मचाऱ्यांनी प्रत्येक गरजेकडे लक्ष दिले.",
      "उत्कृष्ट आदरातिथ्यामुळे मन प्रसन्न झाले."
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
      "Ideal location for both leisure and business stays."
    ],
    phrases_hi: [
      "Location kaafi convenient aur centrally located mili.",
      "Peaceful aur safe neighborhood laga.",
      "Transport aur connectivity easy lagi.",
      "City access aur stay ke hisaab se ideal location lagi."
    ],
    phrases_hinglish: [
      "Location kaafi convenient aur centrally located mili.",
      "Peaceful aur safe neighborhood laga.",
      "Transport aur connectivity easy lagi.",
      "City access aur stay ke hisaab se ideal location lagi."
    ],
    phrases_hindi: [
      "लोकेशन बहुत ही सुविधाजनक और मुख्य जगहों से जुड़ी हुई मिली।",
      "आस-पास का माहौल शांत और सुरक्षित रहा।",
      "आने-जाने में कोई परेशानी नहीं हुई, उत्तम कनेक्टिविटी रही।",
      "ठहरने के लिए बहुत ही उपयुक्त जगह है।"
    ],
    phrases_mr: [
      "हॉटेलची जागा अतिशय सोयीस्कर आणि मध्यवर्ती ठिकाणी आहे.",
      "शांत आणि सुरक्षित परिसर अनुभवता आला.",
      "दळणवळणाची साधने सहज उपलब्ध झाली.",
      "मुक्कामासाठी अतिशय उत्तम जागा ठरली."
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
      "Fresh, healthy, and satisfying breakfast buffet."
    ],
    phrases_hi: [
      "Breakfast spread kaafi tasty aur fresh mila.",
      "Food quality aur options kaafi achhe lage.",
      "Dining service kaafi satisfying lagi.",
      "Morning meal fresh aur hygienic mila."
    ],
    phrases_hinglish: [
      "Breakfast spread kaafi tasty aur fresh mila.",
      "Food quality aur options kaafi achhe lage.",
      "Dining service kaafi satisfying lagi.",
      "Morning meal fresh aur hygienic mila."
    ],
    phrases_hindi: [
      "नाश्ता काफी स्वादिष्ट और ताजा मिला, विकल्पों की कमी नहीं थी।",
      "रेस्टोरेंट में खाने की क्वालिटी बहुत अच्छी रही।",
      "सुबह का नाश्ता बहुत ही संतोषजनक और सेहतमंद लगा।",
      "भोजन की गुणवत्ता बहुत अच्छी रही।"
    ],
    phrases_mr: [
      "सकाळचा नाश्ता चवदार आणि विविध पर्यायांसह ताजा मिळाला.",
      "रेस्टॉरंटमधील जेवणाचा दर्जा उत्तम होता.",
      "नाश्ता अतिशय समाधानकारक वाटला.",
      "जेवणाची चव आणि दर्जा मनापासून आवडला."
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
      "Delays at reception during arrival."
    ],
    phrases_hi: [
      "Check-in process kaafi slow mila.",
      "Scheduled time par room ready nahi mila, wait karna pada.",
      "Reception handling fast honi chahiye.",
      "Front desk par lamba wait face karna pada."
    ],
    phrases_hinglish: [
      "Check-in process kaafi slow mila.",
      "Scheduled time par room ready nahi mila, wait karna pada.",
      "Reception handling fast honi chahiye.",
      "Front desk par lamba wait face karna pada."
    ],
    phrases_hindi: [
      "चेक-इन में अपेक्षा से काफी अधिक समय लगा।",
      "तय समय पर पहुंचने के बाद भी कमरा तैयार नहीं था।",
      "रिसेप्शन पर लंबी लाइन और धीमी प्रक्रिया रही।",
      "आगमन पर स्वागत और रूम हैंडओवर में देरी हुई।"
    ],
    phrases_mr: [
      "चेक-इन प्रक्रियेस अपेक्षेपेक्षा जास्त वेळ लागला.",
      "ठरलेल्या वेळेवर पोहोचूनही खोली तयार नव्हती.",
      "रिसेप्शनवरील कामाचा वेग वाढवणे गरजेचे आहे.",
      "हॉटेलमध्ये आल्यावर खोली मिळण्यास विलंब झाला."
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
      "Disturbed sleep due to poor soundproofing."
    ],
    phrases_hi: [
      "Room mein soundproofing theek nahi mili, street noise disturb karta mila.",
      "Rest karne mein disturbance hua.",
      "Quiet rooms ke liye better insulation chahiye.",
      "Corridor noise room tak pahunchta mila."
    ],
    phrases_hinglish: [
      "Room mein soundproofing theek nahi mili, street noise disturb karta mila.",
      "Rest karne mein disturbance hua.",
      "Quiet rooms ke liye better insulation chahiye.",
      "Corridor noise room tak pahunchta mila."
    ],
    phrases_hindi: [
      "कमरे में बाहरी आवाज ज्यादा आ रही थी, आराम करने में परेशानी हुई।",
      "साउंडप्रूफिंग बेहतर होनी चाहिए।",
      "सड़क और कॉरिडोर का शोर कमरे तक पहुंच रहा था।",
      "शांत वातावरण के लिए इन्सुलेशन सुधारने की जरूरत है।"
    ],
    phrases_mr: [
      "खोलीत बाहेरचा आणि कॉरिडॉरचा आवाज येत असल्याने विश्रांती घेण्यास त्रास झाला.",
      "आवाज रोखण्याची व्यवस्था अधिक चांगली हवी होती.",
      "शांततेचा अभाव जाणवला.",
      "खोलीतील आवाजाचा त्रास कमी व्हायला हवा होता."
    ],
  },
  {
    id: "hotel_checkin_smooth",
    label: "Check-in was straightforward",
    sentiment: "positive",
    phrases_en: [
      "Check-in was completely smooth, quick, and hassle-free.",
      "Keys were ready upon arrival without any waiting.",
      "Front desk handled registration very professionally.",
      "Quick check-in that let us settle into our room right away."
    ],
    phrases_hi: [
      "Check-in process bilkul smooth aur fast laga.",
      "Arrival par keys ready mili bina kisi delay ke.",
      "Front desk ne registration kaafi efficiently handle kiya.",
      "Quick check-in se turant room settle ho paye."
    ],
    phrases_hinglish: [
      "Check-in process bilkul smooth aur fast laga.",
      "Arrival par keys ready mili bina kisi delay ke.",
      "Front desk ne registration kaafi efficiently handle kiya.",
      "Quick check-in se turant room settle ho paye."
    ],
    phrases_hindi: [
      "चेक-इन की प्रक्रिया बहुत ही सहज, त्वरित और परेशानी मुक्त थी।",
      "पहुंचते ही बिना किसी प्रतीक्षा के चाबियां मिल गईं।",
      "रिसेप्शन दल ने पंजीकरण का काम बहुत पेशेवर ढंग से किया।",
      "तेज चेक-इन के कारण हम तुरंत अपने कमरे में जा सके।"
    ],
    phrases_mr: [
      "चेक-इन प्रक्रिया अतिशय सुरळीत, जलद आणि सोपी होती.",
      "हॉटेलमध्ये पोहोचताच कोणत्याही विलंबाशिवाय चाव्या मिळाल्या.",
      "स्वागत कक्षातील नोंदणीचे काम अतिशय चोख पार पडले.",
      "जलद चेक-इनमुळे लगेचच खोलीत जाऊन विश्रांती घेता आली."
    ],
  },
  {
    id: "hotel_matched_booking",
    label: "Room matched booking",
    sentiment: "positive",
    phrases_en: [
      "Room matched the booking photos and description exactly.",
      "Got the exact view, bed configuration, and floor requested.",
      "No surprises — room amenities were as promised.",
      "Delighted that the room was identical to online listing."
    ],
    phrases_hi: [
      "Room booking photos aur description se bilkul match hua.",
      "Requested view aur bed configuration exact mila.",
      "Amenities bilkul promised standards ke hisab se mili.",
      "Online listing jaisa clean aur accurate room mila."
    ],
    phrases_hinglish: [
      "Room booking photos aur description se bilkul match hua.",
      "Requested view aur bed configuration exact mila.",
      "Amenities bilkul promised standards ke hisab se mili.",
      "Online listing jaisa clean aur accurate room mila."
    ],
    phrases_hindi: [
      "कमरा बिल्कुल बुकिंग के फोटो और विवरण के अनुरूप था।",
      "मांगी गई बालकनी, दृश्य और बिस्तर का सटीक प्रबंध मिला।",
      "कमरे की सभी सुविधाएं वादे के अनुसार प्राप्त हुईं।",
      "ऑनलाइन विवरण के बिल्कुल समान कमरा देखकर बहुत खुशी हुई।"
    ],
    phrases_mr: [
      "खोली अगदी बुकिंगमधील फोटो आणि वर्णनाप्रमाणेच मिळाली.",
      "मागितल्यानुसार दृश्य आणि बैठक व्यवस्था तंतोतंत होती.",
      "खोलीतील सर्व सुविधा दिलेल्या शब्दाप्रमाणे होत्या.",
      "ऑनलाइन माहितीप्रमाणेच प्रत्यक्ष खोली मिळाल्याने आनंद झाला."
    ],
  },
  {
    id: "hotel_staff_requests",
    label: "Staff helped with requests",
    sentiment: "positive",
    phrases_en: [
      "Staff was very responsive to extra pillows and room requests.",
      "Prompt assistance with luggage and special preferences.",
      "Helpful housekeeping team that responded immediately.",
      "Every guest request was handled with genuine care."
    ],
    phrases_hi: [
      "Room requests aur extra items prompt delivery ke saath mile.",
      "Luggage aur preferences mein staff ne acche se help ki.",
      "Housekeeping team kaafi responsive aur courteous mili.",
      "Har guest request par attentive care dekhne ko mili."
    ],
    phrases_hinglish: [
      "Room requests aur extra items prompt delivery ke saath mile.",
      "Luggage aur preferences mein staff ne acche se help ki.",
      "Housekeeping team kaafi responsive aur courteous mili.",
      "Har guest request par attentive care dekhne ko mili."
    ],
    phrases_hindi: [
      "कमरे से जुड़ी हर अतिरिक्त मांग को तुरंत पूरा किया गया।",
      "सामान उठाने और विशेष जरूरतों में बहुत त्वरित सहायता मिली।",
      "हाउसकीपिंग टीम ने हर बुलावे पर तुरंत प्रतिक्रिया दी।",
      "अतिथि की हर छोटी-बड़ी जरूरत का पूरा ध्यान रखा गया।"
    ],
    phrases_mr: [
      "खोलीतील अतिरिक्त मागण्या कर्मचाऱ्यांनी लगेचच पूर्ण केल्या.",
      "सामान नेण्या-आणण्यासाठी उत्तम आणि तत्पर मदत लाभली.",
      "हाउसकीपिंग संघ अतिशय तत्पर आणि नम्र होता.",
      "प्रत्येक विनंतीची काळजीपूर्वक दखल घेतली गेली."
    ],
  },
  {
    id: "hotel_easy_facilities",
    label: "Facilities easy to access",
    sentiment: "positive",
    phrases_en: [
      "Gym, pool, and dining areas were easy to access.",
      "Well-signed property with smooth elevator service.",
      "Facilities were convenient and clearly marked throughout.",
      "Effortless movement between rooms and amenities."
    ],
    phrases_hi: [
      "Gym, pool aur dining areas easily accessible lage.",
      "Elevators aur signage kaafi clear aur functional the.",
      "Facilities accessible aur well-placed dekhne ko mili.",
      "Property layout kaafi convenient aur easy laga."
    ],
    phrases_hinglish: [
      "Gym, pool aur dining areas easily accessible lage.",
      "Elevators aur signage kaafi clear aur functional the.",
      "Facilities accessible aur well-placed dekhne ko mili.",
      "Property layout kaafi convenient aur easy laga."
    ],
    phrases_hindi: [
      "जिम, स्विमिंग पूल और भोजन क्षेत्र तक पहुंच बहुत आसान थी।",
      "उचित दिशा-निर्देशों और लिफ्ट की अच्छी सुविधा मिली।",
      "सभी सुविधाएं बहुत सुलभ और स्पष्ट रूप से अंकित थीं।",
      "होटल परिसर में आवागमन बहुत ही सहज रहा।"
    ],
    phrases_mr: [
      "जिम, जलतरण तलाव आणि रेस्टॉरंटची सोय अगदी सहज उपलब्ध होती.",
      "मार्गदर्शक फलक आणि लिफ्टची सुविधा उत्तम होती.",
      "सर्व सुविधा सोयीच्या आणि स्पष्टपणे दर्शवलेल्या होत्या.",
      "परिसरात वावरणे अतिशय सोपे आणि सुलभ ठरले."
    ],
  },
  {
    id: "hotel_maintained_areas",
    label: "Common areas well maintained",
    sentiment: "positive",
    phrases_en: [
      "Lobby, corridors, and common spaces were beautifully kept.",
      "Clean and welcoming public areas throughout the hotel.",
      "Impressed by the ongoing upkeep and neat aesthetics.",
      "Pleasant lounge and well-maintained shared amenities."
    ],
    phrases_hi: [
      "Lobby aur corridors kaafi beautifully maintained mile.",
      "Public spaces clean aur welcoming dekhne ko mile.",
      "Upkeep aur neat aesthetics kaafi impressive lage.",
      "Shared areas ka maintenance kaafi top-notch laga."
    ],
    phrases_hinglish: [
      "Lobby aur corridors kaafi beautifully maintained mile.",
      "Public spaces clean aur welcoming dekhne ko mile.",
      "Upkeep aur neat aesthetics kaafi impressive lage.",
      "Shared areas ka maintenance kaafi top-notch laga."
    ],
    phrases_hindi: [
      "लॉबी, गलियारे और सार्वजनिक स्थान बहुत खूबसूरती से बनाए रखे गए थे।",
      "पूरे होटल में साफ-सुथरे और स्वागतपूर्ण सामान्य क्षेत्र मिले।",
      "नियमित रखरखाव और सुंदर सजावट से बहुत अच्छा प्रभाव पड़ा।",
      "सुखद लाउंज और बहुत अच्छी तरह से रखी गई साझा सुविधाएं।"
    ],
    phrases_mr: [
      "लॉबी, कॉरिडोअर आणि सार्वजनिक जागा अतिशय सुरेख राखल्या होत्या.",
      "हॉटेलचा सर्व परिसर अत्यंत स्वच्छ आणि स्वागतशील वाटला.",
      "नियमित स्वच्छता आणि सुंदर मांडणी कौतुकास्पद होती.",
      "सामायिक जागांची देखभाल अतिशय चोख राखलेली दिसली."
    ],
  },
  {
    id: "hotel_fresh_bedding",
    label: "Bedding was fresh & clean",
    sentiment: "positive",
    phrases_en: [
      "Bedding and pillows were crisp, fresh, and comfortable.",
      "High quality mattresses that provided a great night's sleep.",
      "Fresh linens that smelled clean and felt cozy.",
      "Very comfortable bed that made the stay restful."
    ],
    phrases_hi: [
      "Bedding aur pillows kaafi fresh aur comfortable lage.",
      "Mattress quality badhiya lagi jis se acchi neend mili.",
      "Clean linens aur fresh sheets dekhne ko mili.",
      "Comfortable bed se stay kaafi restful laga."
    ],
    phrases_hinglish: [
      "Bedding aur pillows kaafi fresh aur comfortable lage.",
      "Mattress quality badhiya lagi jis se acchi neend mili.",
      "Clean linens aur fresh sheets dekhne ko mili.",
      "Comfortable bed se stay kaafi restful laga."
    ],
    phrases_hindi: [
      "बिस्तर और तकिए पूरी तरह ताजे, साफ और आरामदायक थे।",
      "गद्दों की गुणवत्ता बहुत अच्छी थी जिससे सुकून भरी नींद मिली।",
      "चादरें बहुत साफ और ताजगी से भरी महसूस हुईं।",
      "आरामदायक बिस्तर ने पूरे प्रवास को बहुत शांतिपूर्ण बना दिया।"
    ],
    phrases_mr: [
      "बिछाना आणि उशा अतिशय स्वच्छ, ताज्या आणि आरामदायी होत्या.",
      "गाद्यांचा दर्जा उत्तम असल्याने गाढ आणि शांत झोप लागली.",
      "चादरी अतिशय स्वच्छ आणि आल्हाददायक वाटल्या.",
      "आरामदायी बिछान्यामुळे मुक्कामाचा शीण निघून गेला."
    ],
  },
  {
    id: "hotel_quiet_stay",
    label: "Quiet and restful room",
    sentiment: "positive",
    phrases_en: [
      "Room was peaceful, quiet, and well soundproofed.",
      "No noise from other rooms or traffic during the night.",
      "Restful environment that allowed for deep sleep.",
      "A serene and quiet stay away from the noise."
    ],
    phrases_hi: [
      "Room kaafi peaceful aur quiet mila.",
      "Raat mein koi traffic ya hallway disturbance nahi hui.",
      "Restful environment se acchi rest mili.",
      "Quiet stay dekhne ko mila."
    ],
    phrases_hinglish: [
      "Room kaafi peaceful aur quiet mila.",
      "Raat mein koi traffic ya hallway disturbance nahi hui.",
      "Restful environment se acchi rest mili.",
      "Quiet stay dekhne ko mila."
    ],
    phrases_hindi: [
      "कमरा बहुत ही शांत, सुकून भरा और ध्वनि-रोधी था।",
      "रात में सड़क या गलियारे से कोई शोर नहीं सुनाई दिया।",
      "शांत वातावरण के कारण बहुत अच्छी नींद आई।",
      "शोरगुल से दूर एक बहुत ही सुखद और शांत प्रवास का अनुभव हुआ।"
    ],
    phrases_mr: [
      "खोली अतिशय शांत, निवांत आणि बाहेरील आवाजापासून मुक्त होती.",
      "रात्रीच्या वेळी कोणताही त्रास न होता गाढ झोप लागली.",
      "शांत वातावरणामुळे मनाला उत्तम विश्रांती मिळाली.",
      "गोंगाटापासून दूर एक अतिशय सुखद मुक्काम झाला."
    ],
  },
  {
    id: "hotel_working_amenities",
    label: "Hot water & amenities working",
    sentiment: "positive",
    phrases_en: [
      "Hot water, AC, and all room amenities worked flawlessly.",
      "Strong water pressure and reliable temperature control.",
      "Fast Wi-Fi and television amenities in full order.",
      "Everything in the room functioned without a hitch."
    ],
    phrases_hi: [
      "Hot water, AC aur room amenities bilkul smooth chale.",
      "Water pressure aur temperature control reliable laga.",
      "Wi-Fi speed aur TV setup properly functional mile.",
      "Room ka saara setup bina issue ke kaam karta mila."
    ],
    phrases_hinglish: [
      "Hot water, AC aur room amenities bilkul smooth chale.",
      "Water pressure aur temperature control reliable laga.",
      "Wi-Fi speed aur TV setup properly functional mile.",
      "Room ka saara setup bina issue ke kaam karta mila."
    ],
    phrases_hindi: [
      "गर्म पानी, एसी और कमरे की सभी सुविधाएं सुचारू रूप से काम कर रही थीं।",
      "पानी का बहाव और तापमान नियंत्रण बहुत अच्छा था।",
      "तेज वाई-फाई और टीवी की सुविधा पूरी तरह चालू मिली।",
      "कमरे की हर चीज बिना किसी रुकावट के सही काम कर रही थी।"
    ],
    phrases_mr: [
      "गरम पाणी, एसी आणि खोलीतील सर्व साधने उत्तम कार्यरत होती.",
      "पाण्याचा प्रवाह आणि तापमान नियंत्रण अतिशय योग्य होते.",
      "वेगवान वाय-फाय आणि टीव्हीची सोय उत्तम चालू होती.",
      "खोलीतील सर्व गोष्टी विनाअडथळा कार्यरत आढळल्या."
    ],
  },
  {
    id: "hotel_checkout_easy",
    label: "Smooth check-out process",
    sentiment: "positive",
    phrases_en: [
      "Check-out was quick, organized, and straightforward.",
      "Bill was reviewed and settled in less than two minutes.",
      "Cab assistance and luggage help provided at departure.",
      "Hassle-free departure that wrapped up a great stay."
    ],
    phrases_hi: [
      "Check-out process kaafi quick aur organized laga.",
      "Bill settlement bina delay ke do minute mein complete hua.",
      "Departure ke time luggage aur cab assistance mila.",
      "Smooth departure se stay ka pleasant end hua."
    ],
    phrases_hinglish: [
      "Check-out process kaafi quick aur organized laga.",
      "Bill settlement bina delay ke do minute mein complete hua.",
      "Departure ke time luggage aur cab assistance mila.",
      "Smooth departure se stay ka pleasant end hua."
    ],
    phrases_hindi: [
      "चेक-आउट की प्रक्रिया बहुत ही त्वरित, व्यवस्थित और आसान रही।",
      "बिल का निपटारा बिना किसी देरी के दो मिनट में हो गया।",
      "प्रस्थान के समय टैक्सी और सामान में पूरा सहयोग मिला।",
      "बिना किसी परेशानी के प्रस्थान ने प्रवास का बहुत सुखद अंत किया।"
    ],
    phrases_mr: [
      "चेक-आउटची प्रक्रिया अतिशय वेगवान आणि शिस्तबद्ध झाली.",
      "बिलाचे काम कोणत्याही विलंबाशिवाय लगेचच पूर्ण झाले.",
      "निघताना सामान आणि वाहनासाठी तत्पर मदत मिळाली.",
      "विनासायास झालेल्या चेक-आउटमुळे मुक्कामाची गोड सांगता झाली."
    ],
  },
  {
    id: "hotel_travel_guidance",
    label: "Helpful local travel guidance",
    sentiment: "positive",
    phrases_en: [
      "Front desk provided great local travel and dining tips.",
      "Helped arrange trustworthy local transport options.",
      "Valuable sightseeing advice that saved time.",
      "Staff was well informed about city attractions."
    ],
    phrases_hi: [
      "Front desk ne local travel aur dining ke kaafi acche tips diye.",
      "Trustworthy transport arrange karne mein help mili.",
      "Sightseeing ke practical suggestions se time bacha.",
      "Local attractions ke baare mein staff well informed mila."
    ],
    phrases_hinglish: [
      "Front desk ne local travel aur dining ke kaafi acche tips diye.",
      "Trustworthy transport arrange karne mein help mili.",
      "Sightseeing ke practical suggestions se time bacha.",
      "Local attractions ke baare mein staff well informed mila."
    ],
    phrases_hindi: [
      "रिसेप्शन कर्मचारियों ने स्थानीय पर्यटन और भोजन के बहुत अच्छे सुझाव दिए।",
      "विश्वसनीय स्थानीय परिवहन की व्यवस्था करने में पूरी मदद मिली।",
      "घूमने-फिरने की व्यावहारिक सलाह से हमारे समय की बचत हुई।",
      "कर्मचारियों को शहर के प्रमुख स्थलों की बहुत अच्छी जानकारी थी।"
    ],
    phrases_mr: [
      "हॉटेलच्या कर्मचाऱ्यांनी स्थानिक पर्यटन आणि जेवणाविषयी उत्तम मार्गदर्शन केले.",
      "विश्वासार्ह वाहनाची सोय करण्यासाठी छान मदत केली.",
      "फिरण्याविषयी दिलेल्या उपयुक्त सल्ल्यामुळे वेळेची बचत झाली.",
      "शहरातील प्रेक्षणीय स्थळांची कर्मचाऱ्यांना अतिशय चांगली माहिती होती."
    ],
  }
];

// ─── Flat chip lookup map ─────────────────────────────────────────────────────

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

// ─── Industry keyword → chip set mapping ─────────────────────────────────────

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
 * Returns the relevant chip array for a given business category string.
 *
 * @param {string} category — e.g. "Hair Salon & Spa"
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
