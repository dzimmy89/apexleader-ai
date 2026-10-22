export type FlowStatus = "active" | "completed" | "exited";

export type FlowType = "coaching_nurture" | "coaching_post_call";

export interface FlowStep {
  stepId: string;
  sendAt: string;
  sentAt: string | null;
  skipped: boolean;
  attemptCount?: number;
  lastAttemptAt?: string | null;
  lastError?: string | null;
  /** Set while a send is in flight so cron retries cannot double-send. */
  sendClaimedAt?: string | null;
  /** Opaque lease id written with sendClaimedAt; markStepSent must match it. */
  sendClaimId?: string | null;
  /** Gmail message id copied from the durable send receipt. */
  gmailMessageId?: string | null;
}

export interface FlowDoc {
  id?: string;
  userId: string;
  email: string;
  flowType: FlowType;
  status: FlowStatus;
  triggeredAt: string;
  lastFlowEmailSentAt?: string | null;
  exitReason?: string | null;
  steps: FlowStep[];
}

export interface LeadDoc {
  email: string;
  source?: string;
  sources?: string[];
  leadMagnet?: string;
  persona?: string;
  name?: string;
  firstName?: string;
  nameLower?: string;
  captureCount?: number;
  emailOptIn?: boolean;
  unsubscribeToken?: string;
  status?:
    | "pending"
    | "confirmed"
    | "unsubscribed"
    | "bounced"
    | "complained";
  consent?: {
    given: boolean;
    textVersion: string;
    formSource: string;
    ip?: string;
    userAgent?: string;
    requestedAt: string;
    confirmedAt?: string;
  };
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
  lastUtm?: LeadDoc["utm"];
  referrer?: string;
  landingPath?: string;
  unsubscribedAt?: string;
  unsubscribeMethod?: "link" | "one_click" | "reply" | "admin";
  lastConfirmEmailAt?: string;
  lastConfirmEmailSentAt?: string;
  lastConfirmAttemptAt?: string;
  lastConfirmError?: string | null;
  createdAt?: string | { toDate?: () => Date };
  lastSeenAt?: string | { toDate?: () => Date };
  tier?: string;
  selfSignup?: boolean;
  signupOrigin?: "public_form" | "checkout";
  selfSignupSource?: string;
  selfSignupAt?: string;
  canonicalEmail?: string;
}

export interface EmailLogDoc {
  to: string;
  subject: string;
  status: "sent" | "failed" | "skipped";
  source: string;
  sentAt: string;
  stepId?: string;
  flowType?: string;
  flowDocId?: string;
  userId?: string;
  error?: string;
}

export interface CoachingApplication {
  id?: string;
  email: string;
  name?: string;
  // Extended pipeline statuses (Phase 7 kanban).
  // Legacy 5-stage values are kept as a subset for backward compatibility.
  status:
    | "new"
    | "applied"
    | "scheduled"
    | "contacted"
    | "qualified"
    | "proposal_sent"
    | "won"
    | "lost";
  notes?: string;
  source?: string;
  packageId?: string;
  // Set when a discovery call is booked (Phase 2).
  discoveryCallId?: string;
  discoveryCallAt?: string;
  // Set when an application form is submitted (Phase 8).
  applicationData?: {
    capital?: string;
    experience?: string;
    goals?: string;
    timeCommitment?: string;
    howHeard?: string;
  };
  // CRM ops fields.
  nextActionAt?: string;
  assignedCoach?: string;
  closeValue?: number;
  lossReason?: string;
  createdAt?: string;
  updatedAt?: string;
}
