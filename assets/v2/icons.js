const paths = {
  home: "M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
  map: "m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Zm6-3v15m6-12v15",
  plan: "M9 5H5v16h14V5h-4M9 3h6v4H9Zm0 9 2 2 4-4m-6 8h6",
  program: "M4 4h7v16H4zm9 0h7v16h-7M7 8h1m8 0h1M7 12h1m8 0h1",
  library: "M4 5h4v15H4zm6-2h4v17h-4zm7 2 4 14-3 1-4-14Z",
  spark: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z",
  heart: "M20 5c-3-3-6-1-8 1-2-2-5-4-8-1-5 5 2 11 8 15 6-4 13-10 8-15Z",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  check: "m5 12 4 4L19 6",
  plus: "M12 4v16M4 12h16",
  time: "M12 8v5l3 2M21 12a9 9 0 1 0-18 0 9 9 0 0 0 18 0",
  people:
    "M16 21v-3c0-4-12-4-12 0v3m14-8c4 0 4 2 4 5v3M14 7a4 4 0 1 0-8 0 4 4 0 0 0 8 0m3-3a4 4 0 0 1 0 8",
  leaf: "M20 3C8 3 1 10 6 16s15 1 14-13ZM4 21 16 8",
  audio:
    "M9 18V5l12-2v13M9 8l12-2M9 18c0 4-7 4-7 1s7-4 7-1Zm12-2c0 4-7 4-7 1s7-4 7-1Z",
  play: "m9 5 10 7-10 7Z",
  pause: "M8 5v14M16 5v14",
  stop: "M6 6h12v12H6Z",
  back: "m11 6-7 6 7 6M4 12h16",
  volume: "m3 9 5 0 5-4v14l-5-4H3Zm13-2c4 3 4 7 0 10",
  shield: "m12 3 8 3v6c0 5-8 9-8 9S4 17 4 12V6Zm-4 9 3 3 5-6",
  search: "M16 16l5 5M18 10a8 8 0 1 0-16 0 8 8 0 0 0 16 0",
  flower:
    "M12 11C3 7 9 0 12 6c3-6 9 1 0 5Zm0 1c9-6 14 2 5 4 3 7-7 7-5-4Zm-1 0c1 9-9 11-8 3-7-2-1-10 8-3Z",
  settings:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2",
  award: "m9 15-3 7 6-3 6 3-3-7M18 8a6 6 0 1 0-12 0 6 6 0 0 0 12 0",
  money: "M3 6h18v12H3ZM14 12a2 2 0 1 0-4 0 2 2 0 0 0 4 0M6 12h1m10 0h1",
  close: "m5 5 14 14M5 19 19 5",
};
export const icon = (name, size = 22) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ? `<path d="${paths[name]}"/>` : ""}</svg>`;
export const art = () =>
  `<svg viewBox="0 0 420 350" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="petal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#6f9275"/><stop offset="1" stop-color="#a8ba88"/></linearGradient><linearGradient id="sun" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d6b373"/><stop offset="1" stop-color="#e8cea5"/></linearGradient></defs><circle cx="213" cy="178" r="126" fill="#dde5cd"/><circle cx="213" cy="178" r="145" fill="none" stroke="#c7d6b9" stroke-dasharray="2 8"/><ellipse cx="210" cy="303" rx="86" ry="12" fill="#c5d1b6" opacity=".5"/><g class="art-float"><path d="M214 293c-1-40 10-77-2-120" stroke="#5d7e5a" stroke-width="4" fill="none"/><path d="M211 263c-54-2-84-28-85-53 43-8 79 16 85 53" fill="#829d6f"/><path d="M213 239c56 1 88-26 84-55-44-1-76 20-84 55" fill="#a2b380"/><g transform="translate(213 143)"><ellipse cx="0" cy="-37" rx="35" ry="51" fill="url(#petal)"/><ellipse cx="0" cy="-37" rx="35" ry="51" transform="rotate(72)" fill="#b0bf8c"/><ellipse cx="0" cy="-37" rx="35" ry="51" transform="rotate(144)" fill="#89a47b"/><ellipse cx="0" cy="-37" rx="35" ry="51" transform="rotate(216)" fill="#a2b58c"/><ellipse cx="0" cy="-37" rx="35" ry="51" transform="rotate(288)" fill="#6e9274"/><circle r="25" fill="url(#sun)"/><circle r="16" fill="none" stroke="#ac925b" stroke-dasharray="1 5"/></g></g><circle cx="334" cy="70" r="11" fill="#d6b789"/><circle cx="95" cy="110" r="5" fill="#a6b78c"/><path d="M317 254h18m-9-9v18" stroke="#8ca276" stroke-width="1.5"/></svg>`;
