<?xml version="1.0" encoding="UTF-8"?>
<!--
  Human-friendly rendering of /rss.xml. Feed readers ignore this stylesheet
  and consume the raw XML; browsers apply it so a person who clicks "RSS"
  lands on a readable page instead of raw markup. Brand colours mirror the
  @theme tokens in src/styles/global.css (kept literal — XSLT can't read CSS).
-->
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:media="http://search.yahoo.com/mrss/">
  <xsl:output method="html" encoding="UTF-8" indent="yes"
    doctype-system="about:legacy-compat" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title><xsl:value-of select="/rss/channel/title" /> &#8212; RSS feed</title>
        <style>
          :root {
            --brand: #0c6e6d; --bg: #fafbfb; --alt: #eef1f1;
            --text: #14201f; --muted: #4b5857; --line: #d6dcdb;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --brand: #2dd4bf; --bg: #0b1413; --alt: #12201f;
              --text: #eaf0ef; --muted: #94a4a2; --line: #23302f;
            }
          }
          * { box-sizing: border-box; }
          body {
            margin: 0; background: var(--bg); color: var(--text);
            font-family: 'Hanken Grotesk Variable', system-ui, -apple-system, sans-serif;
            line-height: 1.6; font-size: 17px;
          }
          .wrap { max-width: 44rem; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }
          .kicker {
            font-family: ui-monospace, 'JetBrains Mono Variable', monospace;
            text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.72rem;
            color: var(--brand); margin: 0 0 0.5rem;
          }
          h1 { font-size: clamp(1.9rem, 5vw, 2.6rem); line-height: 1.1; margin: 0 0 0.75rem; font-weight: 600; }
          .lede { color: var(--muted); margin: 0 0 1.5rem; }
          .note {
            background: var(--alt); border: 1px solid var(--line);
            border-left: 2px solid var(--brand); border-radius: 0.25rem;
            padding: 0.9rem 1.1rem; margin: 0 0 2.5rem; font-size: 0.95rem; color: var(--muted);
          }
          .note code {
            font-family: ui-monospace, 'JetBrains Mono Variable', monospace;
            font-size: 0.85em; color: var(--text); word-break: break-all;
          }
          .count {
            font-family: ui-monospace, 'JetBrains Mono Variable', monospace;
            font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.12em;
            color: var(--muted); border-bottom: 1px solid var(--line);
            padding-bottom: 0.6rem; margin-bottom: 1.5rem;
          }
          ul { list-style: none; margin: 0; padding: 0; }
          li { padding: 1.25rem 0; border-bottom: 1px solid var(--line); }
          .date {
            font-family: ui-monospace, 'JetBrains Mono Variable', monospace;
            font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--brand);
          }
          h2 { font-size: 1.25rem; margin: 0.35rem 0 0.4rem; font-weight: 600; }
          h2 a { color: var(--text); text-decoration: none; }
          h2 a:hover { color: var(--brand); text-decoration: underline; }
          .desc { color: var(--muted); margin: 0; font-size: 0.98rem; }
          footer { margin-top: 2.5rem; font-size: 0.85rem; color: var(--muted); }
          footer a { color: var(--brand); }
        </style>
      </head>
      <body>
        <div class="wrap">
          <p class="kicker">RSS feed</p>
          <h1><xsl:value-of select="/rss/channel/title" /></h1>
          <p class="lede"><xsl:value-of select="/rss/channel/description" /></p>
          <div class="note">
            This is a web feed for the blog. Copy this page's address into a feed
            reader (e.g. NetNewsWire, Feedly, or Inoreader) to subscribe and get
            new posts automatically. Feed URL:
            <code><xsl:value-of select="/rss/channel/atom:link[@rel='self']/@href" /></code>
          </div>
          <p class="count">
            <xsl:value-of select="count(/rss/channel/item)" /> recent posts
          </p>
          <ul>
            <xsl:for-each select="/rss/channel/item">
              <li>
                <div class="date"><xsl:value-of select="substring(pubDate, 1, 16)" /></div>
                <h2><a href="{link}"><xsl:value-of select="title" /></a></h2>
                <p class="desc"><xsl:value-of select="description" /></p>
              </li>
            </xsl:for-each>
          </ul>
          <footer>
            &#8592; Back to <a href="{/rss/channel/link}"><xsl:value-of select="/rss/channel/link" /></a>
          </footer>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
