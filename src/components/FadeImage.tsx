import React, { useRef, useState, useEffect } from 'react';
import { Palmtree } from 'lucide-react';

type Props = React.ImgHTMLAttributes<HTMLImageElement>;

/**
 * Image avec fondu d'apparition au chargement.
 * - Gère les images déjà en cache (img.complete) — sinon onLoad ne se déclenche pas.
 * - En cas d'échec de chargement (réseau/URL morte), affiche un placeholder de
 *   marque propre au lieu de l'icône "image cassée".
 */
export const FadeImage: React.FC<Props> = ({ className = '', style, onLoad, alt, ...rest }) => {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const img = ref.current;
    if (img?.complete) {
      if (img.naturalWidth > 0) setLoaded(true);
      else setFailed(true);
    }
  }, []);

  if (failed) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-gradient-to-br from-green-dark/15 via-cream to-gold/10`}
        style={style}
        role="img"
        aria-label={alt}
      >
        <Palmtree className="text-gold/50" size={36} />
      </div>
    );
  }

  return (
    <img
      ref={ref}
      {...rest}
      alt={alt}
      loading={rest.loading ?? 'lazy'}
      decoding="async"
      onLoad={(e) => { setLoaded(true); onLoad?.(e); }}
      onError={() => setFailed(true)}
      style={{ ...style, backgroundColor: loaded ? undefined : 'rgba(201,168,76,0.06)' }}
      className={`${className} transition-opacity duration-700 ease-out ${loaded ? 'opacity-100' : 'opacity-0'}`}
    />
  );
};
