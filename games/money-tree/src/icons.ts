const artwork: Record<string, string> = {
  money:
    '<path d="M18 23h76v43H18z" fill="#638b55"/><path d="M24 29h76v43H24z" fill="#a3c97c" stroke="#355c40" stroke-width="3"/><path d="M32 37h60v27H32z" fill="none" stroke="#557b4b" stroke-width="2"/><text x="62" y="61" text-anchor="middle" fill="#355c40" font-size="29" font-family="Georgia">$</text><path d="M18 78h83" stroke="#d1d0ae" stroke-width="4"/>',
  seeds:
    '<path d="M39 20h42l8 12-5 49H33l-5-49z" fill="#c4a375" stroke="#876e4c" stroke-width="3"/><path d="M39 20l4 13h31l7-13M30 36h57" fill="none" stroke="#876e4c" stroke-width="3"/><path d="M43 46h30v24H43z" fill="#98bc76" stroke="#54724b" stroke-width="2"/><text x="58" y="65" text-anchor="middle" fill="#355c40" font-size="21" font-family="Georgia">$</text><ellipse cx="94" cy="76" rx="5" ry="3" fill="#6d5638"/><ellipse cx="100" cy="67" rx="4" ry="3" fill="#896e45"/>',
  shovel:
    '<path d="M46 10h28v11c0 17-28 17-28 0z" fill="none" stroke="#537365" stroke-width="6" stroke-linejoin="round"/><path d="M60 33v35" stroke="#ba9160" stroke-width="8"/><path d="M42 60h36v16L60 92 42 76z" fill="#a9b6b0" stroke="#697e78" stroke-width="3"/><path d="M60 64v17" stroke="#d8e1d6" stroke-width="3"/>',
  can: '<ellipse cx="29" cy="44" rx="16" ry="19" fill="none" stroke="#668f83" stroke-width="7"/><path d="M70 52l25-17 10 8-30 30" fill="#91b7a5" stroke="#668f83" stroke-width="3"/><path d="M36 37h41v38c0 16-41 16-41 0z" fill="#91b7a5" stroke="#668f83" stroke-width="3"/><path d="M44 34v-5c0-16 25-16 25 0v5" fill="none" stroke="#668f83" stroke-width="5"/><ellipse cx="57" cy="38" rx="21" ry="6" fill="#aecbbe"/><ellipse cx="103" cy="39" rx="6" ry="10" transform="rotate(-35 103 39)" fill="#668f83"/><path d="M112 54l3 5m-8 0 2 5" stroke="#98c6d0" stroke-width="3" stroke-linecap="round"/>',
  bed: '<path d="M15 35l52-12 40 18-50 18z" fill="#6c583e"/><path d="M15 35v30l42 22V59zm42 24v28l50-23V41z" fill="#bc966a" stroke="#785a3d" stroke-width="3"/><path d="M22 51l30 16m12 6 35-17" stroke="#936c46" stroke-width="2"/>',
  soil: '<path d="M33 15h48l-4 15 12 48q0 12-13 12H39q-12 0-12-12l10-48z" fill="#aa885d" stroke="#795c3a" stroke-width="3"/><rect x="38" y="40" width="42" height="32" rx="5" fill="#f4e5bd"/><path d="M43 63q15-23 32 0z" fill="#705039"/><circle cx="54" cy="56" r="2" fill="#bb9266"/>',
  fertilizer:
    '<path d="M38 15h45l-5 13 10 48q0 9-10 9H38q-10 0-10-9l10-48z" fill="#dcc28c" stroke="#a78b5d" stroke-width="3"/><path d="M38 27h40" stroke="#a78b5d" stroke-width="4"/><rect x="38" y="40" width="41" height="30" rx="7" fill="#f1e8c4"/><path d="M59 65V51m0 7q-17 0-14-12 14 0 14 12m0-5q0-12 14-12 2 12-14 12" fill="#88ab75" stroke="#597e54" stroke-width="2"/>',
};
export function inventoryIcon(id: string) {
  return `<svg viewBox="0 0 120 100" aria-hidden="true" focusable="false">${artwork[id] ?? ""}</svg>`;
}
