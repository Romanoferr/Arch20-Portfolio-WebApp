import { Helmet } from 'react-helmet-async'
import { LOCALE, OG_IMAGE, SITE_URL, type SeoProps } from '@/utils/seo'

interface SEOProps extends SeoProps {
  children?: React.ReactNode
}

export function SEO({
  title,
  description,
  canonical = SITE_URL,
  ogType = 'website',
  ogImage = OG_IMAGE,
  noIndex = false,
  children,
}: SEOProps) {
  return (
    <Helmet>
      {/* Title */}
      <title>{title}</title>
      <meta property="og:title" content={title} />
      <meta name="twitter:title" content={title} />

      {/* Description */}
      <meta name="description" content={description} />
      <meta property="og:description" content={description} />
      <meta name="twitter:description" content={description} />

      {/* Canonical */}
      <link rel="canonical" href={canonical} />
      <meta property="og:url" content={canonical} />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={LOCALE} />
      <meta property="og:site_name" content={title.split('|')[0]?.trim() || title} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={ogImage} />

      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Children (additional tags) */}
      {children}
    </Helmet>
  )
}