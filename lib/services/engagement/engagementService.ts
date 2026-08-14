import { createEngagementEvent } from "./events/eventFactory";
import {
  renderAdminMentionEmail,
  renderMonthlyImpactEmail,
  renderResourceSubmittedEmail,
  renderWeeklyDigestEmail,
} from "./email/templates";
import { queueEmailNotification } from "./email/queue";
import { createDashboardNotifications } from "./notifications/dashboardNotifications";
import {
  getAdminRecipients,
  getRecipientsById,
} from "./notifications/recipients";
import { sendEmail } from "@/lib/services/email/emailService";
import type {
  AdminMentionedPayload,
  EngagementActor,
  QueuedEmail,
  ResourceSubmittedPayload,
} from "./types";
import type {
  MonthlyImpactReportSummary,
  WeeklyDigestSummary,
} from "./digest/types";

export async function handleResourceSubmittedEngagement(
  payload: ResourceSubmittedPayload
) {
  const event = createEngagementEvent<ResourceSubmittedPayload>({
    type: "ResourceSubmitted",
    payload,
    deliveryChannels: ["dashboard", "email", "weekly_digest"],
  });
  const admins = await getAdminRecipients();

  await createDashboardNotifications(
    admins.map((admin) => ({
      userId: admin.id,
      type: "resource_submitted",
      resourceId: payload.resourceId,
      message: `New resource submitted: ${payload.organization}`,
    }))
  );

  const emails = await Promise.all(
    admins.map(async (admin) => {
      const email = queueEmailNotification({
        event,
        recipient: admin,
        templateName: "resource_submitted",
        template: renderResourceSubmittedEmail(event),
      });

      await sendQueuedEmail(email);
      return email;
    })
  );

  return {
    event,
    dashboardNotifications: admins.length,
    queuedEmails: emails.filter(Boolean).length,
    sentEmails: emails.filter(Boolean).length,
  };
}

export async function handleAdminMentionedEngagement({
  actor,
  payload,
}: {
  actor: EngagementActor;
  payload: AdminMentionedPayload;
}) {
  const event = createEngagementEvent<AdminMentionedPayload>({
    type: "AdminMentioned",
    actor,
    payload,
    deliveryChannels: ["dashboard", "email"],
  });
  const recipients = await getRecipientsById(payload.mentionedUserIds);

  await createDashboardNotifications(
    recipients.map((recipient) => ({
      userId: recipient.id,
      type: "mention",
      resourceId: payload.resourceId,
      commentId: payload.commentId,
      message: `${actor.displayName || actor.email || "An admin"} mentioned you on ${payload.resourceName}`,
    }))
  );

  const emails = await Promise.all(
    recipients.map(async (recipient) => {
      const email = queueEmailNotification({
        event,
        recipient,
        templateName: "admin_mention",
        template: renderAdminMentionEmail(event),
      });

      await sendQueuedEmail(email);
      return email;
    })
  );

  return {
    event,
    dashboardNotifications: recipients.length,
    queuedEmails: emails.filter(Boolean).length,
    sentEmails: emails.filter(Boolean).length,
  };
}

export async function sendWeeklyDigestEngagement(summary: WeeklyDigestSummary) {
  const event = createEngagementEvent<WeeklyDigestSummary>({
    type: "WeeklyDigest",
    payload: summary,
    deliveryChannels: ["email"],
  });
  const admins = await getAdminRecipients();
  const emails = await Promise.all(
    admins.map(async (admin) => {
      const email = queueEmailNotification({
        event,
        recipient: admin,
        templateName: "weekly_digest",
        template: renderWeeklyDigestEmail(summary),
      });

      await sendQueuedEmail(email);
      return email;
    })
  );

  return {
    event,
    queuedEmails: emails.filter(Boolean).length,
    sentEmails: emails.filter(Boolean).length,
  };
}

async function sendQueuedEmail(email: QueuedEmail | null) {
  if (!email) {
    return;
  }

  await sendEmail({
    to: email.to,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });
}

export async function sendMonthlyImpactReportEngagement(
  summary: MonthlyImpactReportSummary
) {
  const event = createEngagementEvent<MonthlyImpactReportSummary>({
    type: "MonthlyImpactReport",
    payload: summary,
    deliveryChannels: ["email"],
  });
  const admins = await getAdminRecipients();
  const queuedEmails = admins.map((admin) =>
    queueEmailNotification({
      event,
      recipient: admin,
      templateName: "monthly_impact",
      template: renderMonthlyImpactEmail(summary),
    })
  );

  return {
    event,
    queuedEmails: queuedEmails.filter(Boolean).length,
  };
}
