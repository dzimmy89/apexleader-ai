export interface AdminNavItem {
  href: string;
  label: string;
}

export interface AdminNavGroup {
  id: string;
  label: string;
  items: AdminNavItem[];
}

/** Flat list for backwards compatibility */
export const adminNav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/people", label: "People" },
  { href: "/admin/coaching", label: "Pipeline" },
  { href: "/admin/coaching/payments-due", label: "Payments due" },
  { href: "/admin/coaching/clients", label: "Clients" },
  { href: "/admin/coaching/syllabi", label: "Syllabi" },
  { href: "/admin/coaching/sessions", label: "Sessions" },
  { href: "/admin/coaching/sessions-calendar", label: "Calendar" },
  { href: "/admin/coaching/contracts", label: "Contracts" },
  { href: "/admin/coaching/packages", label: "Packages" },
  { href: "/admin/email/sends", label: "Sends" },
  { href: "/admin/email/flows", label: "Flows" },
  { href: "/admin/email/templates", label: "Templates" },
] as const;

export const adminNavGroups: AdminNavGroup[] = [
  {
    id: "home",
    label: "Home",
    items: [{ href: "/admin", label: "Overview" }],
  },
  {
    id: "contacts",
    label: "Contacts",
    items: [
      { href: "/admin/people", label: "People" },
    ],
  },
  {
    id: "pipeline",
    label: "Pipeline",
    items: [
      { href: "/admin/coaching", label: "Pipeline" },
      { href: "/admin/coaching/payments-due", label: "Payments due" },
    ],
  },
  {
    id: "delivery",
    label: "Delivery",
    items: [
      { href: "/admin/coaching/clients", label: "Clients" },
      { href: "/admin/coaching/syllabi", label: "Syllabi" },
      { href: "/admin/coaching/sessions", label: "Sessions" },
      { href: "/admin/coaching/sessions-calendar", label: "Calendar" },
      { href: "/admin/coaching/contracts", label: "Contracts" },
      { href: "/admin/coaching/packages", label: "Packages" },
    ],
  },
  {
    id: "communications",
    label: "Communications",
    items: [
      { href: "/admin/email/sends", label: "Sends" },
      { href: "/admin/email/flows", label: "Flows" },
      { href: "/admin/email/templates", label: "Templates" },
    ],
  },
];

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}
