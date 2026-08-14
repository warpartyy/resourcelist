import { Resend } from "resend";
import type { SendEmailInput } from "./types";

let resendClient: Resend | null = null;

export async function sendEmail(input: SendEmailInput) {
  const resend = getResendClient();
  const from = getRequiredEnv("EMAIL_FROM");

  if (!input.to || (Array.isArray(input.to) && input.to.length === 0)) {
    throw new Error("Email recipient is required");
  }

  if (!input.subject.trim()) {
    throw new Error("Email subject is required");
  }

  if (!input.html && !input.text) {
    throw new Error("Email html or text content is required");
  }

  try {
    const content =
      input.html !== undefined
        ? { html: input.html, text: input.text }
        : { text: input.text as string };

    return await resend.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      ...content,
    });
  } catch (error) {
    console.error("Failed to send email", {
      to: input.to,
      subject: input.subject,
      error,
    });
    throw error;
  }
}

function getResendClient() {
  if (!resendClient) {
    resendClient = new Resend(getRequiredEnv("RESEND_API_KEY"));
  }

  return resendClient;
}

function getRequiredEnv(name: "RESEND_API_KEY" | "EMAIL_FROM") {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required to send application email`);
  }

  return value;
}
