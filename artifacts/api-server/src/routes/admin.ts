import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import ExcelJS from "exceljs";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import { db, vendorApplicationsTable, emailSettingsTable } from "@workspace/db";
import { desc, eq, ilike, or } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function getAdminToken(): string {
  const pass = process.env.ADMIN_PASSWORD;
  const secret = process.env.SESSION_SECRET;
  if (!pass || !secret) {
    throw new Error("ADMIN_PASSWORD and SESSION_SECRET environment variables must be set");
  }
  return crypto.createHmac("sha256", secret).update(pass).digest("hex");
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = auth.slice(7);
  if (token !== getAdminToken()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: { error: "Too many login attempts. Try again in 15 minutes." },
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

router.post("/admin/reset-lockout", (req: Request, res: Response): void => {
  const { secret } = req.body;
  const resetKey = process.env.RATE_LIMIT_RESET_KEY;
  if (!resetKey || secret !== resetKey) {
    res.status(401).json({ error: "Invalid reset key" });
    return;
  }
  loginRateLimit.resetKey(req.ip ?? "");
  res.json({ ok: true });
});

router.post("/admin/login", loginRateLimit, (req: Request, res: Response): void => {
  const { password } = req.body;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword) {
    res.status(500).json({ error: "Server misconfiguration: ADMIN_PASSWORD not set" });
    return;
  }

  const bufA = Buffer.from(String(password ?? ""));
  const bufB = Buffer.from(expectedPassword);
  const match = bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);

  if (!match) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }
  res.json({ token: getAdminToken() });
});

router.get("/admin/applications", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { search } = req.query as { search?: string };

  let query = db.select().from(vendorApplicationsTable).$dynamic();

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    query = query.where(
      or(
        ilike(vendorApplicationsTable.firstName, term),
        ilike(vendorApplicationsTable.lastName, term),
        ilike(vendorApplicationsTable.emailAddress, term),
        ilike(vendorApplicationsTable.businessName, term),
        ilike(vendorApplicationsTable.city, term),
      )
    );
  }

  const applications = await query.orderBy(desc(vendorApplicationsTable.submittedAt));
  res.json(applications);
});

router.get("/admin/applications/export", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const applications = await db
    .select()
    .from(vendorApplicationsTable)
    .orderBy(desc(vendorApplicationsTable.submittedAt));

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sauga Artisan Festival";
  workbook.created = new Date();
  const worksheet = workbook.addWorksheet("Vendor Applications");

  worksheet.columns = [
    { header: "ID", key: "id", width: 6 },
    { header: "Submitted At", key: "submittedAt", width: 22 },
    { header: "First Name", key: "firstName", width: 16 },
    { header: "Last Name", key: "lastName", width: 16 },
    { header: "Business Name", key: "businessName", width: 24 },
    { header: "Email", key: "emailAddress", width: 30 },
    { header: "Phone", key: "phoneNumber", width: 18 },
    { header: "Street Address", key: "streetAddress", width: 30 },
    { header: "City", key: "city", width: 16 },
    { header: "Province", key: "province", width: 12 },
    { header: "Postal Code", key: "postalCode", width: 14 },
    { header: "Website", key: "website", width: 30 },
    { header: "Instagram", key: "instagram", width: 24 },
    { header: "Facebook", key: "facebook", width: 24 },
    { header: "Online Store", key: "onlineStore", width: 30 },
    { header: "Other Social", key: "otherSocialMedia", width: 30 },
    { header: "Product Categories", key: "productCategories", width: 40 },
    { header: "Product Description", key: "productDescription", width: 50 },
    { header: "Artist Bio", key: "artistBio", width: 50 },
    { header: "Food Vendor?", key: "isArtisanFoodVendor", width: 14 },
    { header: "Logo File", key: "logoFileName", width: 30 },
    { header: "Photo Files", key: "photoFileNames", width: 50 },
    { header: "Promo Permission", key: "grantPromoPermission", width: 18 },
    { header: "Agreed to Terms", key: "agreeToTerms", width: 16 },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF3D0082" } };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.height = 20;

  for (const app of applications) {
    worksheet.addRow({
      id: app.id,
      submittedAt: app.submittedAt ? new Date(app.submittedAt).toLocaleString() : "",
      firstName: app.firstName,
      lastName: app.lastName,
      businessName: app.businessName ?? "",
      emailAddress: app.emailAddress,
      phoneNumber: app.phoneNumber,
      streetAddress: app.streetAddress,
      city: app.city,
      province: app.province,
      postalCode: app.postalCode,
      website: app.website ?? "",
      instagram: app.instagram ?? "",
      facebook: app.facebook ?? "",
      onlineStore: app.onlineStore ?? "",
      otherSocialMedia: app.otherSocialMedia ?? "",
      productCategories: app.productCategories,
      productDescription: app.productDescription,
      artistBio: app.artistBio,
      isArtisanFoodVendor: app.isArtisanFoodVendor === "yes" ? "Yes" : "No",
      logoFileName: app.logoFileName ?? "",
      photoFileNames: app.photoFileNames ?? "",
      grantPromoPermission: app.grantPromoPermission === "true" ? "Yes" : "No",
      agreeToTerms: app.agreeToTerms === "true" ? "Yes" : "No",
    });
  }

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.alignment = { vertical: "top", wrapText: true };
      if (rowNumber % 2 === 0) {
        row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF5F0" } };
      }
    }
  });
  worksheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: worksheet.columns.length } };

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="vendor-applications-${new Date().toISOString().slice(0, 10)}.xlsx"`);
  await workbook.xlsx.write(res);
  res.end();
});

router.get("/admin/applications/:id/export", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id as string);
  const [app] = await db.select().from(vendorApplicationsTable).where(eq(vendorApplicationsTable.id, id));

  if (!app) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sauga Artisan Festival";
  const worksheet = workbook.addWorksheet("Application");

  const fields: [string, string][] = [
    ["ID", String(app.id)],
    ["Submitted At", app.submittedAt ? new Date(app.submittedAt).toLocaleString() : ""],
    ["First Name", app.firstName],
    ["Last Name", app.lastName],
    ["Business Name", app.businessName ?? ""],
    ["Email", app.emailAddress],
    ["Phone", app.phoneNumber],
    ["Street Address", app.streetAddress],
    ["City", app.city],
    ["Province", app.province],
    ["Postal Code", app.postalCode],
    ["Website", app.website ?? ""],
    ["Instagram", app.instagram ?? ""],
    ["Facebook", app.facebook ?? ""],
    ["Online Store", app.onlineStore ?? ""],
    ["Other Social Media", app.otherSocialMedia ?? ""],
    ["Product Categories", app.productCategories],
    ["Product Description", app.productDescription],
    ["Artist Bio", app.artistBio],
    ["Artisan Food Vendor?", app.isArtisanFoodVendor === "yes" ? "Yes" : "No"],
    ["Logo File", app.logoFileName ?? ""],
    ["Photo Files", app.photoFileNames ?? ""],
    ["Promo Permission", app.grantPromoPermission === "true" ? "Yes" : "No"],
    ["Agreed to Terms", app.agreeToTerms === "true" ? "Yes" : "No"],
  ];

  worksheet.columns = [{ width: 26 }, { width: 60 }];

  for (const [field, value] of fields) {
    const row = worksheet.addRow([field, value]);
    row.getCell(1).font = { bold: true, color: { argb: "FF3D0082" } };
    row.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8F4FF" } };
    row.getCell(2).alignment = { wrapText: true, vertical: "top" };
  }

  const name = `${app.firstName}-${app.lastName}`.toLowerCase().replace(/\s+/g, "-");
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="application-${name}-${app.id}.xlsx"`);
  await workbook.xlsx.write(res);
  res.end();
});

router.get("/admin/applications/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id as string);
  const [app] = await db.select().from(vendorApplicationsTable).where(eq(vendorApplicationsTable.id, id));
  if (!app) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(app);
});

router.get("/admin/summary", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const applications = await db.select().from(vendorApplicationsTable);

  const total = applications.length;

  const categoryCount: Record<string, number> = {};
  for (const app of applications) {
    const cats = app.productCategories.split(",").map(c => c.trim()).filter(Boolean);
    for (const cat of cats) {
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    }
  }

  const foodVendorCount = { yes: 0, no: 0 };
  for (const app of applications) {
    if (app.isArtisanFoodVendor === "yes") foodVendorCount.yes++;
    else foodVendorCount.no++;
  }

  const provinceCount: Record<string, number> = {};
  for (const app of applications) {
    const p = app.province.trim().toUpperCase();
    provinceCount[p] = (provinceCount[p] || 0) + 1;
  }

  const cityCount: Record<string, number> = {};
  for (const app of applications) {
    const c = app.city.trim();
    cityCount[c] = (cityCount[c] || 0) + 1;
  }

  res.json({ total, categoryCount, foodVendorCount, provinceCount, cityCount });
});

router.get("/admin/email-settings", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const [settings] = await db.select().from(emailSettingsTable).where(eq(emailSettingsTable.id, 1));
  res.json(settings ?? { id: 1, subject: "", body: "", updatedAt: null });
});

router.put("/admin/email-settings", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { subject, body } = req.body;
  if (!subject || !body) {
    res.status(400).json({ error: "Subject and body are required" });
    return;
  }

  await db
    .insert(emailSettingsTable)
    .values({ id: 1, subject, body })
    .onConflictDoUpdate({
      target: emailSettingsTable.id,
      set: { subject, body, updatedAt: new Date() },
    });

  res.json({ ok: true });
  logger.info("Email settings updated");
});

router.post("/admin/applications/:id/resend-email", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id as string);
  const [app] = await db.select().from(vendorApplicationsTable).where(eq(vendorApplicationsTable.id, id));
  if (!app) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  const [settings] = await db.select().from(emailSettingsTable).where(eq(emailSettingsTable.id, 1));
  if (!settings || !settings.body.trim()) {
    res.status(400).json({ error: "Email template not configured. Please set up the email template first." });
    return;
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    res.status(500).json({ error: "RESEND_API_KEY not configured." });
    return;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(resendApiKey);
    const emailBody = settings.body
      .replace(/\{\{firstName\}\}/g, app.firstName)
      .replace(/\{\{lastName\}\}/g, app.lastName)
      .replace(/\{\{emailAddress\}\}/g, app.emailAddress)
      .replace(/\{\{businessName\}\}/g, app.businessName ?? app.firstName);

    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "Sauga Artisan Festival <noreply@saugaartisanfest.ca>",
      to: app.emailAddress,
      subject: settings.subject,
      text: emailBody,
    });

    if (error) {
      logger.error({ error }, "Failed to resend email");
      res.status(500).json({ error: "Failed to send email: " + error.message });
      return;
    }

    res.json({ ok: true });
  } catch (err) {
    logger.error({ err }, "Error sending email");
    res.status(500).json({ error: "Email service error" });
  }
});

export default router;
