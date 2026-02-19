interface CharacterPreviewProps {
  name: string;
  className: string;
  skinColor: string;
  hairColor: string;
  eyeColor: string;
  faceShape: string;
  hairStyle: string;
  eyeShape: string;
  noseShape: string;
  mouthShape: string;
}

export function CharacterPreview({
  name,
  className,
  skinColor,
  hairColor,
  eyeColor,
  faceShape,
  hairStyle,
  eyeShape,
  noseShape,
  mouthShape,
}: CharacterPreviewProps) {
  const getFaceRadius = () => {
    switch (faceShape) {
      case 'rond': return '50%';
      case 'ovale': return '50% 50% 45% 45%';
      case 'carre': return '10%';
      case 'allonge': return '40% 40% 50% 50%';
      default: return '50% 50% 45% 45%';
    }
  };

  const getHairStyle = () => {
    switch (hairStyle) {
      case 'court':
        return { height: '50px', borderRadius: '50% 50% 0 0', top: '-5px' };
      case 'long':
        return { height: '90px', borderRadius: '50% 50% 20% 20%', top: '-10px' };
      case 'tresse':
        return { height: '70px', borderRadius: '50% 50% 10% 10%', top: '-8px' };
      case 'rase':
        return { height: '30px', borderRadius: '50% 50% 0 0', top: '0px' };
      case 'boucle':
        return { height: '65px', borderRadius: '45% 45% 30% 30%', top: '-10px' };
      case 'queue':
        return { height: '55px', borderRadius: '50% 50% 0 0', top: '-5px' };
      case 'mohawk':
        return { height: '75px', borderRadius: '30% 30% 0 0', top: '-15px', width: '50px' };
      case 'dreadlocks':
        return { height: '85px', borderRadius: '40% 40% 20% 20%', top: '-8px' };
      default:
        return { height: '60px', borderRadius: '50% 50% 0 0', top: '-8px' };
    }
  };

  const getEyeStyle = () => {
    switch (eyeShape) {
      case 'amande':
        return { width: '18px', height: '10px', borderRadius: '50%', transform: 'rotate(-5deg)' };
      case 'rond':
        return { width: '14px', height: '14px', borderRadius: '50%' };
      case 'tombant':
        return { width: '16px', height: '10px', borderRadius: '50%', transform: 'rotate(8deg)' };
      case 'bride':
        return { width: '18px', height: '8px', borderRadius: '50%', transform: 'rotate(-8deg)' };
      case 'enfonce':
        return { width: '12px', height: '12px', borderRadius: '50%', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)' };
      case 'ecarquille':
        return { width: '16px', height: '16px', borderRadius: '50%' };
      default:
        return { width: '16px', height: '16px', borderRadius: '50%' };
    }
  };

  const getNoseStyle = () => {
    switch (noseShape) {
      case 'droit':
        return { width: '8px', height: '22px', borderRadius: '10%' };
      case 'courbe':
        return { width: '10px', height: '22px', borderRadius: '30% 30% 50% 50%', transform: 'skewX(-5deg)' };
      case 'retrousse':
        return { width: '10px', height: '18px', borderRadius: '50% 50% 30% 30%' };
      case 'large':
        return { width: '14px', height: '20px', borderRadius: '20% 20% 40% 40%' };
      case 'fin':
        return { width: '6px', height: '22px', borderRadius: '10%' };
      default:
        return { width: '10px', height: '20px', borderRadius: '30% 30% 50% 50%' };
    }
  };

  const getMouthStyle = () => {
    switch (mouthShape) {
      case 'fine':
        return { width: '28px', height: '4px', borderRadius: '0 0 50% 50%' };
      case 'charnue':
        return { width: '32px', height: '12px', borderRadius: '0 0 50% 50%' };
      case 'moyenne':
        return { width: '30px', height: '8px', borderRadius: '0 0 50% 50%' };
      case 'large':
        return { width: '38px', height: '10px', borderRadius: '40%' };
      case 'asymetrique':
        return { width: '30px', height: '7px', borderRadius: '0 0 50% 50%', transform: 'skewX(8deg)' };
      case 'pincee':
        return { width: '22px', height: '6px', borderRadius: '50%' };
      default:
        return { width: '30px', height: '8px', borderRadius: '0 0 50% 50%' };
    }
  };

  const hairStyles = getHairStyle();
  const eyeStyles = getEyeStyle();
  const noseStyles = getNoseStyle();
  const mouthStyles = getMouthStyle();

  return (
    <div className="flex flex-col items-center">
      {/* Character Silhouette */}
      <div
        className="relative w-[200px] h-[280px]"
        role="img"
        aria-label={`Aperçu du personnage ${name || 'sans nom'}`}
      >
        {/* Hair */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            width: hairStyles.width || '110px',
            height: hairStyles.height,
            backgroundColor: hairColor,
            borderRadius: hairStyles.borderRadius,
            top: hairStyles.top,
          }}
        />

        {/* Head */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[120px]"
          style={{
            backgroundColor: skinColor,
            borderRadius: getFaceRadius(),
          }}
        >
          {/* Eyes */}
          <div
            className="absolute top-[50px] left-[25px]"
            style={{ backgroundColor: eyeColor, ...eyeStyles }}
          />
          <div
            className="absolute top-[50px] right-[25px]"
            style={{ backgroundColor: eyeColor, ...eyeStyles }}
          />

          {/* Nose */}
          <div
            className="absolute top-[62px] left-1/2 -translate-x-1/2"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)', ...noseStyles }}
          />

          {/* Mouth */}
          <div
            className="absolute top-[90px] left-1/2 -translate-x-1/2"
            style={{ backgroundColor: '#C9756B', ...mouthStyles }}
          />
        </div>

        {/* Ears */}
        <div
          className="absolute top-[45px] left-[35px] w-5 h-[30px] rounded-full"
          style={{ backgroundColor: skinColor }}
        />
        <div
          className="absolute top-[45px] right-[35px] w-5 h-[30px] rounded-full"
          style={{ backgroundColor: skinColor }}
        />

        {/* Body */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120px] h-[160px] rounded-t-[20px]"
          style={{
            background: 'linear-gradient(180deg, #5C564E 0%, #3D3935 100%)',
          }}
        />
      </div>

      {/* Character Info */}
      <div className="text-center mt-4">
        <h3 className="font-display text-xl text-gold-300">
          {name || 'Sans nom'}
        </h3>
        <p className="text-cream-400 text-sm">
          {className || 'Classe non définie'}
        </p>
      </div>
    </div>
  );
}
