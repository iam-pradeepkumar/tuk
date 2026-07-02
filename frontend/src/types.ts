export interface Leader {
  id: string;
  name: string;
  name_en: string;
  title: string;
  title_en: string;
  quote: string;
  quote_en: string;
  imageUrl: string;
  bio?: string;
  bio_en?: string;
}

export interface Officer {
  id: string;
  name: string;
  name_en: string;
  role: string;
  role_en: string;
  district: string;
  district_en: string;
  level: 'state' | 'district' | 'constituency' | 'union' | 'branch' | 'ward' | 'wing';
  phone?: string;
  email?: string;
  imageUrl?: string;
  wingId?: string;
  constituency?: string;
  constituency_en?: string;
  union?: string;
  union_en?: string;
  branch?: string;
  branch_en?: string;
  ward?: string;
  ward_en?: string;
}

export interface HistoryItem {
  id: string;
  officer: Officer;
  type: 'added' | 'removed';
  timestamp: string;
  restored?: boolean;
}

export interface Wing {
  id: string;
  name: string;
  name_en: string;
  icon: string;
  description: string;
  description_en: string;
}

export interface MediaItem {
  id: string;
  title: string;
  title_en: string;
  type: 'photo' | 'video';
  url: string;
  thumbnailUrl: string;
  tag: string;
  tag_en: string;
}

export interface MemberApplication {
  name: string;
  phone: string;
  age: number;
  district: string;
  wingId: string;
  constituency: string;
  union: string;
  photo?: string;
  date?: string;
  cardId?: string;
  validUntil?: string;
  validUntilTimestamp?: number;
  dob?: string;
  bloodGroup?: string;
  memberId?: string;
}

export interface ContactMessage {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
}
