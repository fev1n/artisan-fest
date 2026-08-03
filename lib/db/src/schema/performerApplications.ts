import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const performerApplicationsTable = pgTable("performer_applications", {
  id: serial("id").primaryKey(),
  performerName: text("performer_name").notNull(),
  performanceType: text("performance_type").notNull(),
  genre: text("genre").notNull(),
  contactPersonName: text("contact_person_name").notNull(),
  emailAddress: text("email_address").notNull(),
  phoneNumber: text("phone_number").notNull(),
  performanceDescription: text("performance_description").notNull(),
  website: text("website"),
  instagram: text("instagram"),
  facebook: text("facebook"),
  otherMediaLink: text("other_media_link"),
  requiresCompensation: text("requires_compensation").notNull(),
  performanceFee: text("performance_fee"),
  logoFileName: text("logo_file_name"),
  photoFileNames: text("photo_file_names"),
  videoLink: text("video_link").notNull(),
  agreeToTerms: text("agree_to_terms").notNull(),
  agreeToPaSystem: text("agree_to_pa_system").notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPerformerApplicationSchema = createInsertSchema(performerApplicationsTable).omit({ id: true, submittedAt: true });
export type InsertPerformerApplication = z.infer<typeof insertPerformerApplicationSchema>;
export type PerformerApplication = typeof performerApplicationsTable.$inferSelect;