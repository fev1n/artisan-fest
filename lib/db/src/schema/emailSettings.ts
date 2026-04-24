import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const emailSettingsTable = pgTable("email_settings", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull().default("Thank you for applying to the Sauga Artisan Festival!"),
  body: text("body").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type EmailSettings = typeof emailSettingsTable.$inferSelect;
