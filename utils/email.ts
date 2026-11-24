import nodemailer, { type Transporter } from 'nodemailer';
import { SITE_URL, SUPPORT_EMAIL } from './constants';

const DEFAULT_SMTP_SERVICE = 'gmail';
const DEFAULT_SENDER_NAME = 'Revisionist';

export interface EmailConfig {
  user: string;
  pass: string;
  from: string;
  host?: string;
  port?: number;
  secure?: boolean;
}

export interface EmailSendResult {
  sent: boolean;
  messageId?: string;
  error?: string;
}

let cachedTransporter: Transporter | null = null;
let cachedConfigKey: string | null = null;

function resolveEmailConfig(): EmailConfig | null {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!user || !pass) {
    return null;
  }

  const host = process.env.SMTP_HOST?.trim() || undefined;
  const portRaw = process.env.SMTP_PORT?.trim();
  const port = portRaw ? Number.parseInt(portRaw, 10) : undefined;
  const secure = process.env.SMTP_SECURE === 'true';
  const from =
    process.env.SMTP_FROM?.trim() || `${DEFAULT_SENDER_NAME} <${user}>`;

  return {
    user,
    pass,
    from,
    host,
    port: Number.isNaN(port) ? undefined : port,
    secure,
  };
}

function getTransporter(config: EmailConfig): Transporter {
  const configKey = `${config.host ?? DEFAULT_SMTP_SERVICE}|${config.port ?? ''}|${config.user}`;

  if (cachedTransporter && cachedConfigKey === configKey) {
    return cachedTransporter;
  }

  cachedTransporter = config.host
    ? nodemailer.createTransport({
        host: config.host,
        port: config.port ?? 587,
        secure: config.secure ?? false,
        auth: {
          user: config.user,
          pass: config.pass,
        },
      })
    : nodemailer.createTransport({
        service: DEFAULT_SMTP_SERVICE,
        auth: {
          user: config.user,
          pass: config.pass,
        },
      });

  cachedConfigKey = configKey;
  return cachedTransporter;
}

export function buildReportUrl(route: string): string {
  const normalizedRoute = route.replace(/^\/+/, '');
  return `${SITE_URL}/${normalizedRoute}`;
}

export function buildReportEmailText(route: string, title: string): string {
  const displayTitle = title.trim() || 'your manuscript';
  const reportUrl = buildReportUrl(route);

  return [
    'Hi,',
    '',
    `Thank you for using Revisionist to analyse the manuscript of ${displayTitle}. Your detailed report is now available at: ${reportUrl}`,
    '',
    `If you have any questions, please visit our FAQ page at ${SITE_URL}/faq or contact us at ${SUPPORT_EMAIL}.`,
    '',
    'We appreciate your trust in Revisionist and look forward to helping you refine your manuscript.',
    '',
    'Best regards,',
    '',
    'The Revisionist Team',
  ].join('\n');
}

export async function verifyEmailConnection(
  customTransporter?: Transporter
): Promise<boolean> {
  if (customTransporter) {
    await customTransporter.verify();
    return true;
  }

  const config = resolveEmailConfig();
  if (!config) {
    console.error(
      'Email configuration missing: set SMTP_USER and SMTP_PASS environment variables.'
    );
    return false;
  }

  try {
    const transporter = getTransporter(config);
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('SMTP verification failed:', error);
    return false;
  }
}

export async function sendReportEmail(
  recipientEmail: string,
  route: string,
  title: string,
  customTransporter?: Transporter
): Promise<EmailSendResult> {
  const trimmedRecipient = recipientEmail.trim();
  if (!trimmedRecipient || trimmedRecipient.toLowerCase() === 'none') {
    return {
      sent: false,
      error: 'No recipient email provided',
    };
  }

  const config = resolveEmailConfig();
  if (!customTransporter && !config) {
    const message =
      'Email skipped: SMTP_USER and SMTP_PASS environment variables are not configured.';
    console.error(message);
    return {
      sent: false,
      error: message,
    };
  }

  const transporter = customTransporter ?? getTransporter(config!);
  const fromAddress =
    config?.from ?? `${DEFAULT_SENDER_NAME} <${SUPPORT_EMAIL}>`;
  const displayTitle = title.trim() || 'Untitled Manuscript';

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      replyTo: SUPPORT_EMAIL,
      to: trimmedRecipient,
      subject: `Revisionist manuscript review - ${displayTitle}`,
      text: buildReportEmailText(route, displayTitle),
    });

    return {
      sent: true,
      messageId: info.messageId,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error sending email:', error);
    return {
      sent: false,
      error: message,
    };
  }
}
