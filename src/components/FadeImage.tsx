import React, { useRef, useState, useEffect } from 'react';

type Props = React.ImgHTMLAttributes<HTMLImageElement>;

/**
 * Image avec fondu d'apparition au chargement (placeholder doux + opacité 0→1).
 * Gère le cas des images DÉJÀ en cache (où onLoad ne se déclenche pas) via
 * une vérification de img.complete au montage — sinon l'image resterait invisible.
 */
export const FadeImage: React.FC<Props> = ({ className = '', style, onLoad, ...rest }) => {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Image déjà chargée (cache) avant l'attache du handler React.
    if (ref.current?.complete && ref.current.naturalWidth > 0) setLoaded(true);
  }, []);

  return (
    <img
      ref={ref}
      {...rest}
      loading={rest.loading ?? 'lazy'}
      decoding="async"
      onLoad={(e) => { setLoaded(true); onLoad?.(e); }}
      onError={() => setLoaded(true)}
      style={{ ...style, backgroundColor: loaded ? undefined : 'rgba(201,168,76,0.06)' }}
      className={`${className} transition-opacity duration-700 ease-out ${loaded ? 'opacity-100' : 'opacity-0'}`}
    />
  );
};
