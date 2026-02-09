export const ROLE_CATEGORIES = [
  { key: 'lender', label: 'Lender' },
  { key: 'agent', label: 'Real Estate Agent' },
  { key: 'attorney', label: 'Attorney' },
  { key: 'title', label: 'Title / Escrow' },
  { key: 'inspector', label: 'Home Inspector' },
] as const;

export type RoleCategory = (typeof ROLE_CATEGORIES)[number]['key'];
