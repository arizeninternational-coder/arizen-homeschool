// OwlTeacher — Polished SVG mascot for Arizen School lesson journey
// A friendly, warm, intelligent owl guide character
// Stored as a reusable React component for easy replacement later

interface OwlTeacherProps {
  size?: number;
  className?: string;
  expression?: 'happy' | 'thinking' | 'encouraging' | 'celebrating';
}

export default function OwlTeacher({ size = 96, className = '', expression = 'happy' }: OwlTeacherProps) {
  // Eye style varies by expression
  const eyeStyle = {
    happy: { leftEye: '◕', rightEye: '◕', eyeScale: 1 },
    thinking: { leftEye: '◔', rightEye: '◕', eyeScale: 0.95 },
    encouraging: { leftEye: '◕', rightEye: '◕', eyeScale: 1.05 },
    celebrating: { leftEye: '★', rightEye: '★', eyeScale: 1.1 },
  }[expression];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Owl Teacher"
    >
      <defs>
        {/* Body gradient — warm golden-brown */}
        <radialGradient id="owlBody" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#D4A574" />
          <stop offset="40%" stopColor="#C4956A" />
          <stop offset="100%" stopColor="#A67B5B" />
        </radialGradient>
        {/* Belly gradient — soft cream */}
        <radialGradient id="owlBelly" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF8F0" />
          <stop offset="100%" stopColor="#F5E6D3" />
        </radialGradient>
        {/* Eye ring gradient */}
        <radialGradient id="owlEyeRing" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF8F0" />
          <stop offset="100%" stopColor="#E8D5C0" />
        </radialGradient>
        {/* Beak gradient */}
        <linearGradient id="owlBeak" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFB347" />
          <stop offset="100%" stopColor="#FF8C00" />
        </linearGradient>
        {/* Wing gradient */}
        <linearGradient id="owlWing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B8860B" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
        {/* Hat gradient — scholar cap */}
        <linearGradient id="owlHat" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#3730A3" />
        </linearGradient>
        {/* Glow filter */}
        <filter id="owlGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Soft shadow */}
        <filter id="owlShadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#00000020" />
        </filter>
      </defs>

      {/* Background circle — soft warm glow */}
      <circle cx="60" cy="60" r="58" fill="url(#owlBody)" opacity="0.15" />

      {/* Left ear tuft */}
      <path d="M28 35 Q22 18 35 22 Q38 28 32 38Z" fill="url(#owlBody)" filter="url(#owlShadow)" />
      {/* Right ear tuft */}
      <path d="M92 35 Q98 18 85 22 Q82 28 88 38Z" fill="url(#owlBody)" filter="url(#owlShadow)" />

      {/* Scholar cap / graduation hat */}
      <ellipse cx="60" cy="28" rx="32" ry="8" fill="url(#owlHat)" />
      <rect x="55" y="18" width="10" height="12" rx="2" fill="url(#owlHat)" />
      {/* Cap tassel */}
      <line x1="70" y1="20" x2="82" y2="14" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <circle cx="83" cy="13" r="3" fill="#F59E0B" />

      {/* Head — main body */}
      <ellipse cx="60" cy="55" rx="30" ry="28" fill="url(#owlBody)" filter="url(#owlShadow)" />

      {/* Belly patch */}
      <ellipse cx="60" cy="65" rx="18" ry="20" fill="url(#owlBelly)" />

      {/* Eye rings — large, friendly */}
      <circle cx="48" cy="48" r="14" fill="url(#owlEyeRing)" stroke="#D4A574" strokeWidth="1.5" />
      <circle cx="72" cy="48" r="14" fill="url(#owlEyeRing)" stroke="#D4A574" strokeWidth="1.5" />

      {/* Eyes — expressive */}
      <circle cx="48" cy="48" r="8" fill="#2D1B0E" />
      <circle cx="72" cy="48" r="8" fill="#2D1B0E" />

      {/* Eye highlights — gives life */}
      <circle cx="50" cy="45" r="3" fill="white" opacity="0.9" />
      <circle cx="74" cy="45" r="3" fill="white" opacity="0.9" />
      <circle cx="46" cy="50" r="1.5" fill="white" opacity="0.5" />
      <circle cx="70" cy="50" r="1.5" fill="white" opacity="0.5" />

      {/* Beak — small, friendly triangle */}
      <path d="M55 58 L60 66 L65 58 Z" fill="url(#owlBeak)" />

      {/* Wings */}
      <path d="M28 55 Q18 65 22 78 Q28 72 32 65Z" fill="url(#owlWing)" filter="url(#owlShadow)" />
      <path d="M92 55 Q102 65 98 78 Q92 72 88 65Z" fill="url(#owlWing)" filter="url(#owlShadow)" />

      {/* Feet / talons */}
      <path d="M48 82 L44 90 L48 88 L52 90Z" fill="#A67B5B" />
      <path d="M72 82 L68 90 L72 88 L76 90Z" fill="#A67B5B" />

      {/* Belly feather pattern — subtle V shapes */}
      <path d="M55 60 L60 68 L65 60" stroke="#E8D5C0" strokeWidth="1" fill="none" opacity="0.6" />
      <path d="M52 66 L60 74 L68 66" stroke="#E8D5C0" strokeWidth="1" fill="none" opacity="0.4" />

      {/* Rosy cheeks */}
      <circle cx="40" cy="55" r="5" fill="#FFB5A7" opacity="0.3" />
      <circle cx="80" cy="55" r="5" fill="#FFB5A7" opacity="0.3" />

      {/* Expression-specific elements */}
      {expression === 'thinking' && (
        <g>
          <circle cx="85" cy="30" r="2" fill="#4F46E5" opacity="0.6" />
          <circle cx="90" cy="24" r="1.5" fill="#4F46E5" opacity="0.4" />
          <circle cx="93" cy="18" r="1" fill="#4F46E5" opacity="0.3" />
        </g>
      )}
      {expression === 'celebrating' && (
        <g>
          <text x="30" y="25" fontSize="10" fill="#F59E0B">✦</text>
          <text x="80" y="22" fontSize="8" fill="#EC4899">✦</text>
          <text x="55" y="15" fontSize="7" fill="#4F46E5">✦</text>
        </g>
      )}
    </svg>
  );
}
