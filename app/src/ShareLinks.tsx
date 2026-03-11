import { useState } from 'react';

export type ShareType = 'blog' | 'recipe';

interface ShareLinksProps {
  url: string;
  title: string;
  type?: ShareType;
}

function encodeUri(s: string): string {
  return encodeURIComponent(s);
}

export default function ShareLinks({ url, title, type = 'blog' }: ShareLinksProps) {
  const [copied, setCopied] = useState(false);

  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeUri(url)}&text=${encodeUri(title)}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeUri(url)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const canShare = typeof navigator !== 'undefined' && navigator.share;

  const handleNativeShare = async () => {
    if (!canShare) return;
    try {
      await navigator.share({ title, url });
    } catch {
      // ignore
    }
  };

  const linkClass = type === 'recipe' ? 'ecw-share-link ecw-share-link--eat' : 'ecw-share-link ecw-share-link--code';

  return (
    <div className="ecw-share-links" role="region" aria-label="Share">
      <span className="ecw-share-label">Share:</span>
      <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className={linkClass} aria-label="Share on X (Twitter)">
        Share on X
      </a>
      <a href={linkedInUrl} target="_blank" rel="noopener noreferrer" className={linkClass} aria-label="Share on LinkedIn">
        LinkedIn
      </a>
      <button type="button" onClick={handleCopy} className={`${linkClass} ecw-share-copy`} aria-label="Copy link">
        {copied ? 'Copied' : 'Copy link'}
      </button>
      {canShare && (
        <button type="button" onClick={handleNativeShare} className={`${linkClass} ecw-share-copy`} aria-label="Share">
          Share
        </button>
      )}
    </div>
  );
}
