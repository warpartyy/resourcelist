import type { EngagementEvent, EngagementRecipient, QueuedEmail } from "../types";
import type { EngagementEmailTemplate } from "./templates";

const queuedEmails: QueuedEmail[] = [];

export function queueEmailNotification({
  event,
  recipient,
  templateName,
  template,
}: {
  event: EngagementEvent;
  recipient: EngagementRecipient;
  templateName: string;
  template: EngagementEmailTemplate;
}): QueuedEmail | null {
  if (!recipient.email) {
    return null;
  }

  const email: QueuedEmail = {
    id: createQueuedEmailId(),
    to: recipient.email,
    subject: template.subject,
    text: template.text,
    html: template.html,
    template: templateName,
    eventId: event.id,
    queuedAt: new Date().toISOString(),
  };

  queuedEmails.push(email);
  return email;
}

export function getQueuedEngagementEmails(): QueuedEmail[] {
  return [...queuedEmails];
}

function createQueuedEmailId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `queued-email-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
