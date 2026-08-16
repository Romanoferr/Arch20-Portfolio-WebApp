import { Helmet } from 'react-helmet-async'
import {
  LOCALE,
  OG_IMAGE,
  OG_IMAGE_ALT,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  SITE_NAME_SHORT,
  SITE_URL,
  TWITTER_HANDLE,
  type SeoProps,
} from '@/utils/seo'

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
      <meta property="og:image:width" content={String(OG_IMAGE_WIDTH)} />
      <meta property="og:image:height" content={String(OG_IMAGE_HEIGHT)} />
      <meta property="og:image:alt" content={OG_IMAGE_ALT} />
      <meta property="og:locale" content={LOCALE} />
      <meta property="og:site_name" content={SITE_NAME_SHORT} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={OG_IMAGE_ALT} />

      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Children (additional tags) */}
      {children}
    </Helmet>
  )
}