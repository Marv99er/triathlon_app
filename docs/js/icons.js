const PATHS = {
  house: 'M3 11.5 12 4l9 7.5M5.5 10v9.5a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1V10',
  calendar: 'M4 9h16M7 3v4M17 3v4M5.5 5h13A1.5 1.5 0 0 1 20 6.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19.5v-13A1.5 1.5 0 0 1 5.5 5Z',
  list: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H5a2 2 0 0 0 0 4h1M16 6h3a2 2 0 0 1 0 4h-1M12 13v3m-3 4h6l-1-2.5h-4L9 20Z',
  plus: 'M12 5v14M5 12h14',
  gear: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.4 13.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1h-.2a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5V4a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1h.2a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z',
  ellipsis: 'M5 12h.01M12 12h.01M19 12h.01',
  chevronLeft: 'm15 18-6-6 6-6',
  chevronRight: 'm9 18 6-6-6-6',
  arrowDownDoc: 'M14 2H7a1.5 1.5 0 0 0-1.5 1.5v17A1.5 1.5 0 0 0 7 22h10a1.5 1.5 0 0 0 1.5-1.5V8l-6-6Z M14 2v5.5a1 1 0 0 0 1 1H20 M12 11v6m0 0 3-3m-3 3-3-3',
  pencil: 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19 3 20l1-4Z',
  trash: 'M4 7h16M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7m2 0v12.5A1.5 1.5 0 0 1 15.5 21h-7A1.5 1.5 0 0 1 7 19.5V7h10Z',
  repeat: 'M4 12a8 8 0 0 1 14-5.2M4 12a8 8 0 0 0 14 5.2M18 3v4h-4M6 21v-4h4',
  arrowUp: 'M12 19V5M6 11l6-6 6 6',
  arrowDown: 'M12 5v14M6 13l6 6 6-6',
  flagCheckered: 'M5 3v18M5 4h5l1 1h6l-1.5 3L17 11h-6l-1-1H5V4Z',
  docImage: 'M6 3h9l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z M15 3v4h4 M9 12.5 11 15l2-2.5 3 4H8Z M8.5 10.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
  check: 'M5 12l4 4 10-10',
  x: 'M6 6l12 12M18 6 6 18',
  download: 'M12 3v12m0 0 4-4m-4 4-4-4M5 19h14',
  upload: 'M12 21V9m0 0 4 4m-4-4-4 4M5 5h14',
  photo: 'M4 6h3l1.5-2h7L17 6h3a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1ZM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  medal: 'M8 3h8l-2.5 6h-3L8 3Z M12 14.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Z',
};

// Sport-Icons im Duotone-Stil: Outline plus weiche Flächen in der Sportfarbe
const WAVE = 'c1.7 1.2 3.3 1.2 5 0s3.3-1.2 5 0 3.3 1.2 5 0 3.3-1.2 5 0';
const GLYPHS = {
  swim: `<path d="M2 14.5${WAVE}V22H2Z" fill="currentColor" fill-opacity=".25" stroke="none"/><circle cx="17.5" cy="8.5" r="2" fill="currentColor"/><path d="M3.5 9.5 9 6.5l4.5 5.5M2 14.5${WAVE}M2 17.5${WAVE}M2 20.5${WAVE}"/>`,
  bike: '<circle cx="5.5" cy="16.5" r="3.5" fill="currentColor" fill-opacity=".25"/><circle cx="18.5" cy="16.5" r="3.5" fill="currentColor" fill-opacity=".25"/><path d="M5.5 16.5H12L9 9.5h7l2.5 7M12 16.5l4-7M9 9.5 5.5 16.5M7.5 7.5h3M16 9.5 15.3 7h2.2"/>',
  run: '<path d="M1.5 10h3M1 13.5h3.5M2.5 17h2" stroke-opacity=".4"/><circle cx="15" cy="4.5" r="1.75" fill="currentColor"/><path d="M13.5 8 10.5 14M7.5 10l3-2h3l2 3 3 1M10.5 14l3.5 2.5-1 4.5M10.5 14l-2 3.5-4 .5"/>',
  strength: '<rect x="5" y="6" width="3" height="12" rx="1.5" fill="currentColor" fill-opacity=".3"/><rect x="16" y="6" width="3" height="12" rx="1.5" fill="currentColor" fill-opacity=".3"/><path d="M3 10v4M21 10v4M8 12h8"/>',
};

export function icon(name, { size = 20, stroke } = {}) {
  const inner = GLYPHS[name] || `<path d="${PATHS[name] || PATHS.list}"/>`;
  const sw = stroke ?? (GLYPHS[name] ? 1.75 : 2);
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}
