import sgMail, { MailDataRequired } from "@sendgrid/mail";

import { env } from "../env";

sgMail.setApiKey(env.SENDGRID_API_KEY);

export type SendEmailInput = {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
  categories?: string[];
  customArgs?: Record<string, string>;
};

export async function sendTransactionalEmail(payload: SendEmailInput) {
  const message: MailDataRequired = {
    to: payload.to,
    from: payload.from,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
    categories: payload.categories,
    customArgs: payload.customArgs,
  };

  await sgMail.send(message);
}
