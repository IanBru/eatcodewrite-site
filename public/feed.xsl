<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <xsl:output method="html" doctype-system="about:legacy-doctype" encoding="UTF-8" indent="no"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title><xsl:value-of select="/rss/channel/title"/></title>
        <style type="text/css">
          body { font-family: system-ui, sans-serif; line-height: 1.5; max-width: 42rem; margin: 0 auto; padding: 1.5rem; color: #1a2526; background: #f8faf9; }
          h1 { font-size: 1.5rem; margin: 0 0 0.5rem 0; }
          .meta { font-size: 0.9rem; color: #4a5d5e; margin-bottom: 1.5rem; }
          .meta a { color: #2d6b5c; }
          ul { list-style: none; padding: 0; margin: 0; }
          li { border-bottom: 1px solid #dce8e4; padding: 1rem 0; }
          li:last-child { border-bottom: 0; }
          .item-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.25rem; }
          .item-title a { color: #1e5f8c; text-decoration: none; }
          .item-title a:hover { text-decoration: underline; }
          .item-date { font-size: 0.85rem; color: #4a5d5e; margin-bottom: 0.25rem; }
          .item-desc { font-size: 0.95rem; color: #2d3d2d; }
          .item-author { font-size: 0.85rem; color: #4a5d5e; }
        </style>
      </head>
      <body>
        <h1><xsl:value-of select="/rss/channel/title"/></h1>
        <p class="meta">
          <a href="{/rss/channel/link}"><xsl:value-of select="/rss/channel/link"/></a>
          <xsl:if test="/rss/channel/description"> · <xsl:value-of select="/rss/channel/description"/></xsl:if>
        </p>
        <ul>
          <xsl:for-each select="/rss/channel/item">
            <li>
              <div class="item-title"><a href="{link}"><xsl:value-of select="title"/></a></div>
              <xsl:if test="pubDate"><div class="item-date"><xsl:value-of select="pubDate"/></div></xsl:if>
              <xsl:if test="dc:creator"><div class="item-author"><xsl:value-of select="dc:creator"/></div></xsl:if>
              <xsl:if test="description"><div class="item-desc"><xsl:value-of select="description" disable-output-escaping="yes"/></div></xsl:if>
            </li>
          </xsl:for-each>
        </ul>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
