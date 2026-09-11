import type { LanguageGuide } from "../types";

export const LANGUAGE_GUIDES: LanguageGuide[] = [
  {
    language: "Hindi",
    country: "India",
    flag: "🇮🇳",
    localeCode: "hi-IN",
    nativeName: "हिन्दी",
    phrases: [
      // Greetings & Social
      { category: "Greetings", english: "Hello / Greetings", translated: "नमस्ते", pronunciation: "nuh-muh-stay", notes: "Traditional respectful greeting with folded hands" },
      { category: "Greetings", english: "How are you? / I am fine", translated: "आप कैसे हैं? / मैं ठीक हूँ", pronunciation: "aap kay-say hain? / main theek hoon", notes: "Polite conversational icebreaker" },
      { category: "Greetings", english: "Thank you very much", translated: "बहुत धन्यवाद / बहुत शुक्रिया", pronunciation: "buh-hoot dhun-yuh-vaad / buh-hoot shook-ree-yah", notes: "Dhanyavaad (formal) / Shukriya (common)" },
      { category: "Greetings", english: "Please", translated: "कृपया", pronunciation: "krip-yah", notes: "Used when requesting assistance politely" },
      { category: "Greetings", english: "Excuse me / Listen please", translated: "माफ़ कीजिए / सुनिए", pronunciation: "maaf kee-jee-yay / soon-ee-yay", notes: "Use 'Suniye' to get a waiter or driver's attention" },
      { category: "Greetings", english: "Goodbye / See you again", translated: "फिर मिलेंगे / अलविदा", pronunciation: "phir mi-layng-gay / al-vee-daa", notes: "Phir milenge means 'see you again'" },

      // Essentials & Shopping
      { category: "Essentials", english: "Do you speak English?", translated: "क्या आप अंग्रेज़ी बोलते हैं?", pronunciation: "kya aap ung-ray-zee boal-tay hain?" },
      { category: "Essentials", english: "How much does this cost?", translated: "यह कितने का है?", pronunciation: "yeh kit-nay kaa hai?" },
      { category: "Essentials", english: "A bit cheaper please / Any discount?", translated: "थोड़ा कम कीजिए ना", pronunciation: "thoh-daa kum kee-jee-yay naa", notes: "Friendly bargaining phrase for bazaars" },
      { category: "Essentials", english: "Do you accept UPI / card?", translated: "क्या ऑनलाइन पेमेंट या कार्ड चलेगा?", pronunciation: "kya online payment yaa card cha-lay-gaa?", notes: "UPI and QR code payments are universal in India" },
      { category: "Essentials", english: "Where is the nearest ATM?", translated: "नज़दीकी एटीएम कहाँ है?", pronunciation: "nuz-dee-kee ATM ka-haan hai?" },
      { category: "Essentials", english: "Can you take a photo for me?", translated: "क्या आप हमारी एक फोटो ले सकते हैं?", pronunciation: "kya aap ha-maa-ree ek photo lay suk-tay hain?" },
      { category: "Essentials", english: "Yes / No", translated: "हाँ / नहीं", pronunciation: "haan / na-heen" },

      // Dining & Dietary
      { category: "Dining", english: "Drinking water / Bottled water please", translated: "पीने का पानी / बोतल वाला पानी दीजिए", pronunciation: "pee-nay kaa paa-nee / bottle waa-laa paa-nee dee-jee-yay" },
      { category: "Dining", english: "Pure vegetarian food only", translated: "शुद्ध शाकाहारी खाना चाहिए", pronunciation: "shuddh shaa-kaa-haa-ree khaa-naa chaa-hee-yay", notes: "Strictly no meat, fish, or eggs" },
      { category: "Dining", english: "Not too spicy please", translated: "ज़्यादा तीखा मत बनाइए", pronunciation: "zyaa-daa tee-khaa mut buh-naa-yee-yay", notes: "Essential if you have low chili tolerance" },
      { category: "Dining", english: "The bill, please", translated: "बिल ले आइए", pronunciation: "bill lay aayee-yay" },
      { category: "Dining", english: "The food is very delicious!", translated: "खाना बहुत स्वादिष्ट है!", pronunciation: "khaa-naa buh-hoot swaa-disht hai!" },
      { category: "Dining", english: "One cup of hot tea please", translated: "एक कप गरम चाय दीजिए", pronunciation: "ek cup guh-rum chaay dee-jee-yay", notes: "India's beloved spiced milk tea" },

      // Transit & Navigation
      { category: "Transit", english: "Where is the railway station / metro?", translated: "रेलवे स्टेशन या मेट्रो कहाँ है?", pronunciation: "rail-way stay-shun yaa metro ka-haan hai?" },
      { category: "Transit", english: "Where is the washroom / toilet?", translated: "शौचालय या वॉशरूम कहाँ है?", pronunciation: "show-chaa-lay yaa wash-room ka-haan hai?" },
      { category: "Transit", english: "Take me to this address please", translated: "मुझे इस पते पर ले चलिए", pronunciation: "moo-jhay iss puh-tay pur lay chal-ee-yay" },
      { category: "Transit", english: "Please turn on the meter", translated: "कृपया मीटर चालू कीजिए", pronunciation: "krip-yah meter chaa-loo kee-jee-yay", notes: "Crucial rule for city auto-rickshaws and black-and-yellow cabs" },
      { category: "Transit", english: "Stop here please", translated: "यहाँ रोक दीजिए", pronunciation: "yu-haan roak dee-jee-yay" },

      // Critical Emergency
      { category: "Emergency", english: "Help me please!", translated: "कृपया मेरी मदद कीजिए!", pronunciation: "krip-yah may-ree muh-dud kee-jee-yay!" },
      { category: "Emergency", english: "Call an ambulance / doctor", translated: "एम्बुलेंस या डॉक्टर को बुलाइए", pronunciation: "ambulance yaa doc-tor ko boo-laayee-yay", notes: "India emergency dial 112 or 108" },
      { category: "Emergency", english: "Call the police", translated: "पुलिस को बुलाइए", pronunciation: "poo-lees ko boo-laayee-yay", notes: "Police emergency dial 112 or 100" },
      { category: "Emergency", english: "I lost my bag / passport", translated: "मेरा बैग या पासपोर्ट खो गया है", pronunciation: "may-raa bag yaa passport kho gayaa hai" },
      { category: "Emergency", english: "I have a medical allergy", translated: "मुझे दवाइयों या खाने से एलर्जी है", pronunciation: "moo-jhay du-waa-ee-yon yaa khaa-nay say allergy hai" },

      // Numbers
      { category: "Numbers", english: "One, Two, Three, Four, Five", translated: "एक, दो, तीन, चार, पाँच", pronunciation: "ek, do, teen, chaar, paanch" },
      { category: "Numbers", english: "Ten, Fifty, Hundred, Thousand", translated: "दस, पचास, सौ, हज़ार", pronunciation: "dus, puh-chaas, sow, huh-zaar" },
    ],
  },
  {
    language: "Japanese",
    country: "Japan",
    flag: "🇯🇵",
    localeCode: "ja-JP",
    nativeName: "日本語",
    phrases: [
      // Greetings & Social
      { category: "Greetings", english: "Hello / Good afternoon", translated: "こんにちは", pronunciation: "kohn-nee-chee-wah", notes: "Standard polite daytime greeting" },
      { category: "Greetings", english: "Good morning", translated: "おはようございます", pronunciation: "oh-hah-yoh goh-zah-ee-mahs", notes: "Say until around 10:30 AM" },
      { category: "Greetings", english: "Thank you very much", translated: "ありがとうございます", pronunciation: "ah-ree-gah-toh goh-zah-ee-mahs", notes: "Polite formal" },
      { category: "Greetings", english: "Excuse me / Sorry", translated: "すみません", pronunciation: "soo-mee-mah-sen", notes: "Use for waiters, crowded trains, or apologies" },
      { category: "Greetings", english: "Pleased to meet you", translated: "よろしくお願いします", pronunciation: "yoh-roh-shee-koo oh-neh-guy-shee-mahs", notes: "Crucial Japanese business & travel etiquette phrase" },
      { category: "Greetings", english: "Goodbye", translated: "さようなら / じゃあね", pronunciation: "sah-yoh-nah-rah / jah-neh", notes: "Formal / Casual" },

      // Essentials & Shopping
      { category: "Essentials", english: "Do you speak English?", translated: "英語を話せますか？", pronunciation: "eh-goh oh hah-nah-seh-mahs kah?" },
      { category: "Essentials", english: "How much is this?", translated: "これはいくらですか？", pronunciation: "koh-reh wah ee-koo-rah dess kah?" },
      { category: "Essentials", english: "Can I pay by credit card?", translated: "クレジットカードは使えますか？", pronunciation: "koo-reh-jeet-toh kah-doh wah tsoo-kah-eh-mahs kah?" },
      { category: "Essentials", english: "Do you have Wi-Fi?", translated: "Wi-Fiはありますか？", pronunciation: "wai-fai wah ah-ree-mahs kah?" },
      { category: "Essentials", english: "Could you take my photo?", translated: "写真を撮ってもらえますか？", pronunciation: "shah-sheen oh toht-teh moh-rah-eh-mahs kah?" },
      { category: "Essentials", english: "Please give me this", translated: "これをお願いします", pronunciation: "koh-reh oh oh-neh-guy-shee-mahs", notes: "Point at any menu item and say this" },
      { category: "Essentials", english: "Yes / No", translated: "はい / いいえ", pronunciation: "high / ee-eh" },

      // Dining & Dietary
      { category: "Dining", english: "Water please", translated: "お水をお願いします", pronunciation: "oh-mee-zoo oh oh-neh-guy-shee-mahs", notes: "Tap water in Japanese restaurants is clean & free" },
      { category: "Dining", english: "Check / Bill please", translated: "お会計をお願いします", pronunciation: "oh-kye-kay oh oh-neh-guy-shee-mahs" },
      { category: "Dining", english: "Do you have vegetarian food?", translated: "ベジタリアン料理はありますか？", pronunciation: "beh-jee-tah-ree-ahn ryoh-ree wah ah-ree-mahs kah?" },
      { category: "Dining", english: "I cannot eat meat or fish", translated: "肉や魚は食べられません", pronunciation: "nee-koo yah sah-kah-nah wah tah-beh-rah-reh-mah-sen", notes: "Dashi (fish broth) is in many dishes" },
      { category: "Dining", english: "Delicious! / Thank you for the meal", translated: "美味しいです！ / ごちそうさまでした", pronunciation: "oy-shee dess! / goh-chee-soh-sah-mah desh-tah" },
      { category: "Dining", english: "What do you recommend?", translated: "おすすめは何ですか？", pronunciation: "oh-soo-soo-meh wah nahn dess kah?" },

      // Transit & Navigation
      { category: "Transit", english: "Where is the bathroom?", translated: "トイレはどこですか？", pronunciation: "toy-reh wah doh-koh dess kah?" },
      { category: "Transit", english: "Where is the station?", translated: "駅はどこですか？", pronunciation: "eh-kee wah doh-koh dess kah?" },
      { category: "Transit", english: "Does this train go to the airport?", translated: "この電車は空港に行きますか？", pronunciation: "koh-noh den-shah wah koo-koh nee ee-kee-mahs kah?" },
      { category: "Transit", english: "Take me to this address please", translated: "この住所までお願いします", pronunciation: "koh-noh joo-shoh mah-deh oh-neh-guy-shee-mahs" },
      { category: "Transit", english: "Please stop here", translated: "ここで降ろしてください", pronunciation: "koh-koh deh oh-roh-shee-teh koo-dah-sigh" },

      // Critical Emergency
      { category: "Emergency", english: "Help me please!", translated: "助けてください！", pronunciation: "tah-soo-keh-teh koo-dah-sigh!" },
      { category: "Emergency", english: "Please call an ambulance", translated: "救急車を呼んでください", pronunciation: "kyoo-kyoo-shah oh yohn-deh koo-dah-sigh", notes: "Emergency dial 119 in Japan" },
      { category: "Emergency", english: "Please call the police", translated: "警察を呼んでください", pronunciation: "kay-sah-tsoo oh yohn-deh koo-dah-sigh", notes: "Police dial 110 in Japan" },
      { category: "Emergency", english: "I lost my passport", translated: "パスポートをなくしました", pronunciation: "pah-soo-poh-toh oh nah-koo-shee-mah-stah" },
      { category: "Emergency", english: "Where is the hospital / pharmacy?", translated: "病院 / 薬局はどこですか？", pronunciation: "byoh-een / yahk-kyoh-koo wah doh-koh dess kah?" },
      { category: "Emergency", english: "I have an allergy", translated: "アレルギーがあります", pronunciation: "ah-reh-roo-gee gah ah-ree-mahs" },

      // Numbers
      { category: "Numbers", english: "One, Two, Three, Four, Five", translated: "一 (ichi), 二 (ni), 三 (san), 四 (shi/yon), 五 (go)", pronunciation: "ee-chee, nee, sahn, yohn, goh" },
      { category: "Numbers", english: "Hundred, Thousand, Ten Thousand", translated: "百 (hyaku), 千 (sen), 万 (man)", pronunciation: "hyah-koo, sen, mahn" },
    ],
  },
  {
    language: "Arabic",
    country: "Middle East (UAE, Saudi Arabia, Qatar, Oman)",
    flag: "🇸🇦",
    localeCode: "ar-SA",
    nativeName: "العربية",
    phrases: [
      // Greetings & Social
      { category: "Greetings", english: "Peace be upon you / Hello", translated: "السلام عليكم / مرحباً", pronunciation: "ahs-sah-lahm ah-lay-koom / mar-hah-bahn", notes: "Reply with 'Wa alaykum as-salaam'" },
      { category: "Greetings", english: "How are you? / Good praise be to God", translated: "كيف حالك؟ / الحمد لله", pronunciation: "kay-fah hah-look? / al-ham-doo lee-lah" },
      { category: "Greetings", english: "Thank you very much", translated: "شكراً جزيلاً", pronunciation: "shook-rahn jah-zee-lahn" },
      { category: "Greetings", english: "Please / Excuse me", translated: "من فضلك / لو سمحت", pronunciation: "min fad-lak (to male) / law sah-maht" },
      { category: "Greetings", english: "Welcome", translated: "أهلاً وسهلاً", pronunciation: "ah-lahn wah sah-lahn" },
      { category: "Greetings", english: "Goodbye", translated: "مع السلامة", pronunciation: "mah ahs-sah-lah-mah" },

      // Essentials & Shopping
      { category: "Essentials", english: "Do you speak English?", translated: "هل تتحدث الإنجليزية؟", pronunciation: "hal tah-tah-had-dath al-eeng-lee-zee-yah?" },
      { category: "Essentials", english: "How much is this?", translated: "بكم هذا؟", pronunciation: "bee-kahm hah-dhah?" },
      { category: "Essentials", english: "Can you give a discount?", translated: "هل يمكن تخفيض السعر؟", pronunciation: "hal yoom-keen takh-feed as-seer?", notes: "Customary in traditional souks" },
      { category: "Essentials", english: "Do you accept credit cards?", translated: "هل تقبلون البطاقة الائتمانية؟", pronunciation: "hal taq-bah-loon al-bee-tah-qah?" },
      { category: "Essentials", english: "Where is the nearest ATM?", translated: "أين أقرب صراف آلي؟", pronunciation: "ay-nah aq-rahb sar-rahf aa-lee?" },
      { category: "Essentials", english: "Yes / No", translated: "نعم / لا", pronunciation: "nah-ahm / lah" },

      // Dining & Dietary
      { category: "Dining", english: "The bill, please", translated: "الحساب من فضلك", pronunciation: "al-hee-sahb min fad-lak" },
      { category: "Dining", english: "Drinking water please", translated: "ماء شرب من فضلك", pronunciation: "mah shoorb min fad-lak" },
      { category: "Dining", english: "Is this food halal?", translated: "هل هذا الطعام حلال؟", pronunciation: "hal hah-dhah at-tah-ahm hah-lahl?" },
      { category: "Dining", english: "I am vegetarian, no meat", translated: "أنا نباتي، بدون لحم أو دجاج", pronunciation: "ah-nah nah-bah-tee, bee-doon lahm ow dah-jahj" },
      { category: "Dining", english: "Not spicy please", translated: "بدون شطة أو حار", pronunciation: "bee-doon shah-tah ow hahr" },
      { category: "Dining", english: "The food is very delicious", translated: "الطعام لذيذ جداً", pronunciation: "at-tah-ahm lah-dheedh jee-dahn" },

      // Transit & Navigation
      { category: "Transit", english: "Where is the bathroom?", translated: "أين الحمام؟", pronunciation: "ay-nah al-ham-mahm?" },
      { category: "Transit", english: "Where is the airport / metro station?", translated: "أين المطار أو محطة المترو؟", pronunciation: "ay-nah al-mah-tahr ow mah-hat-tat al-metro?" },
      { category: "Transit", english: "To this address please", translated: "إلى هذا العنوان من فضلك", pronunciation: "ee-lah hah-dhah al-oon-wahn min fad-lak" },
      { category: "Transit", english: "Please turn on the meter", translated: "شغل العداد من فضلك", pronunciation: "shagh-ghil al-ad-dahd min fad-lak", notes: "Standard for Dubai / GCC taxis" },
      { category: "Transit", english: "Stop here please", translated: "توقف هنا من فضلك", pronunciation: "tah-waq-qaf ho-nah min fad-lak" },

      // Critical Emergency
      { category: "Emergency", english: "Help me!", translated: "ساعدني / النجدة!", pronunciation: "sah-id-nee / ahn-naj-dah!" },
      { category: "Emergency", english: "Call an ambulance", translated: "اتصل بالإسعاف", pronunciation: "it-tah-sil bil-ees-ahf", notes: "UAE dial 998, Saudi dial 997" },
      { category: "Emergency", english: "Call the police", translated: "اتصل بالشرطة", pronunciation: "it-tah-sil bish-shoor-tah", notes: "UAE dial 999, Saudi dial 999" },
      { category: "Emergency", english: "I lost my passport", translated: "فقدت جواز سفري", pronunciation: "fah-qad-too jah-wahz sah-fah-ree" },
      { category: "Emergency", english: "Where is the Indian Embassy?", translated: "أين السفارة الهندية؟", pronunciation: "ay-nah as-sah-fah-rah al-heen-dee-yah?" },

      // Numbers
      { category: "Numbers", english: "One, Two, Three, Four, Five", translated: "واحد, اثنان, ثلاثة, أربعة, خمسة", pronunciation: "wah-heed, eeth-nahn, thah-lah-thah, ar-bah-ah, kham-sah" },
      { category: "Numbers", english: "Ten, Fifty, Hundred, Thousand", translated: "عشرة, خمسون, مائة, ألف", pronunciation: "ash-rah, kham-soon, mee-ah, ahlf" },
    ],
  },
  {
    language: "Thai",
    country: "Thailand",
    flag: "🇹🇭",
    localeCode: "th-TH",
    nativeName: "ภาษาไทย",
    phrases: [
      // Greetings & Social
      { category: "Greetings", english: "Hello / Good day", translated: "สวัสดีครับ / ค่ะ", pronunciation: "sah-wahd-dee krup (male) / kah (female)", notes: "Append 'krup' if you identify male, 'kah' if female" },
      { category: "Greetings", english: "How are you? / I am fine", translated: "สบายดีไหม? / สบายดี", pronunciation: "sah-bai dee mai? / sah-bai dee", notes: "Standard friendly check-in" },
      { category: "Greetings", english: "Thank you very much", translated: "ขอบคุณมากครับ / ค่ะ", pronunciation: "khawp-khoon mahk krup / kah" },
      { category: "Greetings", english: "Excuse me / Sorry", translated: "ขอโทษครับ / ค่ะ", pronunciation: "khaw-thoht krup / kah" },
      { category: "Greetings", english: "No worries / You're welcome", translated: "ไม่เป็นไร", pronunciation: "mai bpen rai", notes: "Thailand's famous 'it's all good' cultural philosophy" },
      { category: "Greetings", english: "Goodbye", translated: "ลาก่อนครับ / ค่ะ", pronunciation: "lah gawn krup / kah" },

      // Essentials & Shopping
      { category: "Essentials", english: "Do you speak English?", translated: "พูดภาษาอังกฤษได้ไหม?", pronunciation: "poot pah-sah ung-grit dai mai?" },
      { category: "Essentials", english: "How much is this?", translated: "อันนี้ราคาเท่าไหร่?", pronunciation: "ahn nee rah-khah tao-rai?" },
      { category: "Essentials", english: "Can you give a discount?", translated: "ลดราคาหน่อยได้ไหม?", pronunciation: "loht rah-khah noy dai mai?", notes: "Polite bargaining in Thai night markets" },
      { category: "Essentials", english: "Do you accept credit card?", translated: "รับบัตรเครดิตไหม?", pronunciation: "rahp baht kray-dit mai?" },
      { category: "Essentials", english: "Do you have Wi-Fi?", translated: "มีไวไฟไหม?", pronunciation: "mee wai-fai mai?" },
      { category: "Essentials", english: "Yes / No", translated: "ใช่ / ไม่ใช่", pronunciation: "chai / mai chai" },

      // Dining & Dietary
      { category: "Dining", english: "The bill, please", translated: "เช็คบิลด้วยครับ / ค่ะ", pronunciation: "check bin dooay krup / kah" },
      { category: "Dining", english: "Drinking water please", translated: "ขอน้ำเปล่า", pronunciation: "khaw nahm bplao", notes: "Specify bottled plain water" },
      { category: "Dining", english: "Not spicy / A little spicy", translated: "ไม่เผ็ด / เผ็ดนิดหน่อย", pronunciation: "mai phet / phet nit noy", notes: "Thai chili is intense; say 'mai phet' for zero spice" },
      { category: "Dining", english: "Vegetarian / Vegan food", translated: "กินเจ / มังสวิรัติ", pronunciation: "gin jay (vegan/strict) / mung-sah-wee-raht (veg)" },
      { category: "Dining", english: "No pork / No beef please", translated: "ไม่ใส่หมู / ไม่ใส่เนื้อ", pronunciation: "mai sai moo / mai sai neua" },
      { category: "Dining", english: "Very delicious!", translated: "อร่อยมาก!", pronunciation: "ah-roy mahk!" },

      // Transit & Navigation
      { category: "Transit", english: "Where is the bathroom?", translated: "ห้องน้ำอยู่ที่ไหน?", pronunciation: "hawng nahm yoo tee nai?" },
      { category: "Transit", english: "Where is the BTS / MRT station?", translated: "สถานีรถไฟฟ้าอยู่ที่ไหน?", pronunciation: "sah-tah-nee roht fai fah yoo tee nai?" },
      { category: "Transit", english: "Go to this address please", translated: "ไปที่อยู่นี้ครับ", pronunciation: "bpai tee yoo nee krup" },
      { category: "Transit", english: "Please turn on the meter", translated: "เปิดมิเตอร์ด้วยครับ", pronunciation: "bpeert mee-dtur dooay krup", notes: "Essential for Bangkok taxis to prevent price gauging" },
      { category: "Transit", english: "Stop here please", translated: "จอดที่นี่ครับ", pronunciation: "jawt tee nee krup" },

      // Critical Emergency
      { category: "Emergency", english: "Help me please!", translated: "ช่วยด้วยครับ / ค่ะ!", pronunciation: "choo-ay dooay krup / kah!" },
      { category: "Emergency", english: "Call an ambulance", translated: "เรียกรถพยาบาลให้หน่อย", pronunciation: "ree-ak roht pah-yah-bahn hai noy", notes: "Medical emergency dial 1669" },
      { category: "Emergency", english: "Call the Tourist Police", translated: "เรียกตำรวจท่องเที่ยว", pronunciation: "ree-ak dtahm-roo-aht tawng tee-ow", notes: "Thailand Tourist Police dial 1155 (English speaking)" },
      { category: "Emergency", english: "I lost my passport", translated: "พาสปอร์ตหาย", pronunciation: "pahs-bpawt hai" },
      { category: "Emergency", english: "I have a severe allergy", translated: "ฉันแพ้อาหารอย่างรุนแรง", pronunciation: "chahn pae ah-hahn yahng roon-raeng" },

      // Numbers
      { category: "Numbers", english: "One, Two, Three, Four, Five", translated: "หนึ่ง, สอง, สาม, สี่, ห้า", pronunciation: "neung, sawng, sahm, see, hah" },
      { category: "Numbers", english: "Ten, Fifty, Hundred, Thousand", translated: "สิบ, ห้าสิบ, ร้อย, พัน", pronunciation: "seep, hah-seep, roy, pahn" },
    ],
  },
  {
    language: "French",
    country: "France, Switzerland, Belgium & Canada",
    flag: "🇫🇷",
    localeCode: "fr-FR",
    nativeName: "Français",
    phrases: [
      // Greetings & Social
      { category: "Greetings", english: "Hello / Good morning", translated: "Bonjour", pronunciation: "bohn-zhoor", notes: "Always say immediately upon entering any shop or cafe" },
      { category: "Greetings", english: "Good evening", translated: "Bonsoir", pronunciation: "bohn-swahr", notes: "Use after 6:00 PM" },
      { category: "Greetings", english: "Thank you very much", translated: "Merci beaucoup", pronunciation: "mair-see boh-koo" },
      { category: "Greetings", english: "Please", translated: "S'il vous plaît", pronunciation: "seel voo pleh" },
      { category: "Greetings", english: "Excuse me / Pardon", translated: "Excusez-moi / Pardon", pronunciation: "ex-kew-zay mwah / par-dohn" },
      { category: "Greetings", english: "Goodbye", translated: "Au revoir", pronunciation: "oh ruh-vwahr" },

      // Essentials & Shopping
      { category: "Essentials", english: "Do you speak English?", translated: "Parlez-vous anglais ?", pronunciation: "par-lay voo ahn-gleh?" },
      { category: "Essentials", english: "How much does it cost?", translated: "Combien ça coûte ?", pronunciation: "kohm-byan sah koot?" },
      { category: "Essentials", english: "Can I pay by card?", translated: "Puis-je payer par carte ?", pronunciation: "pwee-zhuh pay-yay par kart?" },
      { category: "Essentials", english: "Could you take a photo for me?", translated: "Pouvez-vous prendre une photo ?", pronunciation: "poo-vay voo prahn-druh ewn foh-toh?" },
      { category: "Essentials", english: "Where is the nearest ATM?", translated: "Où est le distributeur le plus proche ?", pronunciation: "oo eh luh dees-tree-boo-tur luh ploo prosh?" },
      { category: "Essentials", english: "Yes / No", translated: "Oui / Non", pronunciation: "wee / nohn" },

      // Dining & Dietary
      { category: "Dining", english: "A table for two, please", translated: "Une table pour deux, s'il vous plaît", pronunciation: "ewn tah-bluh poor duh, seel voo pleh" },
      { category: "Dining", english: "The bill, please", translated: "L'addition, s'il vous plaît", pronunciation: "lah-dee-syohn, seel voo pleh" },
      { category: "Dining", english: "Free tap water carafe please", translated: "Une carafe d'eau, s'il vous plaît", pronunciation: "ewn kah-rahf doh, seel voo pleh", notes: "Tap water carafe is free by French law" },
      { category: "Dining", english: "I am vegetarian, no meat or fish", translated: "Je suis végétarien, sans viande ni poisson", pronunciation: "zhuh swee vay-zhay-tah-ryan, sahn vyahnd nee pwah-sohn" },
      { category: "Dining", english: "Is this dish spicy?", translated: "Est-ce que ce plat est épicé ?", pronunciation: "es-kuh suh plah eh ay-pee-say?" },
      { category: "Dining", english: "It was delicious!", translated: "C'était délicieux !", pronunciation: "say-teh day-lee-syuh!" },

      // Transit & Navigation
      { category: "Transit", english: "Where is the train station / metro?", translated: "Où est la gare ou le métro ?", pronunciation: "oo eh lah gar oo luh may-troh?" },
      { category: "Transit", english: "Where are the restrooms?", translated: "Où sont les toilettes ?", pronunciation: "oo sohn lay twah-let?" },
      { category: "Transit", english: "A ticket to ..., please", translated: "Un billet pour ..., s'il vous plaît", pronunciation: "uhn bee-yay poor ..., seel voo pleh" },
      { category: "Transit", english: "Does this train go to the airport?", translated: "Ce train va-t-il à l'aéroport ?", pronunciation: "suh tran vah-teel ah lah-ay-roh-por?" },
      { category: "Transit", english: "Stop here please", translated: "Arrêtez-vous ici, s'il vous plaît", pronunciation: "ah-reh-tay voo ee-see, seel voo pleh" },

      // Critical Emergency
      { category: "Emergency", english: "Help me!", translated: "Au secours ! / Aidez-moi !", pronunciation: "oh seh-koor! / ay-day mwah!" },
      { category: "Emergency", english: "Call an ambulance / I need a doctor", translated: "Appelez le SAMU / J'ai besoin d'un médecin", pronunciation: "ah-play luh sah-moo / zhay buh-zwan duhn mayd-sahn", notes: "SAMU emergency dial 15, Pan-Europe 112" },
      { category: "Emergency", english: "Call the police", translated: "Appelez la police", pronunciation: "ah-play lah poh-lees", notes: "French police dial 17" },
      { category: "Emergency", english: "I lost my passport", translated: "J'ai perdu mon passeport", pronunciation: "zhay pair-doo mohn pahs-por" },
      { category: "Emergency", english: "I am allergic to peanuts / seafood", translated: "Je suis allergique aux arachides / fruits de mer", pronunciation: "zhuh swee ah-lair-zheek oh zah-rah-sheed / frwee duh mair" },

      // Numbers
      { category: "Numbers", english: "One, Two, Three, Four, Five", translated: "Un, Deux, Trois, Quatre, Cinq", pronunciation: "uhn, duh, trwah, katr, sank" },
      { category: "Numbers", english: "Ten, Twenty, Fifty, Hundred", translated: "Dix, Vingt, Cinquante, Cent", pronunciation: "dees, van, san-kahnt, sahn" },
    ],
  },
  {
    language: "Spanish",
    country: "Spain & Latin America",
    flag: "🇪🇸",
    localeCode: "es-ES",
    nativeName: "Español",
    phrases: [
      // Greetings & Social
      { category: "Greetings", english: "Hello / Good day", translated: "Hola / Buenos días", pronunciation: "oh-lah / bweh-nohs dee-ahs" },
      { category: "Greetings", english: "Good afternoon / evening", translated: "Buenas tardes / Buenas noches", pronunciation: "bweh-nahs tar-dehs / bweh-nahs noh-chehs" },
      { category: "Greetings", english: "Thank you very much", translated: "Muchas gracias", pronunciation: "moo-chas grah-syas" },
      { category: "Greetings", english: "Please", translated: "Por favor", pronunciation: "por fah-vor" },
      { category: "Greetings", english: "Excuse me / With permission", translated: "Disculpe / Con permiso", pronunciation: "dees-kool-peh / kohn pair-mee-soh" },
      { category: "Greetings", english: "Goodbye / See you later", translated: "Adiós / Hasta luego", pronunciation: "ah-dyohs / ahs-tah lweh-goh" },

      // Essentials & Shopping
      { category: "Essentials", english: "Do you speak English?", translated: "¿Habla inglés?", pronunciation: "ah-blah een-glehs?" },
      { category: "Essentials", english: "How much does it cost?", translated: "¿Cuánto cuesta?", pronunciation: "kwan-toh kwes-tah?" },
      { category: "Essentials", english: "Can I pay with card?", translated: "¿Se puede pagar con tarjeta?", pronunciation: "seh pweh-deh pah-gar kohn tar-kheh-tah?" },
      { category: "Essentials", english: "Where is the nearest ATM?", translated: "¿Dónde hay un cajero automático?", pronunciation: "dohn-deh eye oon kah-kheh-roh ow-toh-mah-tee-koh?" },
      { category: "Essentials", english: "Can you take a photo for us?", translated: "¿Nos puede tomar una foto?", pronunciation: "nohs pweh-deh toh-mar oo-nah foh-toh?" },
      { category: "Essentials", english: "Yes / No", translated: "Sí / No", pronunciation: "see / noh" },

      // Dining & Dietary
      { category: "Dining", english: "The bill, please", translated: "La cuenta, por favor", pronunciation: "lah kwen-tah, por fah-vor" },
      { category: "Dining", english: "A table for two", translated: "Una mesa para dos", pronunciation: "oo-nah meh-sah pah-rah dohs" },
      { category: "Dining", english: "Still bottled water please", translated: "Agua sin gas, por favor", pronunciation: "ah-gwah seen gahs, por fah-vor" },
      { category: "Dining", english: "I am vegetarian, no meat or ham", translated: "Soy vegetariano, sin carne ni jamón", pronunciation: "soy veh-kheh-tah-ryah-noh, seen kar-neh nee hah-mohn", notes: "In Spain, 'jamón' (ham) is often treated separately from meat" },
      { category: "Dining", english: "Is this very spicy?", translated: "¿Esto pica mucho?", pronunciation: "es-toh pee-kah moo-choh?" },
      { category: "Dining", english: "Everything was delicious", translated: "Todo estuvo delicioso", pronunciation: "toh-doh es-too-voh deh-lee-syoh-soh" },

      // Transit & Navigation
      { category: "Transit", english: "Where is the bathroom?", translated: "¿Dónde está el baño?", pronunciation: "dohn-deh es-tah el bah-nyoh?" },
      { category: "Transit", english: "Where is the train / metro station?", translated: "¿Dónde está la estación de tren / metro?", pronunciation: "dohn-deh es-tah lah es-tah-syohn deh tren / may-troh?" },
      { category: "Transit", english: "Take me to this address please", translated: "Lléveme a esta dirección, por favor", pronunciation: "yeh-veh-meh ah es-tah dee-rek-syohn, por fah-vor" },
      { category: "Transit", english: "Turn on the meter please", translated: "Ponga el taxímetro, por favor", pronunciation: "pohn-gah el tahk-see-meh-troh, por fah-vor" },
      { category: "Transit", english: "Stop here please", translated: "Pare aquí, por favor", pronunciation: "pah-reh ah-kee, por fah-vor" },

      // Critical Emergency
      { category: "Emergency", english: "Help me!", translated: "¡Ayuda! / ¡Socorro!", pronunciation: "ah-yoo-dah! / soh-kohr-roh!" },
      { category: "Emergency", english: "Call an ambulance", translated: "Llame a una ambulancia", pronunciation: "yah-meh ah oo-nah ahm-boo-lahn-syah", notes: "Pan-European emergency dial 112" },
      { category: "Emergency", english: "Call the police", translated: "Llame a la policía", pronunciation: "yah-meh ah lah poh-lee-see-ah", notes: "Spain dial 091 / 112" },
      { category: "Emergency", english: "I lost my passport", translated: "He perdido mi pasaporte", pronunciation: "eh pair-dee-doh mee pah-sah-por-teh" },
      { category: "Emergency", english: "I have a serious allergy", translated: "Tengo una alergia grave", pronunciation: "ten-goh oo-nah ah-lair-khee-ah grah-veh" },

      // Numbers
      { category: "Numbers", english: "One, Two, Three, Four, Five", translated: "Uno, Dos, Tres, Cuatro, Cinco", pronunciation: "oo-noh, dohs, trehs, kwah-troh, seen-koh" },
      { category: "Numbers", english: "Ten, Twenty, Fifty, Hundred", translated: "Diez, Veinte, Cincuenta, Cien", pronunciation: "dyehs, bayn-teh, seen-kwen-tah, syen" },
    ],
  },
  {
    language: "Italian",
    country: "Italy",
    flag: "🇮🇹",
    localeCode: "it-IT",
    nativeName: "Italiano",
    phrases: [
      // Greetings & Social
      { category: "Greetings", english: "Hello / Good day", translated: "Buongiorno / Ciao", pronunciation: "bwon-johr-noh / chow", notes: "Buongiorno (formal morning) / Ciao (casual)" },
      { category: "Greetings", english: "Good evening", translated: "Buonasera", pronunciation: "bwoh-nah-seh-rah", notes: "Use after 4:00 PM" },
      { category: "Greetings", english: "Thank you very much", translated: "Grazie mille", pronunciation: "graht-syeh meel-leh" },
      { category: "Greetings", english: "Please", translated: "Per favore / Per piacere", pronunciation: "pair fah-voh-reh / pair pyah-cheh-reh" },
      { category: "Greetings", english: "Excuse me", translated: "Scusi / Permesso", pronunciation: "skoo-zee / pair-mes-soh", notes: "Permesso when passing through crowds" },
      { category: "Greetings", english: "Goodbye", translated: "Arrivederci / Ciao", pronunciation: "ah-ree-veh-dair-chee" },

      // Essentials & Shopping
      { category: "Essentials", english: "Do you speak English?", translated: "Parla inglese?", pronunciation: "par-lah een-gleh-zeh?" },
      { category: "Essentials", english: "How much is this?", translated: "Quanto costa?", pronunciation: "kwan-toh koh-stah?" },
      { category: "Essentials", english: "Can I pay by card?", translated: "Posso pagare con la carta?", pronunciation: "pohs-soh pah-gah-reh kohn lah kar-tah?" },
      { category: "Essentials", english: "Where is the nearest ATM?", translated: "Dov'è il bancomat più vicino?", pronunciation: "doh-veh eel bahn-koh-maht pyoo vee-chee-noh?" },
      { category: "Essentials", english: "Yes / No", translated: "Sì / No", pronunciation: "see / noh" },

      // Dining & Dietary
      { category: "Dining", english: "The check, please", translated: "Il conto, per favore", pronunciation: "eel kohn-toh, pair fah-voh-reh" },
      { category: "Dining", english: "A table for two", translated: "Un tavolo per due", pronunciation: "oon tah-voh-loh pair doo-eh" },
      { category: "Dining", english: "Still bottled water please", translated: "Acqua naturale, per favore", pronunciation: "ahk-wah nah-too-rah-leh, pair fah-voh-reh" },
      { category: "Dining", english: "I am vegetarian, no meat or fish", translated: "Sono vegetariano, senza carne né pesce", pronunciation: "soh-noh veh-jeh-tah-ryah-noh, sen-tsah kar-neh neh peh-sheh" },
      { category: "Dining", english: "Everything was delicious!", translated: "Era tutto delizioso!", pronunciation: "eh-rah toot-toh deh-lee-tsyoh-zoh!" },

      // Transit & Navigation
      { category: "Transit", english: "Where is the bathroom?", translated: "Dov'è il bagno?", pronunciation: "doh-veh eel bah-nyoh?" },
      { category: "Transit", english: "Where is the railway station?", translated: "Dov'è la stazione ferroviaria?", pronunciation: "doh-veh lah stah-tsyoh-neh fair-roh-vyah-ryah?" },
      { category: "Transit", english: "Take me to this address please", translated: "Mi porti a questo indirizzo, per favore", pronunciation: "mee por-tee ah kwes-toh een-dee-reet-tsoh" },
      { category: "Transit", english: "Stop here please", translated: "Si fermi qui, per favore", pronunciation: "see fair-mee kwee, pair fah-voh-reh" },

      // Critical Emergency
      { category: "Emergency", english: "Help me!", translated: "Aiuto!", pronunciation: "ah-yoo-toh!" },
      { category: "Emergency", english: "Call an ambulance", translated: "Chiamate un'ambulanza", pronunciation: "kyah-mah-teh oon ahm-boo-lahn-tsah", notes: "Emergency dial 112" },
      { category: "Emergency", english: "Call the police", translated: "Chiamate la polizia / carabinieri", pronunciation: "kyah-mah-teh lah poh-lee-tsee-ah" },
      { category: "Emergency", english: "I lost my passport", translated: "Ho perso il mio passaporto", pronunciation: "oh pair-soh eel mee-oh pahs-sah-por-toh" },
      { category: "Emergency", english: "I need a doctor", translated: "Ho bisogno di un medico", pronunciation: "oh bee-zoh-nyoh dee oon meh-dee-koh" },

      // Numbers
      { category: "Numbers", english: "One, Two, Three, Four, Five", translated: "Uno, Due, Tre, Quattro, Cinque", pronunciation: "oo-noh, doo-eh, treh, kwaht-troh, cheen-kweh" },
      { category: "Numbers", english: "Ten, Fifty, Hundred, Thousand", translated: "Dieci, Cinquanta, Cento, Mille", pronunciation: "dye-chee, cheen-kwahn-tah, chen-toh, meel-leh" },
    ],
  },
  {
    language: "German",
    country: "Germany, Austria & Switzerland",
    flag: "🇩🇪",
    localeCode: "de-DE",
    nativeName: "Deutsch",
    phrases: [
      // Greetings & Social
      { category: "Greetings", english: "Hello / Good day", translated: "Guten Tag / Hallo", pronunciation: "goo-ten tahk / hah-loh" },
      { category: "Greetings", english: "Good morning", translated: "Guten Morgen", pronunciation: "goo-ten mor-gen" },
      { category: "Greetings", english: "Thank you very much", translated: "Vielen Dank", pronunciation: "fee-len dahnk" },
      { category: "Greetings", english: "Please / You're welcome", translated: "Bitte", pronunciation: "bit-tuh" },
      { category: "Greetings", english: "Excuse me", translated: "Entschuldigung", pronunciation: "ent-shool-dee-goong" },
      { category: "Greetings", english: "Goodbye", translated: "Auf Wiedersehen / Tschüss", pronunciation: "owf vee-der-zay-en / chooss" },

      // Essentials & Shopping
      { category: "Essentials", english: "Do you speak English?", translated: "Sprechen Sie Englisch?", pronunciation: "shprek-hen zee eng-lish?" },
      { category: "Essentials", english: "How much does it cost?", translated: "Wie viel kostet das?", pronunciation: "vee feel kohs-tet dahs?" },
      { category: "Essentials", english: "Can I pay with card?", translated: "Kann ich mit Karte zahlen?", pronunciation: "kahn ikh mit kar-tuh tsah-len?", notes: "Some traditional German venues remain cash-preferred" },
      { category: "Essentials", english: "Where is the nearest ATM?", translated: "Wo ist der nächste Geldautomat?", pronunciation: "voh eest dair naykh-stuh gelt-ow-toh-maht?" },
      { category: "Essentials", english: "Yes / No", translated: "Ja / Nein", pronunciation: "yah / nine" },

      // Dining & Dietary
      { category: "Dining", english: "The bill, please", translated: "Die Rechnung, bitte", pronunciation: "dee rekh-noong, bit-tuh" },
      { category: "Dining", english: "Still bottled water please", translated: "Stilles Wasser, bitte", pronunciation: "shtil-les vahs-ser, bit-tuh", notes: "Default German water is carbonated ('mit Kohlensäure')" },
      { category: "Dining", english: "I am vegetarian, no meat or pork", translated: "Ich bin Vegetarier, kein Fleisch oder Schweinefleisch", pronunciation: "ikh bin veh-geh-tah-ree-er, kine flysh oh-der shvy-neh-flysh" },
      { category: "Dining", english: "It tasted very good", translated: "Es hat sehr gut geschmeckt", pronunciation: "es haht zair goot geh-shmekt" },

      // Transit & Navigation
      { category: "Transit", english: "Where is the toilet?", translated: "Wo ist die Toilette?", pronunciation: "voh eest dee twah-let-teh?" },
      { category: "Transit", english: "Where is the main train station?", translated: "Wo ist der Hauptbahnhof?", pronunciation: "voh eest dair howpt-bahn-hohf?" },
      { category: "Transit", english: "Does this train go to the airport?", translated: "Fährt dieser Zug zum Flughafen?", pronunciation: "fehrt dee-zer tsook tsoom flook-hah-fen?" },
      { category: "Transit", english: "Please stop here", translated: "Bitte halten Sie hier an", pronunciation: "bit-tuh hahl-ten zee heer ahn" },

      // Critical Emergency
      { category: "Emergency", english: "Help me!", translated: "Hilfe!", pronunciation: "hil-fuh!" },
      { category: "Emergency", english: "Call an ambulance", translated: "Rufen Sie einen Krankenwagen", pronunciation: "roo-fen zee eye-nen krahn-ken-vah-gen", notes: "Europe dial 112" },
      { category: "Emergency", english: "Call the police", translated: "Rufen Sie die Polizei", pronunciation: "roo-fen zee dee poh-lee-tsye", notes: "Germany police dial 110" },
      { category: "Emergency", english: "I lost my passport", translated: "Ich habe meinen Reisepass verloren", pronunciation: "ikh hah-buh my-nen rye-zeh-pahs fair-loh-ren" },
      { category: "Emergency", english: "I need a doctor", translated: "Ich brauche einen Arzt", pronunciation: "ikh brow-khuh eye-nen ahrtst" },

      // Numbers
      { category: "Numbers", english: "One, Two, Three, Four, Five", translated: "Eins, Zwei, Drei, Vier, Fünf", pronunciation: "eyns, tsvy, dry, feer, feonf" },
      { category: "Numbers", english: "Ten, Fifty, Hundred, Thousand", translated: "Zehn, Fünfzig, Hundert, Tausend", pronunciation: "tsayn, feonf-tsikh, hoon-dairt, tow-zent" },
    ],
  },
  {
    language: "Korean",
    country: "South Korea",
    flag: "🇰🇷",
    localeCode: "ko-KR",
    nativeName: "한국어",
    phrases: [
      // Greetings & Social
      { category: "Greetings", english: "Hello / Good day", translated: "안녕하세요", pronunciation: "ahn-nyoung-hah-seh-yoh", notes: "Bow head slightly when greeting" },
      { category: "Greetings", english: "Thank you very much", translated: "감사합니다", pronunciation: "gahm-sah-hahm-nee-dah" },
      { category: "Greetings", english: "Excuse me / Just a moment", translated: "실례합니다 / 잠시만요", pronunciation: "sheel-lyeh-hahm-nee-dah / jahm-shee-mahn-yoh" },
      { category: "Greetings", english: "Goodbye (to someone staying)", translated: "안녕히 계세요", pronunciation: "ahn-nyoung-hee gyeh-seh-yoh" },
      { category: "Greetings", english: "Goodbye (to someone leaving)", translated: "안녕히 가세요", pronunciation: "ahn-nyoung-hee gah-seh-yoh" },

      // Essentials & Shopping
      { category: "Essentials", english: "Do you speak English?", translated: "영어 할 수 있으세요?", pronunciation: "yung-uh hal soo ee-seu-seh-yoh?" },
      { category: "Essentials", english: "How much is this?", translated: "이거 얼마예요?", pronunciation: "ee-guh eol-mah-yeh-yoh?" },
      { category: "Essentials", english: "Can I pay with card?", translated: "카드 결제 되나요?", pronunciation: "kah-deu gyul-jeh dweh-nah-yoh?" },
      { category: "Essentials", english: "Please give me this", translated: "이거 주세요", pronunciation: "ee-guh joo-seh-yoh" },
      { category: "Essentials", english: "Do you have Wi-Fi?", translated: "와이파이 있어요?", pronunciation: "wah-ee-pah-ee eess-uh-yoh?" },
      { category: "Essentials", english: "Yes / No", translated: "네 / 아니요", pronunciation: "neh / ah-nee-yoh" },

      // Dining & Dietary
      { category: "Dining", english: "Water please", translated: "물 좀 주세요", pronunciation: "mool jom joo-seh-yoh", notes: "Water in Korean restaurants is self-serve or complimentary" },
      { category: "Dining", english: "Check / Bill please", translated: "계산해 주세요", pronunciation: "gye-sahn-hae joo-seh-yoh" },
      { category: "Dining", english: "I am vegetarian (no meat or seafood)", translated: "저는 채식주의자예요, 고기랑 해산물 빼주세요", pronunciation: "juh-neun chae-sheek-joo-ee-jah-yeh-yoh, goh-gee-rahng hae-sahn-mool bbae-joo-seh-yoh" },
      { category: "Dining", english: "Not spicy please", translated: "안 맵게 해주세요", pronunciation: "ahn maep-geh hae-joo-seh-yoh" },
      { category: "Dining", english: "It is delicious!", translated: "맛있어요!", pronunciation: "mah-shee-ssuh-yoh!" },

      // Transit & Navigation
      { category: "Transit", english: "Where is the subway station?", translated: "지하철역이 어디예요?", pronunciation: "jee-hah-chul-yuhk-ee uh-dee-yeh-yoh?" },
      { category: "Transit", english: "Where is the restroom?", translated: "화장실이 어디예요?", pronunciation: "hwah-jahng-sheel-ee uh-dee-yeh-yoh?" },
      { category: "Transit", english: "Please take me to this address", translated: "이 주소로 가주세요", pronunciation: "ee joo-soh-roh gah-joo-seh-yoh" },
      { category: "Transit", english: "Please stop here", translated: "여기서 내려주세요", pronunciation: "yuh-gee-suh nae-ryuh-joo-seh-yoh" },

      // Critical Emergency
      { category: "Emergency", english: "Help me!", translated: "도와주세요!", pronunciation: "doh-wah-joo-seh-yoh!" },
      { category: "Emergency", english: "Please call an ambulance", translated: "구급차를 불러주세요", pronunciation: "goo-geup-chah-reul bool-luh-joo-seh-yoh", notes: "Korea ambulance dial 119" },
      { category: "Emergency", english: "Please call the police", translated: "경찰을 불러주세요", pronunciation: "gyung-chahl-eul bool-luh-joo-seh-yoh", notes: "Korea police dial 112" },
      { category: "Emergency", english: "I lost my passport", translated: "여권을 잃어버렸어요", pronunciation: "yuh-gwon-eul eel-uh-buh-ryuss-uh-yoh" },
      { category: "Emergency", english: "I need to go to a hospital", translated: "병원에 가야 해요", pronunciation: "byung-won-eh gah-yah hae-yoh" },

      // Numbers
      { category: "Numbers", english: "One, Two, Three, Four, Five", translated: "일 (il), 이 (ee), 삼 (sam), 사 (sa), 오 (oh)", pronunciation: "eel, ee, sahm, sah, oh" },
      { category: "Numbers", english: "Ten, Hundred, Thousand, Ten Thousand", translated: "십 (sip), 백 (baek), 천 (cheon), 만 (man)", pronunciation: "sheep, baek, chun, mahn" },
    ],
  },
  {
    language: "Mandarin Chinese",
    country: "China, Taiwan & Singapore",
    flag: "🇨🇳",
    localeCode: "zh-CN",
    nativeName: "中文",
    phrases: [
      // Greetings & Social
      { category: "Greetings", english: "Hello", translated: "你好", pronunciation: "nee how (nǐ hǎo)" },
      { category: "Greetings", english: "Thank you very much", translated: "非常感谢 / 谢谢", pronunciation: "fay-chahng gahn-shyeh / shyeh-shyeh" },
      { category: "Greetings", english: "Excuse me / Sorry", translated: "不好意思 / 对不起", pronunciation: "boo how yee-sze / dway boo chee" },
      { category: "Greetings", english: "Goodbye", translated: "再见", pronunciation: "zeye jyen (zàijiàn)" },

      // Essentials & Shopping
      { category: "Essentials", english: "Do you speak English?", translated: "你会说英语吗？", pronunciation: "nee hway shwoh ying-yoo mah?" },
      { category: "Essentials", english: "How much is this?", translated: "这个多少钱？", pronunciation: "jeh-guh dwor-sshow chyen?" },
      { category: "Essentials", english: "Can you give a discount?", translated: "可以便宜一点吗？", pronunciation: "kuh-yee pyan-yee yee-dyaan mah?" },
      { category: "Essentials", english: "Can I use WeChat Pay / Alipay / Card?", translated: "可以刷卡或用支付宝/微信吗？", pronunciation: "kuh-yee shwah kah hwoh yohng jhee-foo-bow / way-sheen mah?" },
      { category: "Essentials", english: "I want this one", translated: "我要这个", pronunciation: "wor yow jeh-guh" },
      { category: "Essentials", english: "Yes / No", translated: "是的 / 不是", pronunciation: "shrr duh / boo shrr" },

      // Dining & Dietary
      { category: "Dining", english: "The bill, please", translated: "买单 / 结账", pronunciation: "mye dahn / jyeh jahng" },
      { category: "Dining", english: "Warm water please", translated: "请给我温水", pronunciation: "ching gay wor wen shway", notes: "Warm water is customarily served in China" },
      { category: "Dining", english: "I am vegetarian (no meat or seafood)", translated: "我吃素，不吃肉和海鲜", pronunciation: "wor chr soo, boo chr row huh hye-ssyen" },
      { category: "Dining", english: "Not spicy please", translated: "请不要辣", pronunciation: "ching boo yow lah" },
      { category: "Dining", english: "Very delicious!", translated: "很好吃！", pronunciation: "hen how chr!" },

      // Transit & Navigation
      { category: "Transit", english: "Where is the bathroom?", translated: "洗手间在哪里？", pronunciation: "shee show jyen zeye nah lee?" },
      { category: "Transit", english: "Where is the subway / airport?", translated: "地铁站或机场在哪里？", pronunciation: "dee tyeh jahn hwoh jee-chahng zeye nah lee?" },
      { category: "Transit", english: "Take me to this address please", translated: "请带我去这个地址", pronunciation: "ching dye wor choo jeh-guh dee-jrr" },
      { category: "Transit", english: "Please turn on the meter", translated: "请打表", pronunciation: "ching dah byow", notes: "Standard taxi requirement" },
      { category: "Transit", english: "Stop here please", translated: "请停在这里", pronunciation: "ching ting zeye jeh-lee" },

      // Critical Emergency
      { category: "Emergency", english: "Help me!", translated: "救命！ / 请帮帮我！", pronunciation: "jyoe ming! / ching bahng bahng wor!" },
      { category: "Emergency", english: "Call an ambulance", translated: "请叫救护车", pronunciation: "ching jyaow jyoe-hoo chuh", notes: "China ambulance dial 120" },
      { category: "Emergency", english: "Call the police", translated: "报警 / 叫警察", pronunciation: "baow jing / jyaow jing chah", notes: "China police dial 110" },
      { category: "Emergency", english: "I lost my passport", translated: "我的护照丢了", pronunciation: "wor duh hoo-jow dyoe luh" },
      { category: "Emergency", english: "Where is the hospital?", translated: "医院在哪里？", pronunciation: "yee yoo-ahn zeye nah lee?" },

      // Numbers
      { category: "Numbers", english: "One, Two, Three, Four, Five", translated: "一, 二, 三, 四, 五", pronunciation: "yee, er, sahn, ssze, woo (yī, èr, sān, sì, wǔ)" },
      { category: "Numbers", english: "Ten, Hundred, Thousand, Ten Thousand", translated: "十, 百, 千, 万", pronunciation: "shrr, bye, chyen, wahn" },
    ],
  },
  {
    language: "Polish",
    country: "Poland",
    flag: "🇵🇱",
    localeCode: "pl-PL",
    nativeName: "Polski",
    phrases: [
      // Greetings & Social
      { category: "Greetings", english: "Hello / Good day", translated: "Dzień dobry", pronunciation: "jen doh-brih", notes: "Formal standard daytime greeting" },
      { category: "Greetings", english: "Thank you very much", translated: "Dziękuję bardzo", pronunciation: "jen-koo-yeh bar-dzoh" },
      { category: "Greetings", english: "Please / You're welcome", translated: "Proszę", pronunciation: "proh-sheh", notes: "Universal polite word for please and you're welcome" },
      { category: "Greetings", english: "Excuse me / Sorry", translated: "Przepraszam", pronunciation: "psheh-prah-shahm" },
      { category: "Greetings", english: "Goodbye", translated: "Do widzenia", pronunciation: "doh veed-zeh-nyah" },

      // Essentials & Shopping
      { category: "Essentials", english: "Do you speak English?", translated: "Czy mówi pan/pani po angielsku?", pronunciation: "chih moo-vee pahn/pahn-ee poh ahn-gyel-skoo?" },
      { category: "Essentials", english: "How much is this?", translated: "Ile to kosztuje?", pronunciation: "ee-leh toh kosh-too-yeh?" },
      { category: "Essentials", english: "Can I pay by card?", translated: "Czy mogę zapłacić kartą?", pronunciation: "chih moh-geh zah-pwah-cheech kar-toh?" },
      { category: "Essentials", english: "Yes / No", translated: "Tak / Nie", pronunciation: "tahk / nyeh" },

      // Dining & Dietary
      { category: "Dining", english: "Check / Bill please", translated: "Rachunek poproszę", pronunciation: "rah-khoo-nek poh-proh-sheh" },
      { category: "Dining", english: "A table for two", translated: "Stolik dla dwóch osób", pronunciation: "stoh-leek dlah dvookh oh-soob" },
      { category: "Dining", english: "Tap water please", translated: "Poproszę wodę z kranu", pronunciation: "poh-proh-sheh voh-deh z krah-noo" },
      { category: "Dining", english: "I am vegetarian (no meat)", translated: "Jestem wegetarianinem (bez mięsa)", pronunciation: "yes-tem veh-geh-tah-ryah-nee-nem (bez myen-sah)" },
      { category: "Dining", english: "Delicious!", translated: "Pyszne!", pronunciation: "pish-neh!" },

      // Transit & Navigation
      { category: "Transit", english: "Where is the train station?", translated: "Gdzie jest dworzec kolejowy?", pronunciation: "gjeh yest dvoh-zhets koh-leh-yoh-vih?" },
      { category: "Transit", english: "Where is the bathroom?", translated: "Gdzie jest toaleta?", pronunciation: "gjeh yest toh-ah-leh-tah?" },
      { category: "Transit", english: "Please stop here", translated: "Proszę się tutaj zatrzymać", pronunciation: "proh-sheh sheh too-tye zah-tshih-mach" },

      // Critical Emergency
      { category: "Emergency", english: "Help!", translated: "Pomocy!", pronunciation: "poh-moh-tsih!" },
      { category: "Emergency", english: "Call an ambulance", translated: "Proszę wezwać pogotowie", pronunciation: "proh-sheh vez-vahch poh-goh-toh-vyeh", notes: "Emergency dial 112" },
      { category: "Emergency", english: "Call the police", translated: "Proszę wezwać policję", pronunciation: "proh-sheh vez-vahch poh-leets-yeh" },
      { category: "Emergency", english: "I lost my passport", translated: "Zgubiłem mój paszport", pronunciation: "zgoo-bee-wem moo-ee pahsh-port" },

      // Numbers
      { category: "Numbers", english: "One, Two, Three, Four, Five", translated: "Jeden, Dwa, Trzy, Cztery, Pięć", pronunciation: "yeh-den, dvah, tshee, chte-ree, pyench" },
    ],
  },
];
