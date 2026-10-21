import { BRAND } from "@/lib/brand";

// DRAFT: placeholder policy text for the new business. Have a lawyer review
// both policies before launch.

export const privacySections = [
  {
    title: "Information We Collect",
    body: `We collect information you give us when you book a call, buy coaching, sign in or contact us, including your name, email and payment details, which Stripe processes for us.

We automatically collect log data (IP address, browser type, pages viewed) and may use cookies and analytics through Google Tag Manager and Google Analytics.`,
  },
  {
    title: "Coaching Calls and AI Processing",
    body: `With your consent, coaching and discovery calls may be recorded and transcribed through Google Meet. ${BRAND.coachFirstName} may use Google's Gemini models, through our own Google Cloud account, to summarize a call and draft your coaching plan. These notes are used only to deliver your coaching and are not used to train public AI models.`,
  },
  {
    title: "Third-Party Services",
    body: `We use Stripe (payments), Google Workspace and Google Calendar (email, scheduling and call recordings), Google Cloud (hosting and AI processing) and Telegram (optional messages with your coach). Coaching agreements are signed with our own electronic signature tool.`,
  },
  {
    title: "How We Use Your Information",
    body: `We use your information to deliver coaching and courses, process payments, send messages about your coaching, improve our services and meet legal obligations. You can opt out of marketing emails at any time.`,
  },
  {
    title: "Your Privacy Rights",
    body: `You may ask to access, correct, delete or export your personal information by emailing ${BRAND.email}. California (CCPA) and European (GDPR) residents have additional rights.`,
  },
  {
    title: "Data Security & Retention",
    body: `We use HTTPS encryption, secure cloud storage and access controls. We keep data as long as we need it to provide services and meet legal obligations, and typically delete or anonymize it within 90 days of account closure.`,
  },
  {
    title: "Contact",
    body: `${BRAND.legalName} — ${BRAND.email}

Last Updated: DRAFT`,
  },
] as const;

export const termsSections = [
  {
    title: "Acceptance of Terms",
    body: `By using ${BRAND.name} services at ${BRAND.domain}, you agree to these Terms and our Privacy Policy. If you do not agree, do not use our services.`,
  },
  {
    title: "Coaching and Education",
    body: `${BRAND.name} provides private coaching and educational content on ${BRAND.subject}. We are not your employee, IT provider or legal advisor. You decide which tools to adopt and remain responsible for how your business uses them, including the data you put into third-party AI tools.`,
  },
  {
    title: "Eligibility",
    body: `You must be at least 18 years old. You are responsible for making sure your use of our services complies with the laws where you live and do business.`,
  },
  {
    title: "Payments",
    body: `Coaching packages are paid in full or in installments as listed on our coaching page and in your coaching agreement. Card payments are processed by Stripe; invoices may be paid by bank transfer. Coaching agreements are signed electronically under the ESIGN Act and UETA.`,
  },
  {
    title: "No Guarantees",
    body: `We make no guarantees about time saved, revenue or other business results. Outcomes depend on your business, your team and how the work is adopted.`,
  },
  {
    title: "Limitation of Liability",
    body: `To the maximum extent permitted by law, ${BRAND.legalName} is not liable for any indirect, incidental, special or consequential damages arising from your use of our services.`,
  },
  {
    title: "Contact",
    body: `Questions about these Terms: ${BRAND.email}

Last Updated: DRAFT`,
  },
] as const;
