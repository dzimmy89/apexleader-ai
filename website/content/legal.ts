import { BRAND } from "@/lib/brand";
import { POSTAL_ADDRESS, isPostalAddressPlaceholder } from "@/content/site";

const MAILING = isPostalAddressPlaceholder() ? "" : `\n${POSTAL_ADDRESS}`;

// DRAFT: placeholder policy text for the new business. Have a lawyer review
// both policies before launch.

export const privacySections = [
  {
    title: "Information We Collect",
    body: `We collect information you give us when you open a lesson exercise, book a call, buy coaching, sign in or contact us, including your name, email, mobile number and payment details, which Stripe processes for us. When you arrive from a link we shared (for example on X), we note which link and lesson brought you so we can send follow-ups on the same topic.

We automatically collect log data (IP address, browser type, pages viewed) and may use cookies and analytics through Google Tag Manager and Google Analytics.`,
  },
  {
    title: "Coaching Calls and AI Processing",
    body: `Free discovery calls may be recorded and transcribed through Google Meet. We use the transcript to write the one-page plan we email you after the call. Coaching sessions may also be recorded and transcribed with your consent. ${BRAND.coachFirstName} may use Google's Gemini models, through our own Google Cloud account, to summarize a call and draft your plan. Recordings, transcripts and notes are used only to deliver your plan and coaching and are not used to train public AI models. You can ask us not to record a call, or to delete a recording, by emailing ${BRAND.email}.`,
  },
  {
    title: "Text Messages",
    body: `If you tick the box to get texts, we send up to about 3 texts over 12 days that follow up on the lesson you opened, plus replies to messages you send us. Message and data rates may apply. Reply STOP to stop at any time, or HELP for help.

No mobile information will be shared with third parties or affiliates for marketing or promotional purposes. Text messaging opt-in data and consent are not shared with any third parties. We share your number only with the service that delivers our texts (Twilio), to send them.

Giving your mobile number to open an exercise does not sign you up for texts; only the separate text box does.`,
  },
  {
    title: "Third-Party Services",
    body: `We use Stripe (payments), Google Workspace and Google Calendar (email, scheduling and call recordings), Google Cloud (hosting and AI processing), Twilio (text messages) and Telegram (optional messages with your coach). Coaching agreements are signed with our own electronic signature tool.`,
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
    body: `${BRAND.legalName} — ${BRAND.email}${MAILING}

Last Updated: November 10, 2026`,
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
    title: "Text Message Program",
    body: `${BRAND.name} lesson follow-ups: when you tick the text box on a lesson exercise, we send up to about 3 texts over 12 days about the topic of that lesson, from ${BRAND.coachFirstName}. Message frequency varies. Message and data rates may apply. Texts go out between 11am and 8pm Eastern.

Reply STOP to cancel at any time; you will get one message confirming you are unsubscribed. Reply HELP for help, or email ${BRAND.email}. Carriers are not liable for delayed or undelivered messages. Consent to texts is not a condition of any purchase. See our Privacy Policy for how we handle your number.`,
  },
  {
    title: "Recorded Calls",
    body: `Free discovery calls may be recorded and transcribed so we can send you a written one-page plan afterwards. By joining a discovery call you agree to the recording; if you would rather it is not recorded, tell us at the start of the call or email ${BRAND.email} beforehand.`,
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
    body: `Questions about these Terms: ${BRAND.email}${MAILING}

Last Updated: November 10, 2026`,
  },
] as const;
