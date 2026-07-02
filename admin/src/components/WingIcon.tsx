import React from 'react';
import {
  GraduationCap,
  Heart,
  BookOpen,
  Scale,
  Megaphone,
  HeartHandshake,
  Compass,
  Sprout,
  Stethoscope,
  Shield,
  PenTool,
  Leaf,
  Landmark,
  Palette,
  Settings,
  Building2,
  Briefcase,
  Monitor,
  LucideProps
} from 'lucide-react';

interface WingIconProps extends Omit<LucideProps, 'ref'> {
  name: string;
  className?: string;
  color?: string;
  style?: React.CSSProperties;
}

export default function WingIcon({ name, ...props }: WingIconProps) {
  switch (name) {
    case 'GraduationCap':
      return <GraduationCap {...props} />;
    case 'Heart':
      return <Heart {...props} />;
    case 'BookOpen':
      return <BookOpen {...props} />;
    case 'Scale':
      return <Scale {...props} />;
    case 'Megaphone':
      return <Megaphone {...props} />;
    case 'HeartHandshake':
      return <HeartHandshake {...props} />;
    case 'Compass':
      return <Compass {...props} />;
    case 'Sprout':
      return <Sprout {...props} />;
    case 'Stethoscope':
      return <Stethoscope {...props} />;
    case 'Shield':
      return <Shield {...props} />;
    case 'PenTool':
      return <PenTool {...props} />;
    case 'Leaf':
      return <Leaf {...props} />;
    case 'Landmark':
      return <Landmark {...props} />;
    case 'Palette':
      return <Palette {...props} />;
    case 'Settings':
      return <Settings {...props} />;
    case 'Building2':
      return <Building2 {...props} />;
    case 'Briefcase':
      return <Briefcase {...props} />;
    case 'Monitor':
      return <Monitor {...props} />;
    default:
      return <Shield {...props} />;
  }
}
