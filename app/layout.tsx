import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Searching for Sakamoto — Music & Art Project by Serge Colbert & Valentina Urbini',
  description:
    'Searching for Sakamoto is a scenic and musical experience inspired by Ryuichi Sakamoto (1952–2023), created by composer Serge Colbert and director Valentina Urbini.',
  keywords:
    'Ryuichi Sakamoto, Searching for Sakamoto, Serge Colbert, Valentina Urbini, music art project, scenic experience, immersive performance, sound art, Iceland',
  openGraph: {
    title: 'Searching for Sakamoto',
    description:
      'A scenic and musical experience inspired by Ryuichi Sakamoto, by Serge Colbert and Valentina Urbini.',
    url: 'https://www.searchingforsakamoto.com',
    type: 'website',
    locale: 'en_US',
    images: ['/images/en/desktop/page-1.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Searching for Sakamoto',
    description: 'A scenic and musical experience inspired by Ryuichi Sakamoto.',
    images: ['/images/en/desktop/page-1.webp'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" translate="no">
      <head>
        <meta name="google" content="notranslate" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebSite',
                  name: 'Searching for Sakamoto',
                  url: 'https://www.searchingforsakamoto.com',
                },
                {
                  '@type': 'CreativeWork',
                  name: 'Searching for Sakamoto',
                  description:
                    'A scenic and musical experience inspired by Ryuichi Sakamoto (1952–2023).',
                  url: 'https://www.searchingforsakamoto.com',
                  creator: [
                    { '@type': 'Person', name: 'Serge Colbert', jobTitle: 'Composer and Music Producer' },
                    { '@type': 'Person', name: 'Valentina Urbini', jobTitle: 'Director and Concept Artist' },
                  ],
                  about: {
                    '@type': 'Person',
                    name: 'Ryuichi Sakamoto',
                    birthDate: '1952',
                    deathDate: '2023',
                  },
                  inLanguage: ['en', 'fr'],
                  genre: ['Sound Art', 'Immersive Performance', 'Scenic Experience'],
                },
              ],
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
