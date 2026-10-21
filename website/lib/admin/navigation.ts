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
  { href: "/admin/hubspot-contacts", label: "HubSpot contacts" },
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
  { href: "/admin/broadcast", label: "Broadcast" },
  { href: "/admin/attribution", label: "Attribution" },
  { href: "/admin/membership", label: "Membership" },
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
      { href: "/admin/hubspot-contacts", label: "HubSpot contacts" },
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
    id: "membership",
    label: "Membership",
    items: [{ href: "/admin/membership", label: "Members and Skool" }],
  },
  {
    id: "communications",
    label: "Communications",
    items: [
      { href: "/admin/email/sends", label: "Sends" },
      { href: "/admin/email/flows", label: "Flows" },
      { href: "/admin/email/templates", label: "Templates" },
      { href: "/admin/broadcast", label: "Broadcast" },
    ],
  },
  {
    id: "insights",
    label: "Insights",
    items: [{ href: "/admin/attribution", label: "Attribution" }],
  },
];

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}
