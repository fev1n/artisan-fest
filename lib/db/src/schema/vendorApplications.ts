import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const vendorApplicationsTable = pgTable("vendor_applications", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  businessName: text("business_name"),
  streetAddress: text("street_address").notNull(),
  city: text("city").notNull(),
  province: text("province").notNull(),
  postalCode: text("postal_code").notNull(),
  phoneNumber: text("phone_number").notNull(),
  emailAddress: text("email_address").notNull(),
  website: text("website"),
  instagram: text("instagram"),
  facebook: text("facebook"),
  onlineStore: text("online_store"),
  otherSocialMedia: text("other_social_media"),
  productCategories: text("product_categories").notNull(),
  productDescription: text("product_description").notNull(),
  artistBio: text("artist_bio").notNull(),
  isArtisanFoodVendor: text("is_artisan_food_vendor").notNull(),
  grantPromoPermission: text("grant_promo_permission").notNull(),
  agreeToTerms: text("agree_to_terms").notNull(),
  logoFileName: text("logo_file_name"),
  photoFileNames: text("photo_file_names"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVendorApplicationSchema = createInsertSchema(vendorApplicationsTable).omit({ id: true, submittedAt: true });
export type InsertVendorApplication = z.infer<typeof insertVendorApplicationSchema>;
export type VendorApplication = typeof vendorApplicationsTable.$inferSelect;
