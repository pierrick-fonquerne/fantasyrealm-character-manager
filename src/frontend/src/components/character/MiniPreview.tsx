import { memo, useMemo } from 'react';

const DEFAULT_COLORS = {
  skin: '#C19A6B',
  hair: '#4A3C31',
  eye: '#4A3C31',
  mouth: '#C9756B',
  nose: 'rgba(0, 0, 0, 0.1)',
  bodyGradient: 'linear-gradient(180deg, #5C564E 0%, #3D3935 100%)',
} as const;

interface HairStyleConfig {
  height: string;
  borderRadius: string;
  top: string;
  width?: string;
}

const FACE_RADIUS_MAP: Record<string, string> = {
  rond: '50%',
  ovale: '50% 50% 45% 45%',
  carre: '15%',
  allonge: '40% 40% 50% 50%',
};

const HAIR_STYLE_MAP: Record<string, HairStyleConfig> = {
  court: { height: '18px', borderRadius: '50% 50% 0 0', top: '-2px' },
  long: { height: '32px', borderRadius: '50% 50% 20% 20%', top: '-4px' },
  tresse: { height: '25px', borderRadius: '50% 50% 10% 10%', top: '-3px' },
  rase: { height: '10px', borderRadius: '50% 50% 0 0', top: '0px' },
  boucle: { height: '22px', borderRadius: '45% 45% 30% 30%', top: '-4px' },
  queue: { height: '20px', borderRadius: '50% 50% 0 0', top: '-2px' },
  mohawk: { height: '26px', borderRadius: '30% 30% 0 0', top: '-5px', width: '18px' },
  dreadlocks: { height: '30px', borderRadius: '40% 40% 20% 20%', top: '-3px' },
};

const DEFAULT_FACE_RADIUS = '50% 50% 45% 45%';
const DEFAULT_HAIR_STYLE: HairStyleConfig = {
  height: '22px',
  borderRadius: '50% 50% 0 0',
  top: '-3px',
};
const DEFAULT_HAIR_WIDTH = '40px';

export interface MiniPreviewProps {
  skinColor: string;
  hairColor: string;
  eyeColor: string;
  faceShape: string;
  hairStyle: string;
}

function MiniPreviewComponent({
  skinColor,
  hairColor,
  eyeColor,
  faceShape,
  hairStyle,
}: MiniPreviewProps) {
  const faceRadius = useMemo(
    () => FACE_RADIUS_MAP[faceShape] ?? DEFAULT_FACE_RADIUS,
    [faceShape]
  );
  const hairConfig = useMemo(
    () => HAIR_STYLE_MAP[hairStyle] ?? DEFAULT_HAIR_STYLE,
    [hairStyle]
  );

  const effectiveSkinColor = skinColor || DEFAULT_COLORS.skin;
  const effectiveHairColor = hairColor || DEFAULT_COLORS.hair;
  const effectiveEyeColor = eyeColor || DEFAULT_COLORS.eye;

  return (
    <div
      className="relative w-16 h-20 flex-shrink-0"
      role="img"
      aria-label="Aperçu du personnage"
    >
      {/* Hair */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          width: hairConfig.width ?? DEFAULT_HAIR_WIDTH,
          height: hairConfig.height,
          backgroundColor: effectiveHairColor,
          borderRadius: hairConfig.borderRadius,
          top: hairConfig.top,
        }}
      />

      {/* Head */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[36px] h-[44px]"
        style={{
          backgroundColor: effectiveSkinColor,
          borderRadius: faceRadius,
        }}
      >
        {/* Eyes */}
        <div
          className="absolute top-[18px] left-[8px] w-[6px] h-[5px] rounded-full"
          style={{ backgroundColor: effectiveEyeColor }}
        />
        <div
          className="absolute top-[18px] right-[8px] w-[6px] h-[5px] rounded-full"
          style={{ backgroundColor: effectiveEyeColor }}
        />

        {/* Nose */}
        <div
          className="absolute top-[24px] left-1/2 -translate-x-1/2 w-[3px] h-[8px] rounded-full"
          style={{ backgroundColor: DEFAULT_COLORS.nose }}
        />

        {/* Mouth */}
        <div
          className="absolute top-[34px] left-1/2 -translate-x-1/2 w-[10px] h-[3px] rounded-b-full"
          style={{ backgroundColor: DEFAULT_COLORS.mouth }}
        />
      </div>

      {/* Ears */}
      <div
        className="absolute top-[16px] left-[10px] w-[7px] h-[10px] rounded-full"
        style={{ backgroundColor: effectiveSkinColor }}
      />
      <div
        className="absolute top-[16px] right-[10px] w-[7px] h-[10px] rounded-full"
        style={{ backgroundColor: effectiveSkinColor }}
      />

      {/* Body */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[44px] h-[32px] rounded-t-lg"
        style={{ background: DEFAULT_COLORS.bodyGradient }}
      />
    </div>
  );
}

export const MiniPreview = memo(MiniPreviewComponent);
