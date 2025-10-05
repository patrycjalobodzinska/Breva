import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="pl">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#f18e8e" />

        <meta
          name="description"
          content="BREVA - Precyzyjna analiza objętości piersi z pomocą AI. Zaawansowana technologia do pomiaru asymetrii piersi."
        />
        <meta
          name="keywords"
          content="analiza piersi, AI, pomiar objętości, asymetria piersi, medycyna"
        />
        <meta name="author" content="BREVA" />

        <meta
          property="og:title"
          content="BREVA - Analiza piersi z pomocą AI"
        />
        <meta
          property="og:description"
          content="Precyzyjna analiza objętości piersi z pomocą sztucznej inteligencji"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://breva.vercel.app" />
        <meta property="og:image" content="/og-image.png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="BREVA - Analiza piersi z pomocą AI"
        />
        <meta
          name="twitter:description"
          content="Precyzyjna analiza objętości piersi z pomocą sztucznej inteligencji"
        />
        <meta name="twitter:image" content="/og-image.png" />

        <link rel="icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/manifest.json" />

        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BREVA" />

        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="BREVA" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
