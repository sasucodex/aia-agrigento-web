import nodemailer, { type Transporter } from "nodemailer";
import * as fs from "node:fs";
import * as path from "node:path";
import {
  EMAIL_NOREPLY_ADDRESS,
  type PreparedEmailMessage,
} from "@/lib/emails/baseLayout";

export const SMTP_ERROR_USER_MESSAGE =
  "Si è verificato un problema tecnico durante l'invio della comunicazione. Riprova tra qualche istante o contatta direttamente la segreteria su WhatsApp.";

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
}

function readEnvFromFile(key: string): string | undefined {
  try {
    if (typeof process !== "undefined" && typeof process.cwd === "function") {
      const cwd = process.cwd();
      for (const envFileName of [".env.local", ".env"]) {
        const fullPath = path.join(cwd, envFileName);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, "utf-8");
          const lines = content.split("\n");
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
              const eqIdx = trimmed.indexOf("=");
              const varName = trimmed.slice(0, eqIdx).trim();
              if (varName === key) {
                let val = trimmed.slice(eqIdx + 1).trim();
                if (
                  (val.startsWith('"') && val.endsWith('"')) ||
                  (val.startsWith("'") && val.endsWith("'"))
                ) {
                  val = val.slice(1, -1);
                }
                if (val.length > 0) {
                  return val;
                }
              }
            }
          }
        }
      }
    }
  } catch {
    // Ignore in browser/restricted environments
  }
  return undefined;
}

function readEnvVar(key: string): string | undefined {
  const metaEnv = (
    import.meta as unknown as { env?: Record<string, string | undefined> }
  ).env;
  const fromMeta = metaEnv?.[key];
  if (typeof fromMeta === "string" && fromMeta.trim().length > 0) {
    return fromMeta.trim();
  }
  const fromProcess =
    typeof process !== "undefined" ? process.env?.[key] : undefined;
  if (typeof fromProcess === "string" && fromProcess.trim().length > 0) {
    return fromProcess.trim();
  }
  return readEnvFromFile(key);
}

function getSmtpConfig(): SmtpConfig {
  const host = readEnvVar("SMTP_HOST") ?? "smtps.aruba.it";
  const rawPort = readEnvVar("SMTP_PORT");
  const parsedPort = rawPort ? Number(rawPort) : 465;
  const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 465;

  const rawSecure = readEnvVar("SMTP_SECURE");
  const secure =
    rawSecure !== undefined
      ? rawSecure.toLowerCase() === "true" || rawSecure === "1"
      : port === 465;

  const user = readEnvVar("SMTP_USER") ?? EMAIL_NOREPLY_ADDRESS;
  const pass = readEnvVar("SMTP_PASS") ?? "";

  if (!pass) {
    throw new Error(
      "Configurazione SMTP mancante: la variabile d'ambiente SMTP_PASS non è impostata.",
    );
  }

  return { host, port, secure, user, pass };
}

const EMAIL_LOGO_BASE64 =
  "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";

function getEmailLogoAttachment(): {
  filename: string;
  content: Buffer;
  cid: string;
  contentType: string;
} {
  const cwd =
    typeof process !== "undefined" && typeof process.cwd === "function"
      ? process.cwd()
      : "";
  const candidatePaths = [
    path.join(cwd, "public/images/email-logo.png"),
    path.join(cwd, "public/favicon.png"),
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      try {
        return {
          filename: "logo-aia-agrigento.png",
          content: fs.readFileSync(candidate),
          cid: "logo-aia-agrigento",
          contentType: "image/png",
        };
      } catch {
        // Fallback to built-in buffer below
      }
    }
  }

  return {
    filename: "logo-aia-agrigento.png",
    content: Buffer.from(EMAIL_LOGO_BASE64, "base64"),
    cid: "logo-aia-agrigento",
    contentType: "image/png",
  };
}

let cachedTransporter: Transporter | null = null;
let cachedConfigSignature = "";

function getTransporter(): Transporter {
  const config = getSmtpConfig();
  const signature = `${config.host}:${config.port}:${config.secure}:${config.user}:${config.pass}`;

  if (cachedTransporter && cachedConfigSignature === signature) {
    return cachedTransporter;
  }

  // Nota: in ambienti serverless (es. Vercel), NON si usa la connessione persistente a pool (pool: true)
  // perché quando il container va in idle/freezing, il server SMTP chiude il socket TCP causando
  // errori ECONNRESET o broken pipe alle chiamate successive. La connessione standard apre e chiude
  // la sessione TLS in modo pulito a ogni richiesta.
  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  cachedConfigSignature = signature;
  return cachedTransporter;
}

export async function sendEmail(message: PreparedEmailMessage): Promise<void> {
  const transporter = getTransporter();
  const logoAttachment = getEmailLogoAttachment();

  await transporter.sendMail({
    from: message.from,
    to: message.to,
    replyTo: message.replyTo,
    subject: message.subject,
    text: message.text,
    html: message.html,
    attachments: [logoAttachment],
  });
}

export async function sendFormDualEmails(params: {
  userConfirmation: PreparedEmailMessage;
  sectionNotification: PreparedEmailMessage;
}): Promise<void> {
  const transporter = getTransporter();
  const logoAttachment = getEmailLogoAttachment();

  await transporter.sendMail({
    from: params.sectionNotification.from,
    to: params.sectionNotification.to,
    replyTo: params.sectionNotification.replyTo,
    subject: params.sectionNotification.subject,
    text: params.sectionNotification.text,
    html: params.sectionNotification.html,
    attachments: [logoAttachment],
  });

  await transporter.sendMail({
    from: params.userConfirmation.from,
    to: params.userConfirmation.to,
    replyTo: params.userConfirmation.replyTo,
    subject: params.userConfirmation.subject,
    text: params.userConfirmation.text,
    html: params.userConfirmation.html,
    attachments: [logoAttachment],
  });
}

export function isHoneypotTriggered(rawBody: Record<string, unknown>): boolean {
  const candidates = [rawBody.website, rawBody.organization];
  return candidates.some(
    (value) => typeof value === "string" && value.trim().length > 0,
  );
}
