import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import { db, performerApplicationsTable, emailSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";
import type { PerformerApplication } from "@workspace/db";

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  return createClient(url, key);
}

async function uploadFileToStorage(file: Express.Multer.File, folder: string): Promise<string> {
  const supabase = getSupabaseClient();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "vendor-uploads";
  const timestamp = Date.now();
  const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${folder}/${timestamp}-${safeName}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file.buffer, { contentType: file.mimetype, upsert: false });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

async function sendAdminNotificationEmail(app: PerformerApplication): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (!resendApiKey || !adminEmail) return;
  const { Resend } = await import("resend");
  const resend = new Resend(resendApiKey);
  const body = [
    `New performer application received — #${app.id}`,
    ``,
    `Performer:   ${app.performerName}`,
    `Type:        ${app.performanceType}`,
    `Genre:       ${app.genre}`,
    `Contact:     ${app.contactPersonName}`,
    `Email:       ${app.emailAddress}`,
    `Phone:       ${app.phoneNumber}`,
    ``,
    `Performance Description:`,
    app.performanceDescription,
    ``,
    `View all applications at https://saugaartisanfest.ca/admin`,
  ].join("\n");
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Sauga Artisan Festival <noreply@saugaartisanfest.ca>",
    to: adminEmail,
    subject: `New Performer Application #${app.id}: ${app.performerName}`,
    text: body,
  });
  if (error) throw new Error(error.message);
  logger.info({ to: adminEmail, appId: app.id }, "Admin notification email sent");
}

async function sendConfirmationEmail(app: PerformerApplication): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return;
  const [settings] = await db.select().from(emailSettingsTable).where(eq(emailSettingsTable.id, 1));
  if (!settings || !settings.body.trim()) return;
  const { Resend } = await import("resend");
  const resend = new Resend(resendApiKey);
  const body = settings.body
    .replace(/\{\{firstName\}\}/g, app.contactPersonName)
    .replace(/\{\{lastName\}\}/g, "")
    .replace(/\{\{emailAddress\}\}/g, app.emailAddress)
    .replace(/\{\{businessName\}\}/g, app.performerName);
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Sauga Artisan Festival <noreply@saugaartisanfest.ca>",
    to: app.emailAddress,
    subject: settings.subject,
    text: body,
  });
  if (error) throw new Error(error.message);
  logger.info({ to: app.emailAddress }, "Confirmation email sent");
}

const router: IRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadFields = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "photos", maxCount: 20 },
]);

router.post("/performers", (req, res, next) => {
  uploadFields(req, res, (err) => {
    if (err) {
      logger.warn({ err }, "File upload error");
      res.status(400).json({ error: err.message });
      return;
    }
    next();
  });
}, async (req: Request, res: Response): Promise<void> => {
  const body = req.body;
  const required = [
    "performerName", "performanceType", "genre", "contactPersonName",
    "emailAddress", "phoneNumber", "performanceDescription",
    "requiresCompensation", "videoLink", "agreeToTerms", "agreeToPaSystem",
  ];
  for (const field of required) {
    if (!body[field]) {
      res.status(400).json({ error: `Missing required field: ${field}` });
      return;
    }
  }
  if (body.agreeToTerms !== "true") {
    res.status(400).json({ error: "You must agree to the Terms & Conditions" });
    return;
  }
  if (body.agreeToPaSystem !== "true") {
    res.status(400).json({ error: "You must confirm the PA system acknowledgement" });
    return;
  }
  if (body.requiresCompensation === "yes" && !body.performanceFee) {
    res.status(400).json({ error: "Missing required field: performanceFee" });
    return;
  }
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const logoFile = files?.["logo"]?.[0];
  const photoFiles = files?.["photos"] ?? [];
  let logoFileName: string | null = null;
  let photoFileNames: string | null = null;
  try {
    if (logoFile) {
      logoFileName = await uploadFileToStorage(logoFile, "performer-logos");
    }
    if (photoFiles.length > 0) {
      const urls = await Promise.all(photoFiles.map(f => uploadFileToStorage(f, "performer-photos")));
      photoFileNames = urls.join(", ");
    }
  } catch (err) {
    logger.error({ err }, "File upload to Supabase Storage failed");
    res.status(500).json({ error: "File upload failed. Please try again." });
    return;
  }
  let application;
  try {
    const result = await db.insert(performerApplicationsTable).values({
      performerName: body.performerName,
      performanceType: body.performanceType,
      genre: body.genre,
      contactPersonName: body.contactPersonName,
      emailAddress: body.emailAddress,
      phoneNumber: body.phoneNumber,
      performanceDescription: body.performanceDescription,
      website: body.website || null,
      instagram: body.instagram || null,
      facebook: body.facebook || null,
      otherMediaLink: body.otherMediaLink || null,
      requiresCompensation: body.requiresCompensation,
      performanceFee: body.performanceFee || null,
      videoLink: body.videoLink,
      logoFileName,
      photoFileNames,
      agreeToTerms: body.agreeToTerms,
      agreeToPaSystem: body.agreeToPaSystem,
    }).returning();
    application = result[0];
  } catch (err: unknown) {
    const pgErr = err as { message?: string; code?: string; detail?: string; constraint?: string };
    logger.error({ err, pgCode: pgErr.code, pgDetail: pgErr.detail, pgConstraint: pgErr.constraint, message: pgErr.message }, "DB insert failed for performer application");
    res.status(500).json({ error: "Failed to save application. Please try again." });
    return;
  }
  req.log.info({ id: application.id }, "Performer application submitted");
  sendConfirmationEmail(application).catch((err) => {
    logger.warn({ err }, "Failed to send confirmation email");
  });
  sendAdminNotificationEmail(application).catch((err) => {
    logger.warn({ err }, "Failed to send admin notification email");
  });
  res.status(201).json(application);
});

export default router;