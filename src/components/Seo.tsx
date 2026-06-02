/**
 * Seo — métadonnées <head> par route.
 * S'appuie sur le support natif de React 19 : les balises <title>/<meta>/<link>
 * rendues dans un composant sont automatiquement hissées dans le <head>.
 * Aucune dépendance externe requise.
 */
import React from 'react';

const SITE_URL = 'https://ibc.ci';

interface SeoProps {
  title: string;
  description?: string;
  /** Chemin canonique, ex: "/establishments" */
  path?: string;
  noIndex?: boolean;
}

export const Seo: React.FC<SeoProps> = ({ title, description, path = '/', noIndex }) => {
  const url = `${SITE_URL}${path}`;
  return (
    <>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
    </>
  );
};
