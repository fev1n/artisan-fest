import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
export const db = drizzle(pool, { schema });

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS performer_applications (
      id serial PRIMARY KEY,
      performer_name text NOT NULL,
      performance_type text NOT NULL,
      genre text NOT NULL,
      contact_person_name text NOT NULL,
      email_address text NOT NULL,
      phone_number text NOT NULL,
      performance_description text NOT NULL,
      website text,
      instagram text,
      facebook text,
      other_media_link text,
      requires_compensation text NOT NULL,
      performance_fee text,
      logo_file_name text,
      photo_file_names text,
      video_link text NOT NULL,
      agree_to_terms text NOT NULL,
      agree_to_pa_system text NOT NULL,
      submitted_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS vendor_applications (
      id serial PRIMARY KEY,
      first_name text NOT NULL,
      last_name text NOT NULL,
      business_name text,
      street_address text NOT NULL,
      city text NOT NULL,
      province text NOT NULL,
      postal_code text NOT NULL,
      phone_number text NOT NULL,
      email_address text NOT NULL,
      website text,
      instagram text,
      facebook text,
      online_store text,
      other_social_media text,
      product_categories text NOT NULL,
      product_description text NOT NULL,
      artist_bio text NOT NULL,
      is_artisan_food_vendor text NOT NULL,
      grant_promo_permission text NOT NULL,
      agree_to_terms text NOT NULL,
      applicant_type text,
      setup_type text,
      logo_file_name text,
      photo_file_names text,
      submitted_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS email_settings (
      id serial PRIMARY KEY,
      subject text NOT NULL DEFAULT 'Thank you for applying to the Sauga Artisan Festival!',
      body text NOT NULL DEFAULT '',
      updated_at timestamptz DEFAULT now()
    );
  `);
}

await initializeDatabase();

export * from "./schema";
