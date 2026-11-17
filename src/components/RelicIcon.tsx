import { RelicItem } from '../types/game';

interface RelicArtworkIconProps {
  iconType: RelicItem['iconType'];
  className?: string;
}

/**
 * Crisp illustrated SVG icon matching each of the 18 historical South Sumatra relics.
 */
export function RelicArtworkIcon({ iconType, className = 'w-8 h-8' }: RelicArtworkIconProps) {
  switch (iconType) {
    case 'songket':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <rect x="8" y="8" width="32" height="30" rx="4" fill="#B92727" stroke="#261C15" strokeWidth="2.5" />
          <path d="M12 14 L24 22 L36 14 M12 24 L24 32 L36 24" fill="none" stroke="#F6C343" strokeWidth="2.5" />
          <polygon points="24,11 28,16 24,21 20,16" fill="#FDE047" />
          <polygon points="24,23 28,28 24,33 20,28" fill="#FDE047" />
          <path d="M11 38 V43 M16 38 V43 M21 38 V43 M27 38 V43 M32 38 V43 M37 38 V43" stroke="#F5B942" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case 'statue':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <ellipse cx="24" cy="40" rx="14" ry="4" fill="#8C8376" stroke="#261C15" strokeWidth="2" />
          <path d="M14 38 C14 27 18 23 24 23 C30 23 34 27 34 38 Z" fill="#B8AEA0" stroke="#261C15" strokeWidth="2.2" />
          <circle cx="24" cy="17" r="6.5" fill="#C9BFB0" stroke="#261C15" strokeWidth="2.2" />
          <polygon points="24,4 28,11 20,11" fill="#E8B944" stroke="#261C15" strokeWidth="1.8" />
          <path d="M16 30 Q24 34 32 30" fill="none" stroke="#E8B944" strokeWidth="2" />
        </svg>
      );
    case 'coin':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <circle cx="24" cy="24" r="17" fill="#D9A338" stroke="#261C15" strokeWidth="2.5" />
          <circle cx="24" cy="24" r="13" fill="none" stroke="#FEF08A" strokeWidth="2" strokeDasharray="3 2" />
          <rect x="19" y="19" width="10" height="10" rx="1" fill="#261C15" stroke="#FEF08A" strokeWidth="1.5" />
        </svg>
      );
    case 'cannon':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <path d="M10 22 L38 14 L40 20 L12 30 Z" fill="#C9922A" stroke="#261C15" strokeWidth="2.2" />
          <rect x="13" y="28" width="18" height="7" rx="2" fill="#7D4927" stroke="#261C15" strokeWidth="2" />
          <circle cx="19" cy="36" r="6" fill="#9E6234" stroke="#261C15" strokeWidth="2.2" />
          <circle cx="19" cy="36" r="2" fill="#F5B942" />
        </svg>
      );
    case 'key':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <circle cx="15" cy="24" r="8.5" fill="#6E7780" stroke="#261C15" strokeWidth="2.5" />
          <circle cx="15" cy="24" r="3.5" fill="#FAF5EB" stroke="#261C15" strokeWidth="1.8" />
          <rect x="22" y="21.5" width="19" height="5" rx="2" fill="#7C858F" stroke="#261C15" strokeWidth="2.2" />
          <path d="M33 26.5 V34 H37 V26.5 M38 26.5 V32 H41 V26.5" fill="#7C858F" stroke="#261C15" strokeWidth="2" />
        </svg>
      );
    case 'stone':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <polygon points="10,34 14,17 26,11 38,19 36,36 18,38" fill="#EFE8DA" stroke="#261C15" strokeWidth="2.5" />
          <path d="M14 17 L24 23 L38 19 M24 23 L22 37" fill="none" stroke="#B7AD9B" strokeWidth="2" />
          <circle cx="30" cy="27" r="2.2" fill="#82B954" />
        </svg>
      );
    case 'compass':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <circle cx="24" cy="10" r="3.5" fill="none" stroke="#261C15" strokeWidth="2.5" />
          <circle cx="24" cy="27" r="14.5" fill="#E6AE35" stroke="#261C15" strokeWidth="2.5" />
          <circle cx="24" cy="27" r="11" fill="#FAF5EB" stroke="#261C15" strokeWidth="1.5" />
          <polygon points="24,17 27,27 24,25 21,27" fill="#D93829" />
          <polygon points="24,37 27,27 24,29 21,27" fill="#0E5A5C" />
        </svg>
      );
    case 'boat':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <path d="M7 29 Q24 38 41 29 L36 37 H12 Z" fill="#8E542B" stroke="#261C15" strokeWidth="2.2" />
          <rect x="15" y="19" width="18" height="10" rx="2" fill="#178580" stroke="#261C15" strokeWidth="2" />
          <rect x="13" y="15" width="22" height="5" rx="2" fill="#F5B942" stroke="#261C15" strokeWidth="2" />
        </svg>
      );
    case 'badge':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <path d="M17 31 L14 43 L24 39 L34 43 L31 31 Z" fill="#0E5A5C" stroke="#261C15" strokeWidth="2" />
          <circle cx="24" cy="21" r="13.5" fill="#F5B942" stroke="#261C15" strokeWidth="2.5" />
          <rect x="17" y="14" width="4" height="13" fill="#D93829" stroke="#261C15" strokeWidth="1.3" />
          <rect x="27" y="14" width="4" height="13" fill="#D93829" stroke="#261C15" strokeWidth="1.3" />
          <rect x="14" y="23" width="20" height="3.5" fill="#D93829" stroke="#261C15" strokeWidth="1.3" />
        </svg>
      );
    case 'jar':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <rect x="18" y="8" width="12" height="5" rx="2" fill="#F5B942" stroke="#261C15" strokeWidth="2" />
          <path d="M17 13 C10 18 10 34 17 40 H31 C38 34 38 18 31 13 Z" fill="#1E9690" stroke="#261C15" strokeWidth="2.5" />
          <path d="M16 24 Q24 28 32 24" fill="none" stroke="#FDE047" strokeWidth="2.2" />
        </svg>
      );
    case 'lantern':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <line x1="24" y1="6" x2="24" y2="11" stroke="#261C15" strokeWidth="2.5" />
          <ellipse cx="24" cy="23" rx="12" ry="11" fill="#DF382D" stroke="#261C15" strokeWidth="2.5" />
          <rect x="18" y="10" width="12" height="4" rx="1" fill="#F5B942" stroke="#261C15" strokeWidth="2" />
          <rect x="18" y="33" width="12" height="4" rx="1" fill="#F5B942" stroke="#261C15" strokeWidth="2" />
          <path d="M21 37 V43 M24 37 V44 M27 37 V43" stroke="#E0382D" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case 'tablet':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <path d="M13 38 V17 A11 11 0 0 1 35 17 V38 Z" fill="#C9BEB0" stroke="#261C15" strokeWidth="2.5" />
          <rect x="10" y="36" width="28" height="6" rx="1.5" fill="#92887A" stroke="#261C15" strokeWidth="2" />
          <path d="M24 22 C20 17 17 20 24 27 C31 20 28 17 24 22 Z" fill="#E04438" stroke="#261C15" strokeWidth="1.5" />
          <line x1="18" y1="31" x2="30" y2="31" stroke="#5E554B" strokeWidth="2" />
        </svg>
      );
    case 'lacquer':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <rect x="9" y="10" width="30" height="28" rx="3" fill="#B82925" stroke="#261C15" strokeWidth="2.5" />
          <rect x="13" y="14" width="22" height="20" rx="2" fill="none" stroke="#F6C343" strokeWidth="2" />
          <circle cx="24" cy="24" r="6" fill="#F6C343" stroke="#261C15" strokeWidth="1.6" />
          <circle cx="24" cy="24" r="2.2" fill="#B82925" />
        </svg>
      );
    case 'wood':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <path d="M9 28 L27 14 L39 20 L21 35 Z" fill="#7D4927" stroke="#261C15" strokeWidth="2.3" />
          <path d="M9 28 V34 L21 40 L39 26 V20" fill="#5D3319" stroke="#261C15" strokeWidth="2.3" />
          <circle cx="25" cy="24" r="3" fill="#D59A5B" stroke="#261C15" strokeWidth="1.4" />
        </svg>
      );
    case 'spire':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <rect x="14" y="34" width="20" height="6" rx="2" fill="#7D4927" stroke="#261C15" strokeWidth="2" />
          <path d="M18 34 Q10 20 15 10 Q18 22 24 27 Q30 22 33 10 Q38 20 30 34 Z" fill="#F5B942" stroke="#261C15" strokeWidth="2.3" />
          <polygon points="24,8 27,20 21,20" fill="#E34234" stroke="#261C15" strokeWidth="1.8" />
        </svg>
      );
    case 'inscription':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <path d="M12 37 L15 13 Q24 7 33 13 L36 37 Z" fill="#8C867E" stroke="#261C15" strokeWidth="2.5" />
          <rect x="9" y="36" width="30" height="6" rx="1.5" fill="#635D56" stroke="#261C15" strokeWidth="2" />
          <path d="M18 19 H30 M17 24 H31 M18 29 H29" stroke="#F5D372" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case 'brick':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <polygon points="8,24 24,14 40,22 24,32" fill="#D4693E" stroke="#261C15" strokeWidth="2.3" />
          <polygon points="8,24 24,32 24,40 8,32" fill="#B24E2A" stroke="#261C15" strokeWidth="2.3" />
          <polygon points="24,32 40,22 40,30 24,40" fill="#8E3B1D" stroke="#261C15" strokeWidth="2.3" />
          <circle cx="24" cy="23" r="3" fill="none" stroke="#F6C343" strokeWidth="1.8" />
        </svg>
      );
    case 'ship':
    default:
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <path d="M7 31 Q24 41 41 30 L36 38 H12 Z" fill="#8B4F27" stroke="#261C15" strokeWidth="2.3" />
          <line x1="24" y1="9" x2="24" y2="32" stroke="#261C15" strokeWidth="2.5" />
          <polygon points="24,10 38,24 24,27" fill="#FAF0D7" stroke="#261C15" strokeWidth="2" />
          <polygon points="24,13 13,25 24,27" fill="#F5B942" stroke="#261C15" strokeWidth="2" />
        </svg>
      );
  }
}

interface LocationBadgeEmblemProps {
  badgeId: string;
  earned: boolean;
  className?: string;
}

/**
 * Custom heritage SVG emblems for the 6 Adventurer Location Badges (Lencana Petualang).
 */
export function LocationBadgeEmblem({
  badgeId,
  earned,
  className = 'w-11 h-11',
}: LocationBadgeEmblemProps) {
  const bg = !earned
    ? '#8E867C'
    : badgeId === 'badge-benteng'
      ? '#B93829'
      : badgeId === 'badge-museum'
        ? '#D4941E'
        : badgeId === 'badge-ampera'
          ? '#C84B31'
          : badgeId === 'badge-kemaro'
            ? '#0E5A5C'
            : badgeId === 'badge-limas'
              ? '#8B5A2B'
              : '#1E6B52';

  return (
    <svg viewBox="0 0 48 48" className={`${className} shrink-0`} aria-hidden="true">
      <circle cx="24" cy="24" r="21" fill={bg} stroke={earned ? '#F5B942' : '#5F5951'} strokeWidth="3" />
      {!earned ? (
        <g>
          <rect x="17" y="22" width="14" height="11" rx="2" fill="#DDD6CA" stroke="#261C15" strokeWidth="1.8" />
          <path d="M19 22 V18 A5 5 0 0 1 29 18 V22" fill="none" stroke="#DDD6CA" strokeWidth="2.5" />
        </g>
      ) : badgeId === 'badge-benteng' ? (
        <path d="M12 33 V20 H17 V24 H21 V18 H27 V24 H31 V20 H36 V33 Z" fill="#FAF5EB" stroke="#261C15" strokeWidth="1.8" />
      ) : badgeId === 'badge-museum' ? (
        <g>
          <polygon points="24,11 33,24 24,37 15,24" fill="#FDE047" stroke="#261C15" strokeWidth="1.8" />
          <circle cx="24" cy="24" r="4" fill="#B93829" />
        </g>
      ) : badgeId === 'badge-ampera' ? (
        <g>
          <rect x="15" y="13" width="5" height="20" fill="#FAF5EB" stroke="#261C15" strokeWidth="1.6" />
          <rect x="28" y="13" width="5" height="20" fill="#FAF5EB" stroke="#261C15" strokeWidth="1.6" />
          <rect x="11" y="27" width="26" height="4" fill="#F5B942" stroke="#261C15" strokeWidth="1.4" />
        </g>
      ) : badgeId === 'badge-kemaro' ? (
        <polygon points="24,10 34,34 14,34" fill="#FDE047" stroke="#261C15" strokeWidth="1.8" />
      ) : badgeId === 'badge-limas' ? (
        <g>
          <polygon points="24,13 36,24 12,24" fill="#F5B942" stroke="#261C15" strokeWidth="1.8" />
          <rect x="16" y="24" width="16" height="10" fill="#FAF5EB" stroke="#261C15" strokeWidth="1.6" />
        </g>
      ) : (
        <g>
          <path d="M13 31 Q24 38 35 31 L32 35 H16 Z" fill="#F5B942" stroke="#261C15" strokeWidth="1.6" />
          <polygon points="24,11 34,27 24,28" fill="#FAF5EB" stroke="#261C15" strokeWidth="1.6" />
        </g>
      )}
    </svg>
  );
}
