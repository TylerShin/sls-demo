import React, { FC } from "react";
import { Helmet } from "react-helmet";

const DefaultHelmet: FC = () => {
  return (
    <Helmet>
      <meta charSet="utf-8" />
      <meta name="theme-color" content="#3e7fff" />
      <link
        rel="shortcut icon"
        href="https://assets.pluto.network/scinapse/favicon.ico"
      />
      <link
        rel="search"
        href="https://scinapse.io/opensearch.xml"
        type="application/opensearchdescription+xml"
        title="Scinapse.io"
      />
      <title>Scinapse | Academic search engine for paper</title>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes"
      />
      <meta
        itemProp="name"
        content="Scinapse | Academic search engine for paper"
      />
      <meta
        name="description"
        content="Every research begins here. Find papers from over 170m papers in major STEM journals. Save time and never re-search."
      />
      <meta
        itemProp="image"
        content="http://assets.pluto.network/og-image.png"
      />
      <meta
        name="twitter:title"
        content="Scinapse | Academic search engine for paper"
      />
      <meta
        name="twitter:description"
        content="Every research begins here. Find papers from over 170m papers in major STEM journals. Save time and never re-search."
      />
      <meta name="twitter:card" content="Pluto Inc." />
      <meta name="twitter:site" content="@pluto_network" />
      <meta name="twitter:creator" content="@pluto_network" />
      <meta
        name="twitter:image"
        content="http://assets.pluto.network/og-image.png"
      />
      <meta
        property="og:title"
        content="Scinapse | Academic search engine for paper"
      />
      <meta
        property="og:description"
        content="Every research begins here. Find papers from over 170m papers in major STEM journals. Save time and never re-search."
      />
      <meta property="og:type" content="article" />
      <meta property="og:url" content="https://scinapse.io" />
      <meta
        property="og:image"
        content="http://assets.pluto.network/og-image.png"
      />
      <meta property="og:site_name" content="Scinapse" />
      <meta
        name="google-site-verification"
        content="YHiVYg7vff8VWXZge2D1aOZsT8rCUxnkjwbQqFT2QEI"
      />
      <meta name="msvalidate.01" content="55ADC81A3C8F5F3DAA9B90F27CA16E2B" />
      <link rel="manifest" href="/manifest.json" />
      <link
        rel="apple-touch-startup-image"
        href="https://assets.pluto.network/scinapse/app_icon/launch-640x1136.png"
        media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
      />
      <link
        rel="apple-touch-startup-image"
        href="https://assets.pluto.network/scinapse/app_icon/launch-750x1294.png"
        media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
      />
      <link
        rel="apple-touch-startup-image"
        href="https://assets.pluto.network/scinapse/app_icon/launch-1242x2148.png"
        media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
      />
      <link
        rel="apple-touch-startup-image"
        href="https://assets.pluto.network/scinapse/app_icon/launch-1125x2436.png"
        media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
      />
      <link
        rel="apple-touch-startup-image"
        href="https://assets.pluto.network/scinapse/app_icon/launch-1536x2048.png"
        media="(min-device-width: 768px) and (max-device-width: 1024px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)"
      />
      <link
        rel="apple-touch-startup-image"
        href="https://assets.pluto.network/scinapse/app_icon/launch-1668x2224.png"
        media="(min-device-width: 834px) and (max-device-width: 834px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)"
      />
      <link
        rel="apple-touch-startup-image"
        href="https://assets.pluto.network/scinapse/app_icon/launch-2048x2732.png"
        media="(min-device-width: 1024px) and (max-device-width: 1024px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)"
      />
    </Helmet>
  );
};

export default DefaultHelmet;
