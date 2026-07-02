const wings = [
  { id: 'youth', name: 'இளைஞர் அணி', name_en: 'Youth Wing', icon: 'User', description: 'இளைஞர்களின் ஆற்றலை நற்பணிகளுக்குப் பயன்படுத்துதல்.', description_en: 'Channeling youth energy into community development.' },
  { id: 'fishermen', name: 'மீனவர் அணி', name_en: 'Fishermen Wing', icon: 'Anchor', description: 'மீனவ மக்களின் வாழ்வாதார உரிமைகளைப் பாதுகாத்தல்.', description_en: 'Protecting livelihood rights of fishermen.' },
  { id: 'spiritual', name: 'ஆன்மீக அணி', name_en: 'Spiritual Wing', icon: 'Flower2', description: 'ஆன்மீக விழிப்புணர்வு மற்றும் நல்லிணக்கத்தை உருவாக்குதல்.', description_en: 'Creating spiritual awareness and harmony.' },
  { id: 'minority', name: 'சிறுபான்மையினர் அணி', name_en: 'Minority Wing', icon: 'Users', description: 'சிறுபான்மையினரின் உரிமைகளைப் பாதுகாத்தல்.', description_en: 'Protecting the rights of minorities.' },
  { id: 'transgender', name: 'திருநங்கை அணி', name_en: 'Transgender Wing', icon: 'Rainbow', description: 'திருநங்கைகளின் சம உரிமை மற்றும் நல்வாழ்வு.', description_en: 'Equal rights and well-being for transgenders.' },
  { id: 'govt_employees', name: 'அரசு ஊழியர் பிரிவு', name_en: 'Government Employees Wing', icon: 'Briefcase', description: 'அரசு ஊழியர்களின் நலன்களை காத்தல்.', description_en: 'Safeguarding the welfare of government employees.' },
  { id: 'women', name: 'மகளிர் அணி', name_en: "Women's Wing", icon: 'Heart', description: 'பெண்களின் உரிமைகளைப் பாதுகாத்தல்.', description_en: 'Sustaining womanhood rights and development.' },
  { id: 'traders', name: 'வர்த்தகர் அணி', name_en: 'Traders / Merchant Wing', icon: 'Store', description: 'வியாபாரிகளின் வணிக உரிமைகளைப் பாதுகாத்தல்.', description_en: 'Safeguarding commercial rights of traders.' },
  { id: 'lawyers', name: 'வழக்கறிஞர் அணி', name_en: 'Advocates / Lawyers Wing', icon: 'Scale', description: 'இலவச சட்ட ஆலோசனைகள் மற்றும் சட்டரீதியான உரிமை மீட்பு.', description_en: 'Pro-bono legal counsel and right protection.' },
  { id: 'literary', name: 'இலக்கிய அணி', name_en: 'Literary Wing', icon: 'Book', description: 'இலக்கிய வளர்ச்சி மற்றும் தாய்மொழிப் பற்று.', description_en: 'Literary development and linguistic devotion.' },
  { id: 'cultural', name: 'கலாச்சார பிரிவு', name_en: 'Cultural Wing', icon: 'Music', description: 'நமது கலாச்சார விழுமியங்களைப் போற்றுதல்.', description_en: 'Preserving and celebrating our cultural values.' },
  { id: 'private_employees', name: 'தனியார் ஊழியர் பிரிவு', name_en: 'Private Employees Wing', icon: 'Building2', description: 'தனியார் துறை ஊழியர்களின் உரிமைகளைப் பாதுகாத்தல்.', description_en: 'Protecting the rights of private sector employees.' },
  { id: 'students', name: 'மாணவர் அணி', name_en: 'Students Wing', icon: 'BookOpen', description: 'மாணவர்களின் கல்வி மற்றும் முன்னேற்றம்.', description_en: 'Securing student advancement and education.' },
  { id: 'volunteers', name: 'தொண்டர் அணி', name_en: 'Volunteers / Cadres Wing', icon: 'Globe', description: 'சமூகத் தொண்டு மற்றும் பேரிடர் மீட்புப் பணிகள்.', description_en: 'Social service and disaster relief work.' },
  { id: 'doctors', name: 'மருத்துவர் அணி', name_en: 'Doctors Wing', icon: 'Stethoscope', description: 'இலவச மருத்துவ உதவிகள் மற்றும் விழிப்புணர்வு.', description_en: 'Free medical assistance and health awareness.' },
  { id: 'farmers', name: 'விவசாயி அணி', name_en: 'Farmers Wing', icon: 'Sprout', description: 'உழவர்களின் உரிமைகளைக் காப்பது.', description_en: 'Defending agricultural rights and development.' },
  { id: 'engineers', name: 'பொறியாளர் பிரிவு', name_en: 'Engineers Wing', icon: 'HardHat', description: 'தொழில்நுட்ப மேம்பாட்டு ஆலோசனைகள்.', description_en: 'Technical expertise for developmental advisory.' },
  { id: 'it_wing', name: 'தகவல் தொழில்நுட்ப அணி', name_en: 'IT Wing', icon: 'Monitor', description: 'டிஜிட்டல் விழிப்புணர்வு மற்றும் நல்வழிப்படுத்தல்.', description_en: 'Leading digital literacy and support.' }
];

const fs = require('fs');
const content = fs.readFileSync('src/data.ts', 'utf8');

const regex = /export const WINGS: Wing\[\] = \[[\s\S]*?\n\];/;
const replacement = `export const WINGS: Wing[] = ${JSON.stringify(wings, null, 2)};`;

fs.writeFileSync('src/data.ts', content.replace(regex, replacement));
console.log('done');
