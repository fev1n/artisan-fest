import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import { db, vendorApplicationsTable, emailSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";
import type { VendorApplication } from "@workspace/db";

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  return createClient(url, key);
}

async function uploadFileToStorage(
  file: Express.Multer.File,
  folder: string,
): Promise<string> {
  const supabase = getSupabaseClient();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "vendor-uploads";
  const ext = file.originalname.includes(".") ? file.originalname.split(".").pop() : "";
  const timestamp = Date.now();
  const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${folder}/${timestamp}-${safeName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file.buffer, { contentType: file.mimetype, upsert: false });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

async function sendConfirmationEmail(app: VendorApplication): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return;

  const [settings] = await db.select().from(emailSettingsTable).where(eq(emailSettingsTable.id, 1));
  if (!settings || !settings.body.trim()) return;

  const { Resend } = await import("resend");
  const resend = new Resend(resendApiKey);

  const body = settings.body
    .replace(/\{\{firstName\}\}/g, app.firstName)
    .replace(/\{\{lastName\}\}/g, app.lastName)
    .replace(/\{\{emailAddress\}\}/g, app.emailAddress)
    .replace(/\{\{businessName\}\}/g, app.businessName ?? app.firstName);

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

router.post("/applications", (req, res, next) => {
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
    "firstName", "lastName", "streetAddress", "city", "province",
    "postalCode", "phoneNumber", "emailAddress", "productCategories",
    "productDescription", "artistBio", "isArtisanFoodVendor",
    "grantPromoPermission", "agreeToTerms",
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

  if (body.grantPromoPermission !== "true") {
    res.status(400).json({ error: "You must grant promotional permission" });
    return;
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const logoFile = files?.["logo"]?.[0];
  const photoFiles = files?.["photos"] ?? [];

  // Upload files to Supabase Storage and store public URLs
  let logoFileName: string | null = null;
  let photoFileNames: string | null = null;

  try {
    if (logoFile) {
      logoFileName = await uploadFileToStorage(logoFile, "logos");
    }
    if (photoFiles.length > 0) {
      const urls = await Promise.all(photoFiles.map(f => uploadFileToStorage(f, "photos")));
      photoFileNames = urls.join(", ");
    }
  } catch (err) {
    logger.error({ err }, "File upload to Supabase Storage failed");
    res.status(500).json({ error: "File upload failed. Please try again." });
    return;
  }

  const [application] = await db.insert(vendorApplicationsTable).values({
    firstName: body.firstName,
    lastName: body.lastName,
    businessName: body.businessName || null,
    streetAddress: body.streetAddress,
    city: body.city,
    province: body.province,
    postalCode: body.postalCode,
    phoneNumber: body.phoneNumber,
    emailAddress: body.emailAddress,
    website: body.website || null,
    instagram: body.instagram || null,
    facebook: body.facebook || null,
    onlineStore: body.onlineStore || null,
    otherSocialMedia: body.otherSocialMedia || null,
    productCategories: body.productCategories,
    productDescription: body.productDescription,
    artistBio: body.artistBio,
    isArtisanFoodVendor: body.isArtisanFoodVendor,
    grantPromoPermission: body.grantPromoPermission,
    agreeToTerms: body.agreeToTerms,
    logoFileName,
    photoFileNames,
  }).returning();

  req.log.info({ id: application.id }, "Vendor application submitted");

  // Non-blocking — confirmation email failure does not affect submission response
  sendConfirmationEmail(application).catch((err) => {
    logger.warn({ err }, "Failed to send confirmation email");
  });

  res.status(201).json(application);
});

export default router;
