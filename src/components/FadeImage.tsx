import React, { useState } from 'react';

type Props = React.ImgHTMLAttributes<HTMLImageElement>;

/**
 * Image avec fondu d'apparition au chargement (placeholder doux + opacité 0→1).
 * Accepte toutes les props d'un <img> standard.
 */
export const FadeImage: React.FC<Props> = ({ className = '', style, onLoad, ...rest }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      {...rest}
      loading={rest.loading ?? 'lazy'}
      decoding="async"
      onLoad={(e) => { setLoaded(true); onLoad?.(e); }}
      style={{ ...style, backgroundColor: loaded ? undefined : 'rgba(201,168,76,0.06)' }}
      className={`${className} transition-opacity duration-700 ease-out ${loaded ? 'opacity-100' : 'opacity-0'}`}
    />
  );
};
