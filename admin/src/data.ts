import { Leader, Wing, Officer, MediaItem } from './types';

export const HERO_BADGE_URL = "https://i.ibb.co/bYGc84w/image.png";

export const LEADERS: Leader[] = [
  {
    id: 'subhas_chandra_bose',
    name: 'நேதாஜி சுபாஷ் சந்திர போஸ்',
    name_en: 'Subhas Chandra Bose',
    title: 'இந்திய தேசிய இராணுவத்தின் தலைவர்',
    title_en: 'Leader of the Indian National Army',
    quote: '"சுதந்திரம் என்பது இலவசமாகத் தரப்படுவதில்லை—அது போராடிப் பெற வேண்டிய ஒன்று."',
    quote_en: '"Freedom is not given—it is taken."',
    imageUrl: 'https://i.ibb.co/gBf8KFK/image.png',
    bio: 'நேதாஜி சுபாஷ் சந்திர போஸ் இந்திய சுதந்திரப் போராட்டத்தின் மிகச்சிறந்த தேசியத் தலைவர்களில் ஒருவர் ஆவார். அவர் இந்திய தேசிய இராணுவத்தை (INA) இளைஞர்களின் மீது உள்ள நம்பிக்கையால் உருவாக்கி பிரிட்டிஷ் ஆட்சிக்கு எதிராக ஆயுதப் போராட்டத்தை வழிநடத்தினார். அவரது தளராத தைரியமும், தேசப்பற்றும் இன்றும் கோடி கணக்கான இளைஞர்களுக்கு சிறந்த வழிகாட்டியாகத் திகழ்கிறது.',
    bio_en: 'Subhas Chandra Bose was one of the most prominent national leaders of the Indian independence movement. He formed the Indian National Army (INA) and led a historic armed struggle against British rule. His indomitable courage and fierce patriotism continue to inspire millions of people worldwide.'
  },
  {
    id: 'velupillai_prabhakaran',
    name: 'வேலுப்பிள்ளை பிரபாகரன்',
    name_en: 'Velupillai Prabhakaran',
    title: 'தமிழ் தேசிய விடுதலை இயக்கத்தின் நிறுவனர்',
    title_en: 'Founder of the Tamil National Liberation Movement',
    quote: '"போராட்ட வடிவங்கள் மாறலாம்; ஆனால் எமது போராட்டத்தின் இலட்சியம் மாறுவதில்லை."',
    quote_en: '"The form of struggle changes, but the goal of our struggle does not change."',
    imageUrl: 'https://i.ibb.co/4RPg26h2/image.png',
    bio: 'வேலுப்பிள்ளை பிரபாகரன் தமிழ் தேசிய விடுதலை இயக்கத்தின் நிறுவனர் மற்றும் தலைவர் ஆவார். தமிழ் மக்களின் உரிமைகளுக்காகவும், இறையாண்மைக்காகவும், சுயமரியாதைக்காகவும் தனது வாழ்நாளை அர்ப்பணித்த பெருமைக்குரியவர். அவரது தெளிவான கொள்கைகளும், ஒழுக்கமும், அடக்குமுறைக்கு எதிரான அவரது இடைவிடா போராட்டமும் குறிப்பிடத்தக்கவை ஆகும்.',
    bio_en: 'Velupillai Prabhakaran was the founder and leader of the Tamil National Liberation Movement. He is remembered for dedicating his life to fighting for the rights, sovereignty, and self-respect of the Tamil people. His unwavering principles, self-discipline, and strong stand against oppression remain highly influential.'
  },
  {
    id: 'abdul_kalam',
    name: 'டாக்டர் ஏ. பி. ஜே. அப்துல் கலாம்',
    name_en: 'Dr. A. P. J. Abdul Kalam',
    title: 'இந்தியாவின் ஏவுகணை மனிதர்',
    title_en: 'The Missile Man of India',
    quote: '"கனவு என்பது தூங்கும்போது காண்பது அல்ல, உன்னை என்னை தூங்கவிடாமல் செய்வதே கனவு."',
    quote_en: '"Dream is not that which you see while sleeping, it is something that does not let you sleep."',
    imageUrl: 'https://i.ibb.co/xtbTTkpB/image.png',
    bio: 'டாக்டர் ஏ. பி. ஜே. அப்துல் கலாம் இந்தியாவின் 11-வது குடியரசுத் தலைவராகப் பணியாற்றிய சிறந்த விஞ்ஞானி மற்றும் கல்வியாளர் ஆவார். இந்தியாவின் விண்வெளி மற்றும் ஏவுகணைத் தொழில்நுட்ப வளர்ச்சிக்கு அவர் ஆற்றிய பங்களிப்பிற்காக உலகளவில் போற்றப்படுகிறார். அவரது எளிமையும், இளைஞர்களுக்கு அவர் வழங்கிய ஊக்கமும் என்றும் போற்றத்தக்கது.',
    bio_en: 'Dr. A. P. J. Abdul Kalam was an eminent scientist and educationist who served as the 11th President of India. Renowned globally as the "Missile Man of India", he played a pioneering role in India\'s space and defense missile programs. He is beloved for his incredible humility, wisdom, and profound influence on youth.'
  }
];

export const WINGS: Wing[] = [
  {
    "id": "youth",
    "name": "இளைஞர் அணி",
    "name_en": "Youth Wing",
    "icon": "User",
    "description": "இளைஞர்களின் ஆற்றலை நற்பணிகளுக்குப் பயன்படுத்துதல்.",
    "description_en": "Channeling youth energy into community development."
  },
  {
    "id": "students",
    "name": "மாணவர் அணி",
    "name_en": "Students Wing",
    "icon": "BookOpen",
    "description": "மாணவர்களின் கல்வி மற்றும் முன்னேற்றம்.",
    "description_en": "Securing student advancement and education."
  },
  {
    "id": "women",
    "name": "மகளிர் அணி",
    "name_en": "Women's Wing",
    "icon": "Heart",
    "description": "பெண்களின் உரிமைகளைப் பாதுகாத்தல்.",
    "description_en": "Sustaining womanhood rights and development."
  },
  {
    "id": "fishermen",
    "name": "மீனவர் அணி",
    "name_en": "Fishermen Wing",
    "icon": "Anchor",
    "description": "மீனவ மக்களின் வாழ்வாதார உரிமைகளைப் பாதுகாத்தல்.",
    "description_en": "Protecting livelihood rights of fishermen."
  },
  {
    "id": "spiritual",
    "name": "ஆன்மீக அணி",
    "name_en": "Spiritual Wing",
    "icon": "Flower2",
    "description": "ஆன்மீக விழிப்புணர்வு மற்றும் நல்லிணக்கத்தை உருவாக்குதல்.",
    "description_en": "Creating spiritual awareness and harmony."
  },
  {
    "id": "minority",
    "name": "சிறுபான்மையினர் அணி",
    "name_en": "Minority Wing",
    "icon": "Users",
    "description": "சிறுபான்மையினரின் உரிமைகளைப் பாதுகாத்தல்.",
    "description_en": "Protecting the rights of minorities."
  },
  {
    "id": "transgender",
    "name": "திருநங்கை அணி",
    "name_en": "Transgender Wing",
    "icon": "Rainbow",
    "description": "திருநங்கைகளின் சம உரிமை மற்றும் நல்வாழ்வு.",
    "description_en": "Equal rights and well-being for transgenders."
  },
  {
    "id": "govt_employees",
    "name": "அரசு ஊழியர் பிரிவு",
    "name_en": "Government Employees Wing",
    "icon": "Briefcase",
    "description": "அரசு ஊழியர்களின் நலன்களை காத்தல்.",
    "description_en": "Safeguarding the welfare of government employees."
  },
  {
    "id": "traders",
    "name": "வர்த்தகர் அணி",
    "name_en": "Traders / Merchant Wing",
    "icon": "Store",
    "description": "வியாபாரிகளின் வணிக உரிமைகளைப் பாதுகாத்தல்.",
    "description_en": "Safeguarding commercial rights of traders."
  },
  {
    "id": "lawyers",
    "name": "வழக்கறிஞர் அணி",
    "name_en": "Advocates / Lawyers Wing",
    "icon": "Scale",
    "description": "இலவச சட்ட ஆலோசனைகள் மற்றும் சட்டரீதியான உரிமை மீட்பு.",
    "description_en": "Pro-bono legal counsel and right protection."
  },
  {
    "id": "literary",
    "name": "இலக்கிய அணி",
    "name_en": "Literary Wing",
    "icon": "Book",
    "description": "இலக்கிய வளர்ச்சி மற்றும் தாய்மொழிப் பற்று.",
    "description_en": "Literary development and linguistic devotion."
  },
  {
    "id": "cultural",
    "name": "கலாச்சார பிரிவு",
    "name_en": "Cultural Wing",
    "icon": "Music",
    "description": "நமது கலாச்சார விழுமியங்களைப் போற்றுதல்.",
    "description_en": "Preserving and celebrating our cultural values."
  },
  {
    "id": "private_employees",
    "name": "தனியார் ஊழியர் பிரிவு",
    "name_en": "Private Employees Wing",
    "icon": "Building2",
    "description": "தனியார் துறை ஊழியர்களின் உரிமைகளைப் பாதுகாத்தல்.",
    "description_en": "Protecting the rights of private sector employees."
  },
  {
    "id": "volunteers",
    "name": "தொண்டர் அணி",
    "name_en": "Volunteers / Cadres Wing",
    "icon": "Globe",
    "description": "சமூகத் தொண்டு மற்றும் பேரிடர் மீட்புப் பணிகள்.",
    "description_en": "Social service and disaster relief work."
  },
  {
    "id": "doctors",
    "name": "மருத்துவர் அணி",
    "name_en": "Doctors Wing",
    "icon": "Stethoscope",
    "description": "இலவச மருத்துவ உதவிகள் மற்றும் விழிப்புணர்வு.",
    "description_en": "Free medical assistance and health awareness."
  },
  {
    "id": "farmers",
    "name": "விவசாயி அணி",
    "name_en": "Farmers Wing",
    "icon": "Sprout",
    "description": "உழவர்களின் உரிமைகளைக் காப்பது.",
    "description_en": "Defending agricultural rights and development."
  },
  {
    "id": "engineers",
    "name": "பொறியாளர் பிரிவு",
    "name_en": "Engineers Wing",
    "icon": "HardHat",
    "description": "தொழில்நுட்ப மேம்பாட்டு ஆலோசனைகள்.",
    "description_en": "Technical expertise for developmental advisory."
  },
  {
    "id": "it_wing",
    "name": "தகவல் தொழில்நுட்ப அணி",
    "name_en": "IT Wing",
    "icon": "Monitor",
    "description": "டிஜிட்டல் விழிப்புணர்வு மற்றும் நல்வழிப்படுத்தல்.",
    "description_en": "Leading digital literacy and support."
  }
];

export const OFFICERS: Officer[] = [
  // --- STATE LEVEL (EXECUTIVE) ---
  {
    id: 's1',
    name: 'வழக்கறிஞர் Dr.PK @ த. பிரபாகரன் (MA.LLB.DFSE.Ph.D)',
    name_en: 'Advocate Dr.PK @ T. Prabakaran',
    role: 'நிறுவனத் தலைவர்',
    role_en: 'Founder / President',
    district: 'சிவகங்கை',
    district_en: 'Sivagangai',
    level: 'state',
    phone: '9842400101',
    imageUrl: 'https://i.postimg.cc/R0yPHkDD/leader-big.png'
  },
  {
    id: 's2',
    name: 'மணிவண்ணன்',
    name_en: 'Manivannan',
    role: 'மாநில தலைமை ஆலோசகர் (முன்னாள் காவல் கண்காணிப்பாளர்)',
    role_en: 'State Chief Advisor (Ex-SP)',
    district: 'சென்னை',
    district_en: 'Chennai',
    level: 'state',
    imageUrl: 'https://i.ibb.co/6JYggTwP/image.png'
  },
  {
    id: 's3',
    name: 'S. மணிவாசகம்',
    name_en: 'S. Manivasagam',
    role: 'முதன்மைச் செயலாளர்',
    role_en: 'Principal Secretary',
    district: 'திருச்சி',
    district_en: 'Trichy',
    level: 'state',
    imageUrl: 'https://i.ibb.co/rRX7ySPf/image.png'
  },
  {
    id: 's4',
    name: 'G.L. கோவிந்தராஜன்',
    name_en: 'G.L. Govindarajan',
    role: 'தலைமை நிலைய செயலாளர்',
    role_en: 'Headquarters Secretary',
    district: 'சென்னை',
    district_en: 'Chennai',
    level: 'state',
    imageUrl: 'https://i.ibb.co/vCYPfw1H/image.png'
  },
  {
    id: 's5',
    name: 'K. கார்த்திகா',
    name_en: 'K. Karthika',
    role: 'நிர்வாகச் செயலாளர்',
    role_en: 'Administrative Secretary',
    district: 'மதுரை',
    district_en: 'Madurai',
    level: 'state',
    imageUrl: 'https://i.ibb.co/8LzpqMqJ/image.png'
  },
  {
    id: 's6',
    name: 'R. முகமது பிலால்',
    name_en: 'R. Mohamadu Bilal',
    role: 'மாநில துணைத் தலைவர்',
    role_en: 'State Vice President',
    district: 'சிவகங்கை',
    district_en: 'Sivagangai',
    level: 'state',
    imageUrl: 'https://i.ibb.co/fzVQFF4z/image.png'
  },
  {
    id: 's7',
    name: 'K. வெங்கட்ராமன்',
    name_en: 'K. Venkatraman',
    role: 'மாநில துணைச் செயலாளர்',
    role_en: 'State Deputy Secretary',
    district: 'தேனி',
    district_en: 'Theni',
    level: 'state',
    imageUrl: 'https://i.ibb.co/RGf7XkYv/image.png'
  },
  {
    id: 's8',
    name: 'M. செல்வ கணபதி',
    name_en: 'M. Selva Ganapathi',
    role: 'மாநில அமைப்பு செயலாளர்',
    role_en: 'State Organizing Secretary',
    district: 'தஞ்சாவூர்',
    district_en: 'Thanjavur',
    level: 'state',
    imageUrl: 'https://i.ibb.co/YTJrVtjD/image.png'
  },
  {
    id: 's9',
    name: 'S. மூர்த்தி',
    name_en: 'S. Moorthi',
    role: 'மாநில அமைப்பு செயலாளர்',
    role_en: 'State Organizing Secretary',
    district: 'திண்டுக்கல்',
    district_en: 'Dindigul',
    level: 'state',
    imageUrl: 'https://i.ibb.co/VWsb8Th3/image.png'
  },
  {
    id: 's10',
    name: 'S. லோகநாதன்',
    name_en: 'S. Loganathan',
    role: 'மாநில அமைப்பு துணைச் செயலாளர்',
    role_en: 'State Organizing Joint Secretary',
    district: 'சேலம்',
    district_en: 'Salem',
    level: 'state',
    imageUrl: 'https://i.ibb.co/TMCB2tFX/image.png'
  },
  {
    id: 's11',
    name: 'P.K. முருகானந்தம்',
    name_en: 'P.K. Muruganandham',
    role: 'மாநில இளைஞரணி துணைச் செயலாளர்',
    role_en: 'State Youth Wing Joint Secretary',
    district: 'மதுரை',
    district_en: 'Madurai',
    level: 'state',
    imageUrl: 'https://i.ibb.co/tfxmsbr/image.png'
  },
  {
    id: 's12',
    name: 'குகன்',
    name_en: 'Guhan',
    role: 'மாநில இளைஞரணி துணைச் செயலாளர்',
    role_en: 'State Youth Wing Joint Secretary',
    district: 'விருதுநகர்',
    district_en: 'Virudhunagar',
    level: 'state',
    imageUrl: 'https://i.ibb.co/0y94JpSw/image.png'
  },
  {
    id: 's13',
    name: 'R. பாபு',
    name_en: 'R. Babu',
    role: 'மாநில இளைஞரணி துணைச் செயலாளர்',
    role_en: 'State Youth Wing Joint Secretary',
    district: 'தூத்துக்குடி',
    district_en: 'Thoothukudi',
    level: 'state',
    imageUrl: 'https://i.ibb.co/PG1V4wFm/image.png'
  },
  {
    id: 's14',
    name: 'R. ஆறுமுக தேவி',
    name_en: 'R. Arumuga Devi',
    role: 'மாநில மகளிர் அணி தலைவி',
    role_en: 'State Women Wing President',
    district: 'தென்காசி',
    district_en: 'Tenkasi',
    level: 'state',
    imageUrl: 'https://i.ibb.co/C5M2v66M/image.png'
  },
  {
    id: 's15',
    name: 'V. ரினி பவதாரணி',
    name_en: 'V. Rini Pavatharani',
    role: 'மாநில மகளிர் அணி செயலாளர்',
    role_en: 'State Women Wing Secretary',
    district: 'கன்னியாகுமரி',
    district_en: 'Kanyakumari',
    level: 'state',
    imageUrl: 'https://i.ibb.co/PGPMKRQw/image.png'
  },
  {
    id: 's16',
    name: 'S. மாலினி',
    name_en: 'S. Malini',
    role: 'மாநில மகளிர் அணி துணைச் செயலாளர்',
    role_en: 'State Women Wing Joint Secretary',
    district: 'தஞ்சாவூர்',
    district_en: 'Thanjavur',
    level: 'state',
    imageUrl: 'https://i.ibb.co/tPMMJJGN/image.png'
  },
  {
    id: 's17',
    name: 'T. லோகநாதன்',
    name_en: 'T. Loganathan',
    role: 'மண்டல செயலாளர்',
    role_en: 'Zonal Secretary',
    district: 'திருப்பூர்',
    district_en: 'Tiruppur',
    level: 'state',
    imageUrl: 'https://i.ibb.co/679L0qHv/image.png'
  },
  {
    id: 's18',
    name: 'கண்ணன்',
    name_en: 'Kannan',
    role: 'மாநில வழக்கறிஞர் அணி செயலாளர்',
    role_en: 'State Advocate Wing Secretary',
    district: 'நாமக்கல்',
    district_en: 'Namakkal',
    level: 'state',
    imageUrl: 'https://i.ibb.co/hJxMvfr1/image.png'
  },
  {
    id: 's19',
    name: 'B. சாபி அகமது',
    name_en: 'B. Safi Ahmed',
    role: 'மாநில செய்தி தொடர்பாளர்',
    role_en: 'State News Correspondent',
    district: 'சென்னை',
    district_en: 'Chennai',
    level: 'state',
    imageUrl: 'https://i.ibb.co/v48Y7FHN/image.png'
  },
  {
    id: 's20',
    name: 'பாரதி தங்கராஜ்',
    name_en: 'Bharathi Thangaraj',
    role: 'மாநில அமைப்புச் செயலாளர்',
    role_en: 'State Organizing Secretary',
    district: 'திருவண்ணாமலை',
    district_en: 'Tiruvannamalai',
    level: 'state',
    imageUrl: 'https://i.ibb.co/k253cs9C/image.png'
  },
  {
    id: 's21',
    name: 'V. பத்மினி',
    name_en: 'V. Padmini',
    role: 'மாநில மகளிர் அணி துணைச் செயலாளர்',
    role_en: 'State Women Wing Joint Secretary',
    district: 'சென்னை',
    district_en: 'Chennai',
    level: 'state',
    imageUrl: 'https://i.ibb.co/dsB8kjkb/image.png'
  },

  // --- DISTRICT LEVEL ---
  {
    id: 'd1',
    name: 'V.R. பிரபு',
    name_en: 'V.R. Prabhu',
    role: 'மாவட்ட தலைவர்',
    role_en: 'District President',
    district: 'மதுரை',
    district_en: 'Madurai',
    level: 'district',
    imageUrl: 'https://i.ibb.co/39257CGk/image.png'
  },
  {
    id: 'd2',
    name: 'கனகவேல்',
    name_en: 'Kanagavel',
    role: 'மாவட்ட செயலாளர்',
    role_en: 'District Secretary',
    district: 'மதுரை',
    district_en: 'Madurai',
    level: 'district',
    imageUrl: 'https://i.ibb.co/fdKJ0LS1/image.png'
  },
  {
    id: 'd3',
    name: 'N. பாபு',
    name_en: 'N. Babu',
    role: 'மாவட்ட தலைவர்',
    role_en: 'District President',
    district: 'சிவகங்கை',
    district_en: 'Sivagangai',
    level: 'district',
    imageUrl: 'https://i.ibb.co/k61dnkJQ/image.png'
  },
  {
    id: 'd4',
    name: 'C.R. பிரபாகரன்',
    name_en: 'C.R. Prabakaran',
    role: 'மாவட்ட செயலாளர்',
    role_en: 'District Secretary',
    district: 'சிவகங்கை',
    district_en: 'Sivagangai',
    level: 'district',
    imageUrl: 'https://i.ibb.co/FL8rsXzH/image.png'
  },
  {
    id: 'd5',
    name: 'M.A. திருமலைவெங்கட்ராமன்',
    name_en: 'M.A. Thirumalaivenkatraman',
    role: 'மாவட்ட தலைவர்',
    role_en: 'District President',
    district: 'தேனி',
    district_en: 'Theni',
    level: 'district',
    imageUrl: 'https://i.ibb.co/BHfmmxvh/image.png'
  },
  {
    id: 'd6',
    name: 'K. சிவக்குமார்',
    name_en: 'K. Sivakumar',
    role: 'மாவட்ட செயலாளர்',
    role_en: 'District Secretary',
    district: 'தேனி',
    district_en: 'Theni',
    level: 'district',
    imageUrl: 'https://i.ibb.co/F1kYkth/image.png'
  },
  {
    id: 'd7',
    name: 'இளங்கோ',
    name_en: 'Elangovan',
    role: 'மாவட்ட தலைவர்',
    role_en: 'District President',
    district: 'திண்டுக்கல்',
    district_en: 'Dindigul',
    level: 'district',
    imageUrl: 'https://i.ibb.co/YBvV0PDD/image.png'
  },
  {
    id: 'd8',
    name: 'தியாகு',
    name_en: 'Thyagu',
    role: 'மாவட்ட செயலாளர்',
    role_en: 'District Secretary',
    district: 'திண்டுக்கல்',
    district_en: 'Dindigul',
    level: 'district',
    imageUrl: 'https://i.ibb.co/DP7tYTrb/image.png'
  },
  {
    id: 'd9',
    name: 'R. கோபால கிருஷ்ணன்',
    name_en: 'R. Gopala Krishnan',
    role: 'மாவட்ட தலைவர்',
    role_en: 'District President',
    district: 'விருதுநகர்',
    district_en: 'Virudhunagar',
    level: 'district',
    imageUrl: 'https://i.ibb.co/bjrHyW5k/image.png'
  },
  {
    id: 'd10',
    name: 'C. யாக்கோப்',
    name_en: 'C. Yakub',
    role: 'மாவட்ட செயலாளர்',
    role_en: 'District Secretary',
    district: 'விருதுநகர்',
    district_en: 'Virudhunagar',
    level: 'district',
    imageUrl: 'https://i.ibb.co/JwbrF0JS/image.png'
  },
  {
    id: 'd11',
    name: 'பிரபாகரன்',
    name_en: 'Prabakaran',
    role: 'மாவட்ட செயலாளர்',
    role_en: 'District Secretary',
    district: 'தூத்துக்குடி',
    district_en: 'Thoothukudi',
    level: 'district',
    imageUrl: 'https://i.ibb.co/jZ6fkg89/image.png'
  },
  {
    id: 'd12',
    name: 'கிருஷ்ணன்',
    name_en: 'Krishnan',
    role: 'மாவட்ட செயலாளர்',
    role_en: 'District Secretary',
    district: 'தென்காசி',
    district_en: 'Tenkasi',
    level: 'district',
    imageUrl: 'https://i.ibb.co/PvLxyw62/image.png'
  },
  {
    id: 'd13',
    name: 'கண்ணன்',
    name_en: 'Kannan',
    role: 'மாவட்ட தலைவர்',
    role_en: 'District President',
    district: 'கன்னியாகுமரி',
    district_en: 'Kanyakumari',
    level: 'district',
    imageUrl: 'https://i.ibb.co/k2F73KNx/image.png'
  },
  {
    id: 'd14',
    name: 'கோபு',
    name_en: 'Gopu',
    role: 'மாவட்ட செயலாளர்',
    role_en: 'District Secretary',
    district: 'கன்னியாகுமரி',
    district_en: 'Kanyakumari',
    level: 'district',
    imageUrl: 'https://i.ibb.co/zVYfMdk8/image.png'
  },
  {
    id: 'd15',
    name: 'M. மகாமூனி',
    name_en: 'M. Magamuni',
    role: 'மாவட்ட செயலாளர்',
    role_en: 'District Secretary',
    district: 'திருச்சி',
    district_en: 'Trichy',
    level: 'district',
    imageUrl: 'https://i.ibb.co/Q39drxfn/image.png'
  },
  {
    id: 'd16',
    name: 'N. செந்தில் வேல்',
    name_en: 'N. Senthil Vel',
    role: 'மாவட்ட செயலாளர்',
    role_en: 'District Secretary',
    district: 'திருச்சி',
    district_en: 'Trichy',
    level: 'district',
    imageUrl: 'https://i.ibb.co/Fq4x3MwH/image.png'
  },
  {
    id: 'd17',
    name: 'P. மாரிமுத்து',
    name_en: 'P. Marimuthu',
    role: 'மாவட்ட தலைவர்',
    role_en: 'District President',
    district: 'தஞ்சாவூர்',
    district_en: 'Thanjavur',
    level: 'district',
    imageUrl: 'https://i.ibb.co/1tqtKJw1/image.png'
  },
  {
    id: 'd18',
    name: 'பழனி',
    name_en: 'Palani',
    role: 'மாவட்ட செயலாளர்',
    role_en: 'District Secretary',
    district: 'தஞ்சாவூர்',
    district_en: 'Thanjavur',
    level: 'district',
    imageUrl: 'https://i.ibb.co/GvRgdjKM/image.png'
  },
  {
    id: 'd19',
    name: 'L. லோகுசந்திரா',
    name_en: 'L. Logachandira',
    role: 'மாவட்ட தலைவர்',
    role_en: 'District President',
    district: 'சேலம்',
    district_en: 'Salem',
    level: 'district',
    imageUrl: 'https://i.ibb.co/BKdY3SNg/image.png'
  },
  {
    id: 'd20',
    name: 'P. காந்தி',
    name_en: 'P. Gandhi',
    role: 'மாவட்ட செயலாளர்',
    role_en: 'District Secretary',
    district: 'சேலம்',
    district_en: 'Salem',
    level: 'district',
    imageUrl: 'https://i.ibb.co/FbrbVnSL/image.png'
  },
  {
    id: 'd21',
    name: 'சண்முகம்',
    name_en: 'Shanmugam',
    role: 'மாவட்ட தலைவர்',
    role_en: 'District President',
    district: 'திருப்பூர்',
    district_en: 'Tiruppur',
    level: 'district',
    imageUrl: 'https://i.ibb.co/TDyggCNw/image.png'
  },
  {
    id: 'd22',
    name: 'பாண்டி',
    name_en: 'Pandi',
    role: 'மாவட்ட செயலாளர்',
    role_en: 'District Secretary',
    district: 'திருப்பூர்',
    district_en: 'Tiruppur',
    level: 'district',
    imageUrl: 'https://i.ibb.co/xK5trJMd/image.png'
  },
  {
    id: 'd35',
    name: 'ரவி கிருஷ்ணா',
    name_en: 'Ravi Krishna',
    role: 'மாவட்ட தலைவர்',
    role_en: 'District President',
    district: 'திருப்பூர்',
    district_en: 'Tiruppur',
    level: 'district',
    imageUrl: 'https://i.ibb.co/pjQwRHsZ/image.png'
  },
  {
    id: 'd36',
    name: 'சுரேஷ்குமார்',
    name_en: 'Sureshkumar',
    role: 'மாவட்ட தலைவர்',
    role_en: 'District President',
    district: 'திருப்பூர்',
    district_en: 'Tiruppur',
    level: 'district',
    imageUrl: 'https://i.ibb.co/YFXHQV7B/image.png'
  },
  {
    id: 'd23',
    name: 'சங்கர்',
    name_en: 'Sankar',
    role: 'மாவட்ட தலைவர்',
    role_en: 'District President',
    district: 'நாமக்கல்',
    district_en: 'Namakkal',
    level: 'district',
    imageUrl: 'https://i.ibb.co/kVCBYv69/image.png'
  },
  {
    id: 'd24',
    name: 'செந்தில்',
    name_en: 'Senthil',
    role: 'மாவட்ட செயலாளர்',
    role_en: 'District Secretary',
    district: 'நாமக்கல்',
    district_en: 'Namakkal',
    level: 'district',
    imageUrl: 'https://i.ibb.co/b0VJywk/image.png'
  },
  {
    id: 'd25',
    name: 'அம்மாசி',
    name_en: 'Ammasi',
    role: 'மாவட்ட தலைவர்',
    role_en: 'District President',
    district: 'தருமபுரி',
    district_en: 'Dharmapuri',
    level: 'district',
    imageUrl: 'https://i.ibb.co/yFpc8vmL/image.png'
  },
  {
    id: 'd26',
    name: 'ஆனந்தராஜ்',
    name_en: 'Anandharaj',
    role: 'மாவட்ட செயலாளர்',
    role_en: 'District Secretary',
    district: 'தருமபுரி',
    district_en: 'Dharmapuri',
    level: 'district',
    imageUrl: 'https://i.ibb.co/8DDKCrH4/image.png'
  },
  {
    id: 'd27',
    name: 'ரமேஷ்',
    name_en: 'Ramesh',
    role: 'மாவட்ட தலைவர்',
    role_en: 'District President',
    district: 'திருவண்ணாமலை',
    district_en: 'Tiruvannamalai',
    level: 'district',
    imageUrl: 'https://i.ibb.co/fG8sKyMP/image.png'
  },
  {
    id: 'd28',
    name: 'நாராயணமூர்த்தி',
    name_en: 'Narayanamoorthi',
    role: 'மாவட்ட செயலாளர்',
    role_en: 'District Secretary',
    district: 'ராணிப்பேட்டை',
    district_en: 'Ranipet',
    level: 'district',
    imageUrl: 'https://i.ibb.co/QvCTbszX/image.png'
  },
  {
    id: 'd29',
    name: 'B. ராஜவேலு',
    name_en: 'B. Rajavelu',
    role: 'மாவட்ட தலைவர்',
    role_en: 'District President',
    district: 'விழுப்புரம்',
    district_en: 'Villupuram',
    level: 'district',
    imageUrl: 'https://i.ibb.co/TDKsdyn4/image.png'
  },
  {
    id: 'd30',
    name: 'அஷ்ரப் அலி',
    name_en: 'Ashraf Ali',
    role: 'மாவட்ட செயலாளர்',
    role_en: 'District Secretary',
    district: 'விழுப்புரம்',
    district_en: 'Villupuram',
    level: 'district',
    imageUrl: 'https://i.ibb.co/7NKnSsmP/image.png'
  },
  {
    id: 'd31',
    name: 'ரமேஷ்',
    name_en: 'Ramesh',
    role: 'மாவட்ட தலைவர்',
    role_en: 'District President',
    district: 'சென்னை',
    district_en: 'Chennai',
    level: 'district',
    imageUrl: 'https://i.ibb.co/RT4hDW9Q/image.png'
  },
  {
    id: 'd32',
    name: 'B. ரஞ்சித்குமார்',
    name_en: 'B. Ranjithkumar',
    role: 'மாவட்ட செயலாளர்',
    role_en: 'District Secretary',
    district: 'சென்னை',
    district_en: 'Chennai',
    level: 'district',
    imageUrl: 'https://i.ibb.co/tPc4bXf2/image.png'
  },
  {
    id: 'd33',
    name: 'மோகன்ராஜ்',
    name_en: 'Mohanraj',
    role: 'மாவட்ட தலைவர்',
    role_en: 'District President',
    district: 'திருவள்ளூர்',
    district_en: 'Tiruvallur',
    level: 'district',
    imageUrl: 'https://i.ibb.co/v46gZ3Ky/image.png'
  },
  {
    id: 'd34',
    name: 'தீபக் சக்ரவர்த்தி',
    name_en: 'Deepak Chakravarthi',
    role: 'மாவட்ட செயலாளர்',
    role_en: 'District Secretary',
    district: 'திருவள்ளூர்',
    district_en: 'Tiruvallur',
    level: 'district',
    imageUrl: 'https://i.ibb.co/nq0ZD7Mt/image.png'
  }
];

export const MEDIA_ITEMS: MediaItem[] = [
  {
    "id": "m1",
    "title": "தேசிய உரிமைகள் களம் துவக்க விழா-30.10.2021",
    "title_en": "National Rights Forum Inauguration Ceremony-30.10.2021",
    "type": "photo",
    "url": "https://i.ibb.co/W4c0sJX8/image.png",
    "thumbnailUrl": "https://i.ibb.co/W4c0sJX8/image.png",
    "tag": "விழா",
    "tag_en": "Ceremony"
  },
  {
    "id": "m2",
    "title": "தேசிய உரிமைகள் களம் துவக்க விழா-30.10.2021",
    "title_en": "National Rights Forum Inauguration Ceremony-30.10.2021",
    "type": "photo",
    "url": "https://i.ibb.co/1JvT3KfT/image.png",
    "thumbnailUrl": "https://i.ibb.co/1JvT3KfT/image.png",
    "tag": "விழா",
    "tag_en": "Ceremony"
  },
  {
    "id": "m3",
    "title": "தேசிய உரிமைகள் களம் துவக்க விழா-30.10.2021",
    "title_en": "National Rights Forum Inauguration Ceremony-30.10.2021",
    "type": "photo",
    "url": "https://i.ibb.co/JFBX3xrp/image.png",
    "thumbnailUrl": "https://i.ibb.co/JFBX3xrp/image.png",
    "tag": "விழா",
    "tag_en": "Ceremony"
  },
  {
    "id": "m4",
    "title": "நிர்வாக குழு மற்றும் கொடி வெளியீட்டு விழா",
    "title_en": "Executive Committee and Flag Hoisting Ceremony",
    "type": "photo",
    "url": "https://i.ibb.co/TDgVqwQQ/image.png",
    "thumbnailUrl": "https://i.ibb.co/TDgVqwQQ/image.png",
    "tag": "விழா",
    "tag_en": "Ceremony"
  },
  {
    "id": "m5",
    "title": "நிர்வாக குழு மற்றும் கொடி வெளியீட்டு விழா",
    "title_en": "Executive Committee and Flag Hoisting Ceremony",
    "type": "photo",
    "url": "https://i.ibb.co/mFgR3RnB/image.png",
    "thumbnailUrl": "https://i.ibb.co/mFgR3RnB/image.png",
    "tag": "விழா",
    "tag_en": "Ceremony"
  },
  {
    "id": "m6",
    "title": "பத்திரிக்கை செய்தி",
    "title_en": "Press Release",
    "type": "photo",
    "url": "https://i.ibb.co/LhtvLrhb/image.png",
    "thumbnailUrl": "https://i.ibb.co/LhtvLrhb/image.png",
    "tag": "செய்தி",
    "tag_en": "News"
  },
  {
    "id": "m7",
    "title": "பத்திரிக்கை செய்தி",
    "title_en": "Press Release",
    "type": "photo",
    "url": "https://i.ibb.co/S432X0gp/image.png",
    "thumbnailUrl": "https://i.ibb.co/S432X0gp/image.png",
    "tag": "செய்தி",
    "tag_en": "News"
  },
  {
    "id": "m8",
    "title": "பத்திரிக்கை செய்தி",
    "title_en": "Press Release",
    "type": "photo",
    "url": "https://i.ibb.co/0jZcY7vn/image.png",
    "thumbnailUrl": "https://i.ibb.co/0jZcY7vn/image.png",
    "tag": "செய்தி",
    "tag_en": "News"
  },
  {
    "id": "m9",
    "title": "பத்திரிக்கை செய்தி",
    "title_en": "Press Release",
    "type": "photo",
    "url": "https://i.ibb.co/J9gXNgh/image.png",
    "thumbnailUrl": "https://i.ibb.co/J9gXNgh/image.png",
    "tag": "செய்தி",
    "tag_en": "News"
  },
  {
    "id": "m10",
    "title": "மகளிர் அணி கலந்தாய்வு கூட்டம்",
    "title_en": "Women's Wing Consultation Meeting",
    "type": "photo",
    "url": "https://i.ibb.co/V0Yc94zX/image.png",
    "thumbnailUrl": "https://i.ibb.co/V0Yc94zX/image.png",
    "tag": "கூட்டம்",
    "tag_en": "Meeting"
  },
  {
    "id": "m11",
    "title": "மகளிர் அணி கலந்தாய்வு கூட்டம்",
    "title_en": "Women's Wing Consultation Meeting",
    "type": "photo",
    "url": "https://i.ibb.co/YTwSH3d2/image.png",
    "thumbnailUrl": "https://i.ibb.co/YTwSH3d2/image.png",
    "tag": "கூட்டம்",
    "tag_en": "Meeting"
  },
  {
    "id": "m12",
    "title": "மாநில நிர்வாகிகள் கலந்தாய்வு கூட்டம்",
    "title_en": "State Executives Consultation Meeting",
    "type": "photo",
    "url": "https://i.ibb.co/vG6W3B5/image.png",
    "thumbnailUrl": "https://i.ibb.co/vG6W3B5/image.png",
    "tag": "கூட்டம்",
    "tag_en": "Meeting"
  },
  {
    "id": "m13",
    "title": "மாநில நிர்வாகிகள் கலந்தாய்வு கூட்டம்",
    "title_en": "State Executives Consultation Meeting",
    "type": "photo",
    "url": "https://i.ibb.co/4RVnmzxK/image.png",
    "thumbnailUrl": "https://i.ibb.co/4RVnmzxK/image.png",
    "tag": "கூட்டம்",
    "tag_en": "Meeting"
  },
  {
    "id": "m14",
    "title": "காந்தி ஜெயந்தி விழாவில் முதியோர் இல்லத்தில் அன்னதானம்",
    "title_en": "Food Donation at Old Age Home on Gandhi Jayanti",
    "type": "photo",
    "url": "https://i.ibb.co/CKNp5g8Q/image.png",
    "thumbnailUrl": "https://i.ibb.co/CKNp5g8Q/image.png",
    "tag": "மக்கள் பணி",
    "tag_en": "Public Service"
  },
  {
    "id": "m15",
    "title": "காந்தி ஜெயந்தி விழாவில் முதியோர் இல்லத்தில் அன்னதானம்",
    "title_en": "Food Donation at Old Age Home on Gandhi Jayanti",
    "type": "photo",
    "url": "https://i.ibb.co/B5N2f89J/image.png",
    "thumbnailUrl": "https://i.ibb.co/B5N2f89J/image.png",
    "tag": "மக்கள் பணி",
    "tag_en": "Public Service"
  },
  {
    "id": "m16",
    "title": "சிறந்த சேவைக்கான களம்-விருது வழங்கும் விழா",
    "title_en": "Forum for Best Service - Award Ceremony",
    "type": "photo",
    "url": "https://i.ibb.co/NdpQwSgc/image.png",
    "thumbnailUrl": "https://i.ibb.co/NdpQwSgc/image.png",
    "tag": "விருது",
    "tag_en": "Award"
  },
  {
    "id": "m17",
    "title": "சிறந்த சேவைக்கான களம்-விருது வழங்கும் விழா",
    "title_en": "Forum for Best Service - Award Ceremony",
    "type": "photo",
    "url": "https://i.ibb.co/hJT3p9PS/image.png",
    "thumbnailUrl": "https://i.ibb.co/hJT3p9PS/image.png",
    "tag": "விருது",
    "tag_en": "Award"
  },
  {
    "id": "m18",
    "title": "சிறந்த சேவைக்கான களம்-விருது வழங்கும் விழா",
    "title_en": "Forum for Best Service - Award Ceremony",
    "type": "photo",
    "url": "https://i.ibb.co/nszVKYVj/image.png",
    "thumbnailUrl": "https://i.ibb.co/nszVKYVj/image.png",
    "tag": "விருது",
    "tag_en": "Award"
  },
  {
    "id": "m19",
    "title": "சிறந்த சேவைக்கான களம்-விருது வழங்கும் விழா",
    "title_en": "Forum for Best Service - Award Ceremony",
    "type": "photo",
    "url": "https://i.ibb.co/bfDpDZw/image.png",
    "thumbnailUrl": "https://i.ibb.co/bfDpDZw/image.png",
    "tag": "விருது",
    "tag_en": "Award"
  },
  {
    "id": "m20",
    "title": "சிறந்த சேவைக்கான களம்-விருது வழங்கும் விழா",
    "title_en": "Forum for Best Service - Award Ceremony",
    "type": "photo",
    "url": "https://i.ibb.co/v6qNF8Dx/image.png",
    "thumbnailUrl": "https://i.ibb.co/v6qNF8Dx/image.png",
    "tag": "விருது",
    "tag_en": "Award"
  },
  {
    "id": "m21",
    "title": "கோவில் திருவிழாவில் மக்கள் பணி",
    "title_en": "Public Service at Temple Festival",
    "type": "photo",
    "url": "https://i.ibb.co/tpzpnXMd/image.png",
    "thumbnailUrl": "https://i.ibb.co/tpzpnXMd/image.png",
    "tag": "மக்கள் பணி",
    "tag_en": "Public Service"
  },
  {
    "id": "m22",
    "title": "மாவட்ட செயலாளர்கள் கூட்டம்",
    "title_en": "District Secretaries Meeting",
    "type": "photo",
    "url": "https://i.ibb.co/8DVXLrJd/image.png",
    "thumbnailUrl": "https://i.ibb.co/8DVXLrJd/image.png",
    "tag": "கூட்டம்",
    "tag_en": "Meeting"
  },
  {
    "id": "m23",
    "title": "மாவட்ட செயலாளர்கள் கூட்டம்",
    "title_en": "District Secretaries Meeting",
    "type": "photo",
    "url": "https://i.ibb.co/gLbF5dXc/image.png",
    "thumbnailUrl": "https://i.ibb.co/gLbF5dXc/image.png",
    "tag": "கூட்டம்",
    "tag_en": "Meeting"
  },
  {
    "id": "m24",
    "title": "மாவட்ட செயலாளர்கள் கூட்டம்",
    "title_en": "District Secretaries Meeting",
    "type": "photo",
    "url": "https://i.ibb.co/QFvmQkvR/image.png",
    "thumbnailUrl": "https://i.ibb.co/QFvmQkvR/image.png",
    "tag": "கூட்டம்",
    "tag_en": "Meeting"
  },
  {
    "id": "m25",
    "title": "அனைத்து நிர்வாகிகள் கலந்தாய்வு கூட்டம்",
    "title_en": "All Executives Consultation Meeting",
    "type": "photo",
    "url": "https://i.ibb.co/HfBRD28p/image.png",
    "thumbnailUrl": "https://i.ibb.co/HfBRD28p/image.png",
    "tag": "கூட்டம்",
    "tag_en": "Meeting"
  },
  {
    "id": "m26",
    "title": "அனைத்து நிர்வாகிகள் கலந்தாய்வு கூட்டம்",
    "title_en": "All Executives Consultation Meeting",
    "type": "photo",
    "url": "https://i.ibb.co/xSmV2kdD/image.png",
    "thumbnailUrl": "https://i.ibb.co/xSmV2kdD/image.png",
    "tag": "கூட்டம்",
    "tag_en": "Meeting"
  },
  {
    "id": "m27",
    "title": "அனைத்து நிர்வாகிகள் கலந்தாய்வு கூட்டம்",
    "title_en": "All Executives Consultation Meeting",
    "type": "photo",
    "url": "https://i.ibb.co/845P2QtT/image.png",
    "thumbnailUrl": "https://i.ibb.co/845P2QtT/image.png",
    "tag": "கூட்டம்",
    "tag_en": "Meeting"
  },
  {
    "id": "m28",
    "title": "மக்கள் பணி",
    "title_en": "Public Service",
    "type": "photo",
    "url": "https://i.ibb.co/ccvbV69h/image.png",
    "thumbnailUrl": "https://i.ibb.co/ccvbV69h/image.png",
    "tag": "மக்கள் பணி",
    "tag_en": "Public Service"
  },
  {
    "id": "m29",
    "title": "மக்கள் பணி",
    "title_en": "Public Service",
    "type": "photo",
    "url": "https://i.ibb.co/B2nG8Z4N/image.png",
    "thumbnailUrl": "https://i.ibb.co/B2nG8Z4N/image.png",
    "tag": "மக்கள் பணி",
    "tag_en": "Public Service"
  },
  {
    "id": "m30",
    "title": "மக்கள் பணி",
    "title_en": "Public Service",
    "type": "photo",
    "url": "https://i.ibb.co/spH8CLrK/image.png",
    "thumbnailUrl": "https://i.ibb.co/spH8CLrK/image.png",
    "tag": "மக்கள் பணி",
    "tag_en": "Public Service"
  },
  {
    "id": "m31",
    "title": "மக்கள் பணி",
    "title_en": "Public Service",
    "type": "photo",
    "url": "https://i.ibb.co/wZYBWp1d/image.png",
    "thumbnailUrl": "https://i.ibb.co/wZYBWp1d/image.png",
    "tag": "மக்கள் பணி",
    "tag_en": "Public Service"
  },
  {
    "id": "m32",
    "title": "மக்கள் பணி",
    "title_en": "Public Service",
    "type": "photo",
    "url": "https://i.ibb.co/pvXSprLY/image.png",
    "thumbnailUrl": "https://i.ibb.co/pvXSprLY/image.png",
    "tag": "மக்கள் பணி",
    "tag_en": "Public Service"
  },
  {
    "id": "m33",
    "title": "மக்கள் பணி",
    "title_en": "Public Service",
    "type": "photo",
    "url": "https://i.ibb.co/TDBCGnv6/image.png",
    "thumbnailUrl": "https://i.ibb.co/TDBCGnv6/image.png",
    "tag": "மக்கள் பணி",
    "tag_en": "Public Service"
  },
  {
    "id": "m34",
    "title": "மக்கள் பணி",
    "title_en": "Public Service",
    "type": "photo",
    "url": "https://i.ibb.co/Lh5p4g3Z/image.png",
    "thumbnailUrl": "https://i.ibb.co/Lh5p4g3Z/image.png",
    "tag": "மக்கள் பணி",
    "tag_en": "Public Service"
  },
  {
    "id": "m35",
    "title": "மக்கள் பணி",
    "title_en": "Public Service",
    "type": "photo",
    "url": "https://i.ibb.co/fzfx5RnY/image.png",
    "thumbnailUrl": "https://i.ibb.co/fzfx5RnY/image.png",
    "tag": "மக்கள் பணி",
    "tag_en": "Public Service"
  },
  {
    "id": "m36",
    "title": "போதையேற்ற சமூகத்தை நோக்கி இளைஞர் அணி எழுச்சி மாநாடு",
    "title_en": "Youth Wing Uprising Conference towards an Intoxication-Free Society",
    "type": "photo",
    "url": "https://i.ibb.co/JRnkjGVJ/image.png",
    "thumbnailUrl": "https://i.ibb.co/JRnkjGVJ/image.png",
    "tag": "மாநாடு",
    "tag_en": "Conference"
  },
  {
    "id": "m37",
    "title": "போதையேற்ற சமூகத்தை நோக்கி இளைஞர் அணி எழுச்சி மாநாடு",
    "title_en": "Youth Wing Uprising Conference towards an Intoxication-Free Society",
    "type": "photo",
    "url": "https://i.ibb.co/b5rrZ6sM/image.png",
    "thumbnailUrl": "https://i.ibb.co/b5rrZ6sM/image.png",
    "tag": "மாநாடு",
    "tag_en": "Conference"
  },
  {
    "id": "m38",
    "title": "போதையேற்ற சமூகத்தை நோக்கி இளைஞர் அணி எழுச்சி மாநாடு",
    "title_en": "Youth Wing Uprising Conference towards an Intoxication-Free Society",
    "type": "photo",
    "url": "https://i.ibb.co/HfWnYpJL/image.png",
    "thumbnailUrl": "https://i.ibb.co/HfWnYpJL/image.png",
    "tag": "மாநாடு",
    "tag_en": "Conference"
  },
  {
    "id": "m39",
    "title": "போதையேற்ற சமூகத்தை நோக்கி இளைஞர் அணி எழுச்சி மாநாடு",
    "title_en": "Youth Wing Uprising Conference towards an Intoxication-Free Society",
    "type": "photo",
    "url": "https://i.ibb.co/Rpdzj33n/image.png",
    "thumbnailUrl": "https://i.ibb.co/Rpdzj33n/image.png",
    "tag": "மாநாடு",
    "tag_en": "Conference"
  },
  {
    "id": "m40",
    "title": "போதையேற்ற சமூகத்தை நோக்கி இளைஞர் அணி எழுச்சி மாநாடு",
    "title_en": "Youth Wing Uprising Conference towards an Intoxication-Free Society",
    "type": "photo",
    "url": "https://i.ibb.co/0pjYYwJ6/image.png",
    "thumbnailUrl": "https://i.ibb.co/0pjYYwJ6/image.png",
    "tag": "மாநாடு",
    "tag_en": "Conference"
  },
  {
    "id": "m41",
    "title": "போதையேற்ற சமூகத்தை நோக்கி இளைஞர் அணி எழுச்சி மாநாடு",
    "title_en": "Youth Wing Uprising Conference towards an Intoxication-Free Society",
    "type": "photo",
    "url": "https://i.ibb.co/YB9Xp2MC/image.png",
    "thumbnailUrl": "https://i.ibb.co/YB9Xp2MC/image.png",
    "tag": "மாநாடு",
    "tag_en": "Conference"
  },
  {
    "id": "m42",
    "title": "போதையேற்ற சமூகத்தை நோக்கி இளைஞர் அணி எழுச்சி மாநாடு",
    "title_en": "Youth Wing Uprising Conference towards an Intoxication-Free Society",
    "type": "photo",
    "url": "https://i.ibb.co/vCw1QP14/image.png",
    "thumbnailUrl": "https://i.ibb.co/vCw1QP14/image.png",
    "tag": "மாநாடு",
    "tag_en": "Conference"
  },
  {
    "id": "m43",
    "title": "போதையேற்ற சமூகத்தை நோக்கி இளைஞர் அணி எழுச்சி மாநாடு",
    "title_en": "Youth Wing Uprising Conference towards an Intoxication-Free Society",
    "type": "photo",
    "url": "https://i.ibb.co/ccKvJLdp/image.png",
    "thumbnailUrl": "https://i.ibb.co/ccKvJLdp/image.png",
    "tag": "மாநாடு",
    "tag_en": "Conference"
  },
  {
    "id": "m44",
    "title": "போதையேற்ற சமூகத்தை நோக்கி இளைஞர் அணி எழுச்சி மாநாடு",
    "title_en": "Youth Wing Uprising Conference towards an Intoxication-Free Society",
    "type": "photo",
    "url": "https://i.ibb.co/gZsCDRSN/image.png",
    "thumbnailUrl": "https://i.ibb.co/gZsCDRSN/image.png",
    "tag": "மாநாடு",
    "tag_en": "Conference"
  },
  {
    "id": "m45",
    "title": "போதையேற்ற சமூகத்தை நோக்கி இளைஞர் அணி எழுச்சி மாநாடு",
    "title_en": "Youth Wing Uprising Conference towards an Intoxication-Free Society",
    "type": "photo",
    "url": "https://i.ibb.co/HLBtQnZv/image.png",
    "thumbnailUrl": "https://i.ibb.co/HLBtQnZv/image.png",
    "tag": "மாநாடு",
    "tag_en": "Conference"
  }
]
;

export const DISTRICTS: string[] = [
  'சென்னை (Chennai)',
  'மதுரை (Madurai)',
  'சிவகங்கை (Sivagangai)',
  'தேனி (Theni)',
  'திண்டுக்கல் (Dindigul)',
  'விருதுநகர் (Virudhunagar)',
  'தூத்துக்குடி (Thoothukudi)',
  'தென்காசி (Tenkasi)',
  'கன்னியாகுமரி (Kanyakumari)',
  'திருச்சி (Trichy)',
  'தஞ்சாவூர் (Thanjavur)',
  'சேலம் (Salem)',
  'திருப்பூர் (Tiruppur)',
  'நாமக்கல் (Namakkal)',
  'தருமபுரி (Dharmapuri)',
  'திருவண்ணாமலை (Tiruvannamalai)',
  'திருவள்ளூர் (Tiruvallur)',
  'காஞ்சிபுரம் (Kanchipuram)',
  'புதுக்கோட்டை (Pudukkottai)',
  'கோயம்புத்தூர் (Coimbatore)'
];

export const getStoredOfficers = (): Officer[] => {
  if (typeof window === 'undefined') return OFFICERS;
  const stored = localStorage.getItem('tuk_officers');
  if (!stored) {
    localStorage.setItem('tuk_officers', JSON.stringify(OFFICERS));
    return OFFICERS;
  }
  try {
    const list: Officer[] = JSON.parse(stored);
    
    // Sync pre-seeded static officers using our fresh OFFICERS list from data.ts
    const mergedList = list.map(item => {
      const staticItem = OFFICERS.find(o => o.id === item.id);
      if (staticItem) {
        return {
          ...item,
          name: staticItem.name,
          name_en: staticItem.name_en,
          role: staticItem.role,
          role_en: staticItem.role_en,
          district: staticItem.district,
          district_en: staticItem.district_en,
          level: staticItem.level,
          phone: staticItem.phone !== undefined ? staticItem.phone : item.phone,
          imageUrl: staticItem.imageUrl !== undefined ? staticItem.imageUrl : item.imageUrl
        };
      }
      return item;
    });

    // Make sure we also add any static officers that aren't in the list
    OFFICERS.forEach(staticItem => {
      if (!mergedList.some(o => o.id === staticItem.id)) {
        mergedList.push(staticItem);
      }
    });

    return mergedList;
  } catch (e) {
    return OFFICERS;
  }
};

export const saveStoredOfficers = (officers: Officer[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tuk_officers', JSON.stringify(officers));
    window.dispatchEvent(new Event('officers_updated'));
  }
};

