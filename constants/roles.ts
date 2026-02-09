export const ROLE_CATEGORIES = [
  { key: 'lender', label: 'Lender' },
  { key: 'real_estate_agent', label: 'Real Estate Agent' },
  { key: 'attorney', label: 'Attorney' },
  { key: 'title_escrow', label: 'Title / Escrow' },
  { key: 'home_inspector', label: 'Home Inspector' },
] as const;

export type RoleCategory = (typeof ROLE_CATEGORIES)[number]['key'];
