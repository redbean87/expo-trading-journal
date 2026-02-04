export type TextSegment = {
  type: 'text' | 'url';
  content: string;
};

const URL_REGEX = /(?:https?:\/\/|www\.)[^\s<>[\]{}|\\^`"']+(?<![.,;:!?)])/gi;

export function parseTextWithUrls(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let lastIndex = 0;

  const matches = text.matchAll(URL_REGEX);

  for (const match of matches) {
    const matchIndex = match.index!;
    const matchText = match[0];

    if (matchIndex > lastIndex) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, matchIndex),
      });
    }

    segments.push({
      type: 'url',
      content: matchText,
    });

    lastIndex = matchIndex + matchText.length;
  }

  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return segments;
}

export function normalizeUrl(url: string): string {
  if (url.startsWith('www.')) {
    return `https://${url}`;
  }
  return url;
}
