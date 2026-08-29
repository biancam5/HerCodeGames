 import React from 'react';
import { PetType } from '../../types';

interface PetAvatarProps {
  type: PetType;
  mood?: 'happy' | 'hungry' | 'sleeping' | 'celebrating' | 'bathing' | 'playing' | 'eating' | 'thinking' | 'idle' | 'confused';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  isAnimated?: boolean;
}

export const PetAvatar: React.FC<PetAvatarProps> = ({
  type,
  mood = 'happy',
  size = 'md',
  className = '',
  isAnimated = true,
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-44 h-44',
    '2xl': 'w-56 h-56',
  };

  const getAnimationClass = () => {
    if (!isAnimated) return '';
    switch (mood) {
      case 'celebrating':
        return 'animate-bounce drop-shadow-md';
      case 'sleeping':
        return 'animate-gentle-breathe';
      case 'eating':
        return 'animate-munch-nom';
      case 'playing':
        return 'animate-gentle-float';
      case 'happy':
        return 'animate-gentle-float';
      case 'confused':
        return 'animate-wobble rotate-6';
      default:
        return 'animate-gentle-breathe hover:scale-108 transition-all duration-300 hover:drop-shadow-lg';
    }
  };

  const isCuteOrHappy = mood === 'happy' || mood === 'celebrating';

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${sizeClasses[size]} ${getAnimationClass()} ${className}`}
    >
      {type === 'cat' && <GingerCatSVG mood={mood} />}
      {type === 'dog' && <DalmatianDogSVG mood={mood} />}
      {type === 'hamster' && <HamsterSVG mood={mood} />}
      {type === 'turtle' && <TurtleSVG mood={mood} />}
      {type === 'bunny' && <BunnySVG mood={mood} />}

      {/* Floating Animated Hearts around Pet in "Cute" / Happy mode */}
      {isCuteOrHappy && (
        <>
          <span
            className="absolute -top-2 -left-2 text-sm sm:text-base select-none pointer-events-none animate-float-heart-left"
            title="Cute Heart"
          >
            💖
          </span>
          <span
            className="absolute -top-2.5 -right-2.5 text-xs sm:text-sm select-none pointer-events-none animate-float-heart-right"
            title="Sparkling Heart"
          >
            💕
          </span>
          <span
            className="absolute -bottom-1 -right-2 text-xs sm:text-sm select-none pointer-events-none animate-float-heart-bottom"
            title="Pink Heart"
          >
            💗
          </span>
        </>
      )}

      {/* Puzzled question mark indicator for confused mode */}
      {mood === 'confused' && (
        <span className="absolute -top-3 right-0 text-base sm:text-lg select-none pointer-events-none animate-bounce font-black text-amber-500 bg-white/90 px-1.5 py-0.5 rounded-full border border-amber-300 shadow-sm">
          ❓
        </span>
      )}

      {/* Smooth floating Zzz indicator for sleeping */}
      {mood === 'sleeping' && (
        <span className="absolute -top-2 -right-2 text-sm sm:text-base select-none pointer-events-none animate-float-zzz">
          💤
        </span>
      )}
    </div>
  );
};

/* =========================================================================
   1. GINGER CAT (LUNA)
   Shy, introvert, smart!
   - Natural large donut bed (cucha)
   - Realistic neck & fitted leather collar with metallic ring & heart charm
   ========================================================================= */
const GingerCatSVG: React.FC<{ mood: string }> = ({ mood }) => {
  const isSleeping = mood === 'sleeping';
  const isHappy = mood === 'happy' || mood === 'celebrating';
  const isEating = mood === 'eating';

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full drop-shadow-md select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="catGingerGrad" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id="catEarInner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="100%" stopColor="#F43F5E" />
        </linearGradient>
        <radialGradient id="catEyeGlint" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="60%" stopColor="#059669" />
          <stop offset="100%" stopColor="#064E3B" />
        </radialGradient>
        <linearGradient id="catBedOuter" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DDD6FE" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <linearGradient id="catBedInner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FAF5FF" />
          <stop offset="100%" stopColor="#EDE9FE" />
        </linearGradient>
      </defs>

      {/* SLEEPING MODE: Spacious Plush Natural Donut Cat Bed / Cucha (Back Rim) */}
      {isSleeping && (
        <g>
          {/* Outer large plush cushion rim */}
          <ellipse cx="50" cy="72" rx="47" ry="23" fill="url(#catBedOuter)" stroke="#7C3AED" strokeWidth="1.5" />
          {/* Soft quilted donut interior pillow */}
          <ellipse cx="50" cy="75" rx="39" ry="17" fill="url(#catBedInner)" stroke="#C4B5FD" strokeWidth="1.2" />
          {/* Soft stitching indentations */}
          <path d="M22 68 Q50 78 78 68" stroke="#DDD6FE" strokeWidth="1" strokeDasharray="3 2" fill="none" />
        </g>
      )}

      {/* Tail: Animated tail sway when active, curled tail when sleeping */}
      {!isSleeping ? (
        <g className="animate-tail-sway">
          <path
            d="M74 68 C88 64, 96 46, 88 36 C82 28, 76 34, 78 42 C82 52, 78 62, 70 68 Z"
            fill="url(#catGingerGrad)"
            stroke="#C2410C"
            strokeWidth="1.5"
          />
          <path d="M86 36 C84 40, 80 43, 82 46" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M82 48 C80 52, 76 55, 78 58" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      ) : (
        /* Curled tail safely tucked inside the big bed */
        <path
          d="M72 75 C84 72, 88 62, 80 56 C74 52, 70 58, 73 66 Z"
          fill="url(#catGingerGrad)"
          stroke="#C2410C"
          strokeWidth="1.2"
        />
      )}

      {/* Pointy Ears */}
      <polygon points="24,42 12,12 42,26" fill="url(#catGingerGrad)" stroke="#C2410C" strokeWidth="1.5" />
      <polygon points="25,38 18,18 38,28" fill="url(#catEarInner)" />
      <polygon points="76,42 88,12 58,26" fill="url(#catGingerGrad)" stroke="#C2410C" strokeWidth="1.5" />
      <polygon points="75,38 82,18 62,28" fill="url(#catEarInner)" />

      {/* Cat Torso Body */}
      <ellipse cx="50" cy="71" rx="29" ry="23" fill="url(#catGingerGrad)" stroke="#C2410C" strokeWidth="1.5" />

      {/* Realistic Anatomy Neck */}
      <path d="M37 46 L35 63 L65 63 L63 46 Z" fill="url(#catGingerGrad)" stroke="#C2410C" strokeWidth="1.2" />

      {/* Cream Belly Bib */}
      <ellipse cx="50" cy="73" rx="18" ry="15" fill="#FFF7ED" />

      {/* Cat Head */}
      <circle cx="50" cy="45" r="26" fill="url(#catGingerGrad)" stroke="#C2410C" strokeWidth="1.5" />
      {/* Cream Muzzle */}
      <ellipse cx="50" cy="53" rx="18" ry="12" fill="#FFF7ED" />

      {/* Tabby Forehead Stripes */}
      <path d="M42 25 L46 33 L50 27 L54 33 L58 25" stroke="#9A3412" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M34 31 L40 36" stroke="#9A3412" strokeWidth="2" strokeLinecap="round" />
      <path d="M66 31 L60 36" stroke="#9A3412" strokeWidth="2" strokeLinecap="round" />

      {/* Rosy Cheeks */}
      <ellipse cx="32" cy="52" rx="4.8" ry="3" fill="#FB7185" opacity="0.65" />
      <ellipse cx="68" cy="52" rx="4.8" ry="3" fill="#FB7185" opacity="0.65" />

      {/* Eyes */}
      {isSleeping ? (
        <>
          <path d="M32 44 Q39 51 46 44" stroke="#431407" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          <path d="M54 44 Q61 51 68 44" stroke="#431407" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        </>
      ) : isHappy || isEating ? (
        <>
          <path d="M32 46 Q39 39 46 46" stroke="#431407" strokeWidth="3.2" strokeLinecap="round" fill="none" />
          <path d="M54 46 Q61 39 68 46" stroke="#431407" strokeWidth="3.2" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <circle cx="38" cy="44" r="5" fill="url(#catEyeGlint)" stroke="#064E3B" strokeWidth="1" />
          <circle cx="40" cy="42" r="2" fill="#FFFFFF" />
          <circle cx="37" cy="45" r="0.8" fill="#FFFFFF" />
          <circle cx="62" cy="44" r="5" fill="url(#catEyeGlint)" stroke="#064E3B" strokeWidth="1" />
          <circle cx="64" cy="42" r="2" fill="#FFFFFF" />
          <circle cx="61" cy="45" r="0.8" fill="#FFFFFF" />
        </>
      )}

      {/* Pink Nose */}
      <polygon points="48,50 52,50 50,54" fill="#F43F5E" />

      {/* Mouth with Little Fangs */}
      {isEating ? (
        <ellipse cx="50" cy="57" rx="3.5" ry="2.5" fill="#BE123C" />
      ) : isSleeping ? (
        <path d="M46 54 Q50 58 54 54" stroke="#7C2D12" strokeWidth="2" strokeLinecap="round" fill="none" />
      ) : (
        <g>
          {/* Cat mouth curve */}
          <path d="M44 53 Q47 56 50 54 Q53 56 56 53" stroke="#7C2D12" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          {/* Little cute vampire-like cat fangs peeking out */}
          <polygon points="45.5,54 47.5,54 46.5,57" fill="#FFFFFF" stroke="#7C2D12" strokeWidth="0.4" />
          <polygon points="52.5,54 54.5,54 53.5,57" fill="#FFFFFF" stroke="#7C2D12" strokeWidth="0.4" />
        </g>
      )}

      {/* Whiskers: Black and closer to the face */}
      <line x1="33" y1="52" x2="16" y2="50" stroke="#1E293B" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="33" y1="56" x2="18" y2="58" stroke="#1E293B" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="67" y1="52" x2="84" y2="50" stroke="#1E293B" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="67" y1="56" x2="82" y2="58" stroke="#1E293B" strokeWidth="1.4" strokeLinecap="round" />

      {/* REALISTIC FITTED LEATHER COLLAR ON NECK */}
      <g>
        {/* Leather collar band with natural curvature across neck */}
        <path
          d="M36 62 Q50 65 64 62 L63 67 Q50 70 37 67 Z"
          fill="#7C3AED"
          stroke="#5B21B6"
          strokeWidth="1.1"
        />
        {/* Stitched edge detail */}
        <path d="M37 63.5 Q50 66.5 63 63.5" stroke="#DDD6FE" strokeWidth="0.6" strokeDasharray="1.5 1" fill="none" />
        {/* Golden metal buckle loop */}
        <rect x="42" y="62" width="4.5" height="5.5" rx="1" fill="#FBBF24" stroke="#B45309" strokeWidth="0.6" />
        {/* Hanging metallic jump ring */}
        <circle cx="50" cy="68" r="1.4" fill="none" stroke="#FBBF24" strokeWidth="0.8" />
        {/* Heart-shaped ID tag charm */}
        <path
          d="M48 69.5 C48 68, 50 68, 50 69.5 C50 68, 52 68, 52 69.5 C52 71.5, 50 73.5, 50 73.5 C50 73.5, 48 71.5, 48 69.5 Z"
          fill="#F43F5E"
          stroke="#BE123C"
          strokeWidth="0.7"
        />
      </g>

      {/* EATING MODE: Paws Holding a Whole Cute Blue Fish 🐟 */}
      {isEating ? (
        <g>
          {/* Whole blue fish */}
          <path
            d="M32 68 C38 61, 58 61, 66 68 C58 75, 38 75, 32 68 Z"
            fill="#38BDF8"
            stroke="#0284C7"
            strokeWidth="1.2"
          />
          <polygon points="32,68 24,62 26,68 24,74" fill="#0284C7" />
          <circle cx="60" cy="67" r="1.8" fill="#0F172A" />
          <circle cx="60.5" cy="66.5" r="0.7" fill="#FFFFFF" />
          <path d="M44 65 Q46 68 44 71" stroke="#0284C7" strokeWidth="0.8" fill="none" />
          <path d="M50 65 Q52 68 50 71" stroke="#0284C7" strokeWidth="0.8" fill="none" />

          {/* Paws holding fish */}
          <ellipse cx="38" cy="71" rx="5" ry="4" fill="#FFF7ED" stroke="#C2410C" strokeWidth="1.2" />
          <ellipse cx="58" cy="71" rx="5" ry="4" fill="#FFF7ED" stroke="#C2410C" strokeWidth="1.2" />
        </g>
      ) : isSleeping ? (
        /* Front outer bolster of cat bed */
        <path
          d="M3 75 C10 95, 90 95, 97 75 C88 91, 12 91, 3 75 Z"
          fill="url(#catBedOuter)"
          stroke="#7C3AED"
          strokeWidth="1.5"
        />
      ) : (
        /* Normal Resting Paws */
        <>
          <ellipse cx="38" cy="85" rx="7" ry="5" fill="#FFF7ED" stroke="#C2410C" strokeWidth="1.2" />
          <ellipse cx="62" cy="85" rx="7" ry="5" fill="#FFF7ED" stroke="#C2410C" strokeWidth="1.2" />
        </>
      )}
    </svg>
  );
};

/* =========================================================================
   2. DALMATIAN DOG (MANCHU)
   Extrovert, energetic puppy!
   - Realistic neck & structured rectangular red leather collar with buckle & bone charm
   - Large plush puppy bed (cucha)
   ========================================================================= */
const DalmatianDogSVG: React.FC<{ mood: string }> = ({ mood }) => {
  const isSleeping = mood === 'sleeping';
  const isHappy = mood === 'happy' || mood === 'celebrating';
  const isEating = mood === 'eating';

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full drop-shadow-md select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="dogEyeGlint" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="70%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0C4A6E" />
        </radialGradient>
        <linearGradient id="dogBedOuter" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="100%" stopColor="#F43F5E" />
        </linearGradient>
        <linearGradient id="dogBedInner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF1F2" />
          <stop offset="100%" stopColor="#FFE4E6" />
        </linearGradient>
      </defs>

      {/* SLEEPING MODE: Spacious Natural Dog Basket / Cucha (Back Rim) */}
      {isSleeping && (
        <g>
          {/* Back rim of comfy puppy basket */}
          <ellipse cx="50" cy="72" rx="47" ry="23" fill="url(#dogBedOuter)" stroke="#BE123C" strokeWidth="1.5" />
          {/* Soft white fleece sleeping pillow */}
          <ellipse cx="50" cy="75" rx="39" ry="17" fill="url(#dogBedInner)" stroke="#FDA4AF" strokeWidth="1.2" />
        </g>
      )}

      {/* Wagging Spotted Tail */}
      {!isSleeping ? (
        <g className="animate-dog-wag">
          <path
            d="M74 66 C88 62, 94 48, 86 38 C80 32, 76 38, 78 44 C82 52, 78 60, 70 66 Z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1.5"
          />
          <circle cx="84" cy="42" r="2.5" fill="#0F172A" />
          <circle cx="80" cy="52" r="2" fill="#0F172A" />
        </g>
      ) : (
        /* Relaxed tucked tail inside bed */
        <path
          d="M74 74 C82 72, 86 66, 80 60 C76 56, 72 62, 74 68 Z"
          fill="#FFFFFF"
          stroke="#CBD5E1"
          strokeWidth="1.2"
        />
      )}

      {/* Dalmatian Torso Body and Hind Legs */}
      {!isSleeping && (
        <g>
          {/* Left Hind Haunch & Paw */}
          <ellipse cx="27" cy="77" rx="9" ry="11" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.4" />
          <circle cx="23" cy="74" r="2.8" fill="#1E293B" />
          <ellipse cx="23" cy="88" rx="7" ry="4.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.3" />
          <line x1="21" y1="87" x2="21" y2="90.5" stroke="#94A3B8" strokeWidth="0.9" strokeLinecap="round" />
          <line x1="25" y1="87" x2="25" y2="90.5" stroke="#94A3B8" strokeWidth="0.9" strokeLinecap="round" />

          {/* Right Hind Haunch & Paw */}
          <ellipse cx="73" cy="77" rx="9" ry="11" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.4" />
          <circle cx="77" cy="74" r="2.6" fill="#1E293B" />
          <ellipse cx="77" cy="88" rx="7" ry="4.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.3" />
          <line x1="75" y1="87" x2="75" y2="90.5" stroke="#94A3B8" strokeWidth="0.9" strokeLinecap="round" />
          <line x1="79" y1="87" x2="79" y2="90.5" stroke="#94A3B8" strokeWidth="0.9" strokeLinecap="round" />
        </g>
      )}

      {/* Dalmatian Main Torso */}
      <ellipse cx="50" cy="69" rx="25" ry="18" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
      <circle cx="36" cy="71" r="3.5" fill="#1E293B" />
      <circle cx="62" cy="73" r="3.8" fill="#1E293B" />
      <circle cx="49" cy="79" r="2.4" fill="#1E293B" />

      {/* Realistic Anatomy Neck */}
      <path d="M37 46 L35 63 L65 63 L63 46 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />

      {/* Dalmatian Head (Skull top is at Y ≈ 20, center 50,44, r=24) */}
      <circle cx="50" cy="44" r="24" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />

      {/* Floppy Dalmatian Ears - Attached high at TOP-LEFT and TOP-RIGHT of skull */}
      <g className={!isSleeping ? 'animate-ear-bounce' : ''}>
        {/* Left Ear - roots from top-left skull (30,22), folds gracefully down (clean solid ear) */}
        <path
          d="M 32 22 C 22 18, 14 26, 15 44 C 16 54, 25 56, 28 46 C 30 38, 36 28, 38 23 Z"
          fill="#1E293B"
          stroke="#0F172A"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Right Ear - roots from top-right skull (68,22), folds gracefully down with spots */}
        <path
          d="M 68 22 C 78 18, 86 26, 85 44 C 84 54, 75 56, 72 46 C 70 38, 64 28, 62 23 Z"
          fill="#FFFFFF"
          stroke="#CBD5E1"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="78" cy="36" r="3.2" fill="#1E293B" />
        <circle cx="76" cy="48" r="2.2" fill="#1E293B" />
      </g>

      {/* Face Spots - placed safely on forehead/crown away from eyes */}
      <circle cx="34" cy="28" r="2.5" fill="#1E293B" />
      <circle cx="65" cy="27" r="2.8" fill="#1E293B" />

      

      {/* Rosy Cheeks */}
      <ellipse cx="32" cy="53" rx="4.5" ry="3" fill="#FDA4AF" opacity="0.7" />
      <ellipse cx="68" cy="53" rx="4.5" ry="3" fill="#FDA4AF" opacity="0.7" />

      {/* Eyes */}
      {isSleeping ? (
        <>
          <path d="M33 43 Q39 50 45 43" stroke="#0F172A" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          <path d="M55 43 Q61 50 67 43" stroke="#0F172A" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        </>
      ) : isHappy || isEating ? (
        <>
          <path d="M33 45 Q39 38 45 45" stroke="#0F172A" strokeWidth="3.2" strokeLinecap="round" fill="none" />
          <path d="M55 45 Q61 38 67 45" stroke="#0F172A" strokeWidth="3.2" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <circle cx="38" cy="43" r="5" fill="url(#dogEyeGlint)" stroke="#0C4A6E" strokeWidth="1" />
          <circle cx="40" cy="41" r="2.2" fill="#FFFFFF" />
          <circle cx="37" cy="44" r="0.8" fill="#FFFFFF" />
          <circle cx="62" cy="43" r="5" fill="url(#dogEyeGlint)" stroke="#0C4A6E" strokeWidth="1" />
          <circle cx="64" cy="41" r="2.2" fill="#FFFFFF" />
          <circle cx="61" cy="44" r="0.8" fill="#FFFFFF" />
        </>
      )}

      {/* Black Nose */}
      <path d="M47 49 C47 47, 50 47, 50 50 C50 47, 53 47, 53 49 C53 52, 50 53.5, 50 53.5 C50 53.5, 47 52, 47 49 Z" fill="#0F172A" />

      {/* Dog-like Mouth with cute short tongue */}
      {isEating ? (
        <g>
          {/* Same mouth/tongue as Cute mode */}
          <line x1="50" y1="53.5" x2="50" y2="56" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M 43 55 Q 46.5 57.5 50 56 Q 53.5 57.5 57 55" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path
            d="M 47.5 56.5 C 47.5 56.5, 47 59.5, 48.5 60.5 C 49.3 61.2, 50.7 61.2, 51.5 60.5 C 53 59.5, 52.5 56.5, 52.5 56.5 Z"
            fill="#FB7185"
            stroke="#E11D48"
            strokeWidth="0.6"
          />
          <line x1="50" y1="57" x2="50" y2="59.8" stroke="#BE123C" strokeWidth="0.5" strokeLinecap="round" />
        </g>
      ) : isHappy ? (
        <g>
          {/* Philtrum line below nose */}
          <line x1="50" y1="53.5" x2="50" y2="56" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" />
          {/* Dog W-shaped muzzle smile */}
          <path d="M 43 55 Q 46.5 57.5 50 56 Q 53.5 57.5 57 55" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          {/* Short cute pink tongue peeking out */}
          <path
            d="M 47.5 56.5 C 47.5 56.5, 47 59.5, 48.5 60.5 C 49.3 61.2, 50.7 61.2, 51.5 60.5 C 53 59.5, 52.5 56.5, 52.5 56.5 Z"
            fill="#FB7185"
            stroke="#E11D48"
            strokeWidth="0.6"
          />
          {/* Subtle tongue center line */}
          <line x1="50" y1="57" x2="50" y2="59.8" stroke="#BE123C" strokeWidth="0.5" strokeLinecap="round" />
        </g>
      ) : isSleeping ? (
        <g>
          <line x1="50" y1="53.5" x2="50" y2="55.5" stroke="#0F172A" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M 45 55 Q 50 57.5 55 55" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </g>
      ) : (
        <g>
          {/* Philtrum line below nose */}
          <line x1="50" y1="53.5" x2="50" y2="56" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" />
          {/* Dog W-shaped muzzle smile */}
          <path d="M 43 55 Q 46.5 57.5 50 56 Q 53.5 57.5 57 55" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          {/* Short cute pink tongue tip */}
          <path
            d="M 48 56.5 C 48 56.5, 47.6 59, 48.8 59.8 C 49.4 60.3, 50.6 60.3, 51.2 59.8 C 52.4 59, 52 56.5, 52 56.5 Z"
            fill="#FB7185"
            stroke="#E11D48"
            strokeWidth="0.5"
          />
          <line x1="50" y1="57" x2="50" y2="59.2" stroke="#BE123C" strokeWidth="0.5" strokeLinecap="round" />
        </g>
      )}

      {/* REALISTIC RECTANGULAR LEATHER COLLAR WITH BUCKLE & BONE CHARM */}
      <g>
        {/* Red leather strap fitted cleanly across neck */}
        <path
          d="M35 62 Q50 65 65 62 L64 67 Q50 70 36 67 Z"
          fill="#E11D48"
          stroke="#9F1239"
          strokeWidth="1.1"
        />
        {/* Stitching */}
        <path d="M36 63.5 Q50 66.5 64 63.5" stroke="#FECDD3" strokeWidth="0.6" strokeDasharray="1.5 1" fill="none" />
        {/* Golden square metal buckle */}
        <rect x="41" y="62" width="4.5" height="5.5" rx="1" fill="#FBBF24" stroke="#B45309" strokeWidth="0.6" />
        <line x1="43.2" y1="62.5" x2="43.2" y2="67" stroke="#78350F" strokeWidth="0.8" />
        {/* Metallic hanging ring */}
        <circle cx="50" cy="68" r="1.4" fill="none" stroke="#FBBF24" strokeWidth="0.8" />
        {/* White dog bone charm tag */}
        <path
          d="M46 70 C45 69, 45 72, 46 71 L54 71 C55 72, 55 69, 54 70 Z"
          fill="#FFFFFF"
          stroke="#94A3B8"
          strokeWidth="0.6"
        />
      </g>

      {/* FRONT LEGS: keep Manchu's dog legs visible in every awake mood */}
      {!isSleeping && (
        <g>
          {/* Left front leg — slimmer, longer and more dog-like */}
          <path
            d="M 34 66
               C 33 72, 33 79, 33 86
               C 33 90, 35 92, 38 92
               C 41 92, 43 90, 43 86
               C 43 79, 43 72, 42 66 Z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          {/* Left paw */}
          <path
            d="M 33 88
               C 34 85, 41 85, 43 88
               C 45 91, 43 95, 38 95
               C 33 95, 31 92, 33 88 Z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1.2"
          />
          <path d="M36 91 L36 94" stroke="#94A3B8" strokeWidth="0.9" strokeLinecap="round" />
          <path d="M40 91 L40 94" stroke="#94A3B8" strokeWidth="0.9" strokeLinecap="round" />
          <circle cx="36" cy="77" r="2.1" fill="#1E293B" />

          {/* Right front leg — slimmer, longer and more dog-like */}
          <path
            d="M 58 66
               C 57 72, 57 79, 57 86
               C 57 90, 59 92, 62 92
               C 65 92, 67 90, 67 86
               C 67 79, 67 72, 66 66 Z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          {/* Right paw */}
          <path
            d="M 57 88
               C 58 85, 65 85, 67 88
               C 69 91, 67 95, 62 95
               C 57 95, 55 92, 57 88 Z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1.2"
          />
          <path d="M60 91 L60 94" stroke="#94A3B8" strokeWidth="0.9" strokeLinecap="round" />
          <path d="M64 91 L64 94" stroke="#94A3B8" strokeWidth="0.9" strokeLinecap="round" />
          <circle cx="64" cy="79" r="1.8" fill="#1E293B" />
        </g>
      )}

      {/* EATING MODE: full dog-food bowl next to Manchu */}
      {isEating && (
        <g>
          <ellipse cx="78" cy="80" rx="11" ry="3.2" fill="#000000" opacity="0.08" />
          <path
            d="M68 73 C69 83, 87 83, 88 73 L84 82 C82 85, 74 85, 72 82 Z"
            fill="#EF4444"
            stroke="#BE123C"
            strokeWidth="1.2"
          />
          <ellipse cx="78" cy="73" rx="11" ry="4.2" fill="#F87171" stroke="#BE123C" strokeWidth="1.2" />
          <ellipse cx="78" cy="72.5" rx="8" ry="2.8" fill="#7C3F00" />
          <circle cx="74.5" cy="72.2" r="1.1" fill="#A16207" />
          <circle cx="78" cy="71.8" r="1.2" fill="#92400E" />
          <circle cx="81.5" cy="72.4" r="1.1" fill="#A16207" />
          <circle cx="76.4" cy="73.2" r="0.9" fill="#92400E" />
          <circle cx="80.2" cy="73.1" r="0.9" fill="#78350F" />
        </g>
      )}

      {/* Sleeping mode bed front */}
      {isSleeping && (
        /* Front bolster of dog bed with bone badge */
        <g>
          <path
            d="M3 75 C10 95, 90 95, 97 75 C88 91, 12 91, 3 75 Z"
            fill="url(#dogBedOuter)"
            stroke="#BE123C"
            strokeWidth="1.5"
          />
          <path
            d="M46 85 C45 84, 45 87, 46 86 L54 86 C55 87, 55 84, 54 85 Z"
            fill="#FFFFFF"
            stroke="#BE123C"
            strokeWidth="0.8"
          />
        </g>
      )}
    </svg>
  );
};

/* =========================================================================
   3. CUTE HAMSTER (WENDY)
   Quiet, shy & bold!
   - Visible feet in Eat mode & visible legs/paws in Sleep mode
   - Cozy wooden nest hideout
   ========================================================================= */
const HamsterSVG: React.FC<{ mood: string }> = ({ mood }) => {
  const isSleeping = mood === 'sleeping';
  const isHappy = mood === 'happy' || mood === 'celebrating';
  const isEating = mood === 'eating';

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full drop-shadow-md select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="hamsterFur" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <radialGradient id="hamsterEye" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#451A03" />
          <stop offset="80%" stopColor="#1C1917" />
          <stop offset="100%" stopColor="#0C0A09" />
        </radialGradient>
        <linearGradient id="hamsterHut" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>

      {/* SLEEPING MODE: Cozy Wooden Hamster Nest / Hideout (Back Dome) */}
      {isSleeping && (
        <g>
          <ellipse cx="50" cy="72" rx="46" ry="22" fill="url(#hamsterHut)" stroke="#B45309" strokeWidth="1.5" />
          <ellipse cx="50" cy="75" rx="38" ry="16" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1.2" />
        </g>
      )}

      {/* Tiny Rounded Ears */}
      <g className={!isSleeping ? 'animate-ear-bounce' : ''}>
        <circle cx="28" cy="24" r="9" fill="url(#hamsterFur)" stroke="#B45309" strokeWidth="1.5" />
        <circle cx="28" cy="24" r="5" fill="#FDA4AF" />
        <circle cx="72" cy="24" r="9" fill="url(#hamsterFur)" stroke="#B45309" strokeWidth="1.5" />
        <circle cx="72" cy="24" r="5" fill="#FDA4AF" />
      </g>

      {/* Fluffy Round Body */}
      <ellipse cx="50" cy="62" rx="36" ry="30" fill="url(#hamsterFur)" stroke="#B45309" strokeWidth="1.5" />

      {/* White/Cream Fluffy Belly & Face Center */}
      <ellipse cx="50" cy="64" rx="24" ry="22" fill="#FEF3C7" />

      {/* Giant Puffy Cheeks */}
      <g className={isEating ? 'animate-hamster-chew' : ''}>
        <ellipse cx="28" cy="54" rx="14" ry="12" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1" />
        <ellipse cx="72" cy="54" rx="14" ry="12" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1" />
        <circle cx="26" cy="56" r="6" fill="#FB7185" opacity="0.65" />
        <circle cx="74" cy="56" r="6" fill="#FB7185" opacity="0.65" />
      </g>

      {/* Eyes */}
      {isSleeping ? (
        <>
          <path d="M33 42 Q39 48 45 42" stroke="#451A03" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          <path d="M55 42 Q61 48 67 42" stroke="#451A03" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        </>
      ) : isHappy || isEating ? (
        <>
          <path d="M33 44 Q39 37 45 44" stroke="#451A03" strokeWidth="3.2" strokeLinecap="round" fill="none" />
          <path d="M55 44 Q61 37 67 44" stroke="#451A03" strokeWidth="3.2" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <circle cx="38" cy="42" r="5" fill="url(#hamsterEye)" />
          <circle cx="40" cy="40" r="2.2" fill="#FFFFFF" />
          <circle cx="37" cy="43" r="0.9" fill="#FFFFFF" />
          <circle cx="62" cy="42" r="5" fill="url(#hamsterEye)" />
          <circle cx="64" cy="40" r="2.2" fill="#FFFFFF" />
          <circle cx="61" cy="43" r="0.9" fill="#FFFFFF" />
        </>
      )}

      {/* Pink Nose */}
      <ellipse cx="50" cy="48" rx="2.5" ry="2" fill="#F43F5E" />

      {/* Mouth & Cute Front Teeth */}
      {isEating ? (
        <>
          <ellipse cx="50" cy="53" rx="3.5" ry="2.5" fill="#BE123C" />
          <rect x="48" y="52" width="1.8" height="2.2" rx="0.4" fill="#FFFFFF" />
          <rect x="50.2" y="52" width="1.8" height="2.2" rx="0.4" fill="#FFFFFF" />
        </>
      ) : isSleeping ? (
        <path d="M47 50 Q50 53 53 50" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      ) : (
        <g>
          {/* Hamster smile */}
          <path d="M45 50 Q50 54 55 50" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          {/* Two cute white hamster buck teeth peeking out */}
          <rect x="48.2" y="51" width="1.6" height="2.4" rx="0.3" fill="#FFFFFF" stroke="#78350F" strokeWidth="0.4" />
          <rect x="50.2" y="51" width="1.6" height="2.4" rx="0.3" fill="#FFFFFF" stroke="#78350F" strokeWidth="0.4" />
        </g>
      )}

      {/* Whiskers */}
      <line x1="20" y1="52" x2="6" y2="50" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="56" x2="8" y2="58" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="80" y1="52" x2="94" y2="50" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="80" y1="56" x2="92" y2="58" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />

      {/* EATING MODE: Both hands holding Swiss Cheese + BACK FEET CLEARLY VISIBLE */}
      {isEating ? (
        <g>
          {/* Back feet supporting the hamster while eating */}
          <ellipse cx="32" cy="85" rx="7" ry="4.5" fill="#FDA4AF" stroke="#E11D48" strokeWidth="1" />
          <ellipse cx="68" cy="85" rx="7" ry="4.5" fill="#FDA4AF" stroke="#E11D48" strokeWidth="1" />

          {/* Cheese Wedge */}
          <polygon points="40,58 60,58 50,74" fill="#FBBF24" stroke="#D97706" strokeWidth="1.2" />
          <circle cx="47" cy="62" r="1.8" fill="#FEF3C7" />
          <circle cx="53" cy="65" r="1.5" fill="#FEF3C7" />
          <circle cx="49" cy="69" r="1.2" fill="#FEF3C7" />

          {/* Front paws clutching cheese */}
          <ellipse cx="40" cy="64" rx="4.5" ry="3.5" fill="#FDA4AF" stroke="#E11D48" strokeWidth="0.8" />
          <ellipse cx="60" cy="64" rx="4.5" ry="3.5" fill="#FDA4AF" stroke="#E11D48" strokeWidth="0.8" />
        </g>
      ) : isSleeping ? (
        /* SLEEPING MODE: Visible tucked legs, rear feet, and front paws */
        <g>
          {/* Tucked front sleeping paws under chin */}
          <ellipse cx="43" cy="64" rx="4" ry="3" fill="#FDA4AF" stroke="#E11D48" strokeWidth="0.8" />
          <ellipse cx="57" cy="64" rx="4" ry="3" fill="#FDA4AF" stroke="#E11D48" strokeWidth="0.8" />
          {/* Visible relaxed back feet resting on bedding */}
          <ellipse cx="28" cy="77" rx="6.5" ry="4" fill="#FDA4AF" stroke="#E11D48" strokeWidth="0.9" />
          <ellipse cx="72" cy="77" rx="6.5" ry="4" fill="#FDA4AF" stroke="#E11D48" strokeWidth="0.9" />

          {/* Front rim of wooden hideout */}
          <path
            d="M3 75 C10 95, 90 95, 97 75 C88 91, 12 91, 3 75 Z"
            fill="url(#hamsterHut)"
            stroke="#B45309"
            strokeWidth="1.5"
          />
        </g>
      ) : (
        /* Normal Resting paws and feet */
        <>
          <ellipse cx="42" cy="68" rx="4" ry="3" fill="#FDA4AF" stroke="#E11D48" strokeWidth="0.8" />
          <ellipse cx="58" cy="68" rx="4" ry="3" fill="#FDA4AF" stroke="#E11D48" strokeWidth="0.8" />
          <ellipse cx="34" cy="88" rx="6" ry="4" fill="#FDA4AF" stroke="#E11D48" strokeWidth="1" />
          <ellipse cx="66" cy="88" rx="6" ry="4" fill="#FDA4AF" stroke="#E11D48" strokeWidth="1" />
        </>
      )}
    </svg>
  );
};

/* =========================================================================
   4. WISE TURTLE (SHELLY)
   Smart, cautious & reserved!
   - Eat mode: Food bowl with fresh lettuce placed beside him while he munches happily
   - Sleep mode: Sleeping flat "boca abajo" with all 4 flippers relaxed, NO eyelashes
   - Cute / general: No awkward tail
   ========================================================================= */
const TurtleSVG: React.FC<{ mood: string }> = ({ mood }) => {
  const isSleeping = mood === 'sleeping';
  const isHappy = mood === 'happy' || mood === 'celebrating';
  const isEating = mood === 'eating';

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full drop-shadow-md select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="turtleShell" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="turtleSkin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A7F3D0" />
          <stop offset="100%" stopColor="#6EE7B7" />
        </linearGradient>
        <radialGradient id="turtleEye" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#065F46" />
          <stop offset="80%" stopColor="#064E3B" />
          <stop offset="100%" stopColor="#022C22" />
        </radialGradient>
        <linearGradient id="lilyPadGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>

      {/* SLEEPING MODE: Serene Water Lily Pad Bed / Cucha (Back) */}
      {isSleeping && (
        <g>
          {/* Floating water lily pad */}
          <ellipse cx="50" cy="72" rx="46" ry="22" fill="url(#lilyPadGrad)" stroke="#065F46" strokeWidth="1.5" />
          {/* Lily pad notch */}
          <path d="M50 72 L88 62 L90 72 Z" fill="#E0F2FE" />
          {/* Water ripples */}
          <ellipse cx="50" cy="78" rx="41" ry="14" fill="none" stroke="#67E8F9" strokeWidth="1" opacity="0.6" />
          {/* Pink Water Lotus */}
          <circle cx="16" cy="66" r="4" fill="#F472B6" />
          <circle cx="16" cy="66" r="1.5" fill="#FBBF24" />
        </g>
      )}

      {/* SLEEPING MODE (BOCA ABAJO): All 4 flippers relaxed and visible */}
      {isSleeping ? (
        <g>
          {/* Front Flippers spread relaxed flat on lily pad */}
          <ellipse cx="20" cy="48" rx="10" ry="6" fill="url(#turtleSkin)" stroke="#047857" strokeWidth="1.4" transform="rotate(-15 20 48)" />
          <ellipse cx="80" cy="48" rx="10" ry="6" fill="url(#turtleSkin)" stroke="#047857" strokeWidth="1.4" transform="rotate(15 80 48)" />
          {/* Rear Flippers resting relaxed */}
          <ellipse cx="24" cy="74" rx="9" ry="5.5" fill="url(#turtleSkin)" stroke="#047857" strokeWidth="1.4" transform="rotate(-20 24 74)" />
          <ellipse cx="76" cy="74" rx="9" ry="5.5" fill="url(#turtleSkin)" stroke="#047857" strokeWidth="1.4" transform="rotate(20 76 74)" />
        </g>
      ) : (
        /* ACTIVE MODE FLIPPERS */
        <g className="animate-gentle-float">
          <ellipse cx="22" cy="48" rx="9" ry="6" fill="url(#turtleSkin)" stroke="#047857" strokeWidth="1.5" />
          <ellipse cx="78" cy="48" rx="9" ry="6" fill="url(#turtleSkin)" stroke="#047857" strokeWidth="1.5" />
          <ellipse cx="26" cy="78" rx="8" ry="5" fill="url(#turtleSkin)" stroke="#047857" strokeWidth="1.5" />
          <ellipse cx="74" cy="78" rx="8" ry="5" fill="url(#turtleSkin)" stroke="#047857" strokeWidth="1.5" />
        </g>
      )}

      {/* Emerald Shell Dome */}
      <ellipse cx="50" cy="58" rx="34" ry="28" fill="url(#turtleShell)" stroke="#047857" strokeWidth="2" />
      <ellipse cx="50" cy="62" rx="34" ry="25" fill="none" stroke="#D1FAE5" strokeWidth="2.5" opacity="0.6" />

      {/* Hexagonal Shell Gem Markings */}
      <polygon points="50,44 59,49 59,59 50,64 41,59 41,49" fill="#047857" stroke="#6EE7B7" strokeWidth="1.5" />
      <polygon points="50,30 57,34 57,41 50,44 43,41 43,34" fill="#065F46" stroke="#6EE7B7" strokeWidth="1.2" />
      <polygon points="34,48 41,49 41,59 34,64 27,59 27,49" fill="#065F46" stroke="#6EE7B7" strokeWidth="1.2" />
      <polygon points="66,48 73,49 73,59 66,64 59,59 59,49" fill="#065F46" stroke="#6EE7B7" strokeWidth="1.2" />
      <polygon points="50,64 57,68 57,75 50,78 43,75 43,68" fill="#065F46" stroke="#6EE7B7" strokeWidth="1.2" />

      {/* Turtle Head: Lower resting when sleeping boca abajo, upright otherwise */}
      <circle cx="50" cy={isSleeping ? '35' : '28'} r="19" fill="url(#turtleSkin)" stroke="#047857" strokeWidth="1.8" />

      {/* Rosy Cheeks */}
      <ellipse cx="38" cy={isSleeping ? '40' : '33'} rx="3.5" ry="2" fill="#FB7185" opacity="0.7" />
      <ellipse cx="62" cy={isSleeping ? '40' : '33'} rx="3.5" ry="2" fill="#FB7185" opacity="0.7" />

      {/* Eyes: NO eyelashes for sleep (clean smooth curve), sparkling when awake */}
      {isSleeping ? (
        <>
          <path d="M37 34 Q42 39 47 34" stroke="#064E3B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M53 34 Q58 39 63 34" stroke="#064E3B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </>
      ) : isHappy || isEating ? (
        <>
          <path d="M37 28 Q42 22 47 28" stroke="#064E3B" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          <path d="M53 28 Q58 22 63 28" stroke="#064E3B" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <circle cx="41" cy="26" r="4" fill="url(#turtleEye)" />
          <circle cx="43" cy="24" r="1.8" fill="#FFFFFF" />
          <circle cx="40" cy="27" r="0.7" fill="#FFFFFF" />
          <circle cx="59" cy="26" r="4" fill="url(#turtleEye)" />
          <circle cx="61" cy="24" r="1.8" fill="#FFFFFF" />
          <circle cx="58" cy="27" r="0.7" fill="#FFFFFF" />
        </>
      )}

      {/* Turtle Smile */}
      {isEating ? (
        <ellipse cx="50" cy="35" rx="3.2" ry="2.2" fill="#BE123C" />
      ) : isSleeping ? (
        <path d="M46 41 Q50 44 54 41" stroke="#064E3B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M46 33 Q50 37 54 33" stroke="#064E3B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      )}

      {/* EATING MODE: A Cute Ceramic Food Bowl with Fresh Lettuce on the side 🥬 */}
      {isEating && (
        <g>
          {/* Ceramic yellow/terracotta food bowl on right side */}
          <ellipse cx="78" cy="70" rx="15" ry="7.5" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.2" />
          {/* Crisp lettuce leaves piled up in the bowl */}
          <path
            d="M68 68 C64 60, 74 56, 80 62 C86 58, 90 64, 86 68 Z"
            fill="#22C55E"
            stroke="#15803D"
            strokeWidth="1"
          />
          <path d="M72 67 Q78 61 84 65" stroke="#86EFAC" strokeWidth="0.8" fill="none" />
          {/* Tasty lettuce leaf crumbles near mouth */}
          <circle cx="56" cy="38" r="1.2" fill="#22C55E" />
          <circle cx="62" cy="44" r="1.4" fill="#22C55E" />
        </g>
      )}
    </svg>
  );
};

/* =========================================================================
   5. BOUNCY BUNNY (TOKKI)
   Independent, energetic explorer!
   - Fluffy burrow cloud bed
   - Crunchy carrot treat
   ========================================================================= */
const BunnySVG: React.FC<{ mood: string }> = ({ mood }) => {
  const isSleeping = mood === 'sleeping';
  const isHappy = mood === 'happy' || mood === 'celebrating';
  const isEating = mood === 'eating';

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full drop-shadow-md select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bunnyGrad" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="bunnyInnerEar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FCE7F3" />
          <stop offset="100%" stopColor="#F472B6" />
        </linearGradient>
        <radialGradient id="bunnyEye" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="70%" stopColor="#4C1D95" />
          <stop offset="100%" stopColor="#2E1065" />
        </radialGradient>
        <linearGradient id="bunnyBedGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FBCFE8" />
          <stop offset="100%" stopColor="#F472B6" />
        </linearGradient>
      </defs>

      {/* SLEEPING MODE: Cozy Burrow Cloud Bed / Cucha (Back Rim) */}
      {isSleeping && (
        <g>
          <ellipse cx="50" cy="72" rx="46" ry="22" fill="url(#bunnyBedGrad)" stroke="#DB2777" strokeWidth="1.5" />
          <ellipse cx="50" cy="75" rx="38" ry="16" fill="#FDF2F8" stroke="#FBCFE8" strokeWidth="1.2" />
        </g>
      )}

      {/* Long Bunny Ears */}
      <g className={!isSleeping ? 'animate-ear-wiggle' : ''}>
        <ellipse cx="34" cy="20" rx="9" ry="20" fill="url(#bunnyGrad)" stroke="#6D28D9" strokeWidth="1.5" transform="rotate(-8 34 20)" />
        <ellipse cx="34" cy="20" rx="5" ry="15" fill="url(#bunnyInnerEar)" transform="rotate(-8 34 20)" />
        <ellipse cx="66" cy="20" rx="9" ry="20" fill="url(#bunnyGrad)" stroke="#6D28D9" strokeWidth="1.5" transform="rotate(8 66 20)" />
        <ellipse cx="66" cy="20" rx="5" ry="15" fill="url(#bunnyInnerEar)" transform="rotate(8 66 20)" />
      </g>

      {/* Fluffy Cottontail */}
      <circle cx="20" cy="74" r="8" fill="#EDE9FE" stroke="#C4B5FD" strokeWidth="1.5" />

      {/* Bunny Torso Body */}
      <ellipse cx="50" cy="72" rx="28" ry="22" fill="url(#bunnyGrad)" stroke="#6D28D9" strokeWidth="1.5" />
      <ellipse cx="50" cy="74" rx="18" ry="14" fill="#F5F3FF" />

      {/* Anatomy Neck */}
      <path d="M38 48 L36 64 L64 64 L62 48 Z" fill="url(#bunnyGrad)" stroke="#6D28D9" strokeWidth="1.2" />

      {/* Bunny Head */}
      <circle cx="50" cy="46" r="26" fill="url(#bunnyGrad)" stroke="#6D28D9" strokeWidth="1.5" />
      {/* Muzzle */}
      <ellipse cx="50" cy="53" rx="18" ry="12" fill="#F5F3FF" />

      {/* Cheeks */}
      <ellipse cx="33" cy="53" rx="5" ry="3" fill="#FB7185" opacity="0.65" />
      <ellipse cx="67" cy="53" rx="5" ry="3" fill="#FB7185" opacity="0.65" />

      {/* Eyes */}
      {isSleeping ? (
        <>
          <path d="M33 45 Q39 51 45 45" stroke="#2E1065" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          <path d="M55 45 Q61 51 67 45" stroke="#2E1065" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        </>
      ) : isHappy || isEating ? (
        <>
          <path d="M33 47 Q39 40 45 47" stroke="#2E1065" strokeWidth="3.2" strokeLinecap="round" fill="none" />
          <path d="M55 47 Q61 40 67 47" stroke="#2E1065" strokeWidth="3.2" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <circle cx="38" cy="45" r="5" fill="url(#bunnyEye)" />
          <circle cx="40" cy="43" r="2.2" fill="#FFFFFF" />
          <circle cx="37" cy="46" r="0.8" fill="#FFFFFF" />
          <circle cx="62" cy="45" r="5" fill="url(#bunnyEye)" />
          <circle cx="64" cy="43" r="2.2" fill="#FFFFFF" />
          <circle cx="61" cy="46" r="0.8" fill="#FFFFFF" />
        </>
      )}

      {/* Bunny Nose */}
      <polygon points="48,52 52,52 50,55" fill="#EC4899" />

      {/* Mouth & Classic Bunny Buck Teeth */}
      {isEating ? (
        <g>
          <ellipse cx="50" cy="57" rx="3.5" ry="2.5" fill="#BE123C" />
          {/* Distinct white bunny front teeth */}
          <rect x="48" y="55" width="1.9" height="3" rx="0.4" fill="#FFFFFF" stroke="#4C1D95" strokeWidth="0.4" />
          <rect x="50.1" y="55" width="1.9" height="3" rx="0.4" fill="#FFFFFF" stroke="#4C1D95" strokeWidth="0.4" />
        </g>
      ) : isSleeping ? (
        <path d="M46 55 Q50 58 54 55" stroke="#4C1D95" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      ) : (
        <g>
          {/* Bunny smiling snout line */}
          <path d="M44 54 Q48 57 50 55 Q52 57 56 54" stroke="#4C1D95" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          {/* Prominent cute pair of bunny buck teeth peeking out */}
          <rect x="48.1" y="55" width="1.8" height="2.8" rx="0.4" fill="#FFFFFF" stroke="#4C1D95" strokeWidth="0.5" />
          <rect x="50.1" y="55" width="1.8" height="2.8" rx="0.4" fill="#FFFFFF" stroke="#4C1D95" strokeWidth="0.5" />
        </g>
      )}

      {/* Whiskers */}
      <line x1="24" y1="51" x2="10" y2="49" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="24" y1="56" x2="12" y2="58" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="76" y1="51" x2="90" y2="49" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="76" y1="56" x2="88" y2="58" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" />

      {/* Pretty Ribbon Bow */}
      <circle cx="68" cy="34" r="3.5" fill="#EC4899" />
      <polygon points="65,34 58,30 58,38" fill="#EC4899" />
      <polygon points="71,34 78,30 78,38" fill="#EC4899" />

      {/* EATING MODE: Paws Holding Crunchy Carrot Inverted Below Mouth (Face Fully Visible) 🥕 */}
      {isEating ? (
        <g>
          {/* Carrot Body with tip near mouth (y=60) and wide base with green leaves at bottom (y=74-82) */}
          <polygon points="49,60 55,73 45,73" fill="#F97316" stroke="#C2410C" strokeWidth="1.2" />
          <line x1="47" y1="65" x2="53" y2="65" stroke="#EA580C" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="46" y1="70" x2="54" y2="70" stroke="#EA580C" strokeWidth="0.8" strokeLinecap="round" />
          {/* Green leaves pointing downwards at the base, away from face */}
          <polygon points="47,73 43,81 48,77" fill="#22C55E" stroke="#15803D" strokeWidth="0.8" />
          <polygon points="50,73 50,83 52,77" fill="#22C55E" stroke="#15803D" strokeWidth="0.8" />
          <polygon points="53,73 57,81 52,77" fill="#22C55E" stroke="#15803D" strokeWidth="0.8" />

          {/* Paws holding the carrot nicely */}
          <ellipse cx="41" cy="68" rx="4.5" ry="3.5" fill="#EDE9FE" stroke="#8B5CF6" strokeWidth="1.2" />
          <ellipse cx="59" cy="68" rx="4.5" ry="3.5" fill="#EDE9FE" stroke="#8B5CF6" strokeWidth="1.2" />
        </g>
      ) : isSleeping ? (
        /* Front rim of bunny bed */
        <path
          d="M3 75 C10 95, 90 95, 97 75 C88 91, 12 91, 3 75 Z"
          fill="url(#bunnyBedGrad)"
          stroke="#DB2777"
          strokeWidth="1.5"
        />
      ) : (
        /* Normal paws */
        <>
          <ellipse cx="38" cy="85" rx="7" ry="5" fill="#EDE9FE" stroke="#8B5CF6" strokeWidth="1.2" />
          <ellipse cx="62" cy="85" rx="7" ry="5" fill="#EDE9FE" stroke="#8B5CF6" strokeWidth="1.2" />
        </>
      )}
    </svg>
  );
};
