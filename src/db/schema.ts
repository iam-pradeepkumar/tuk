import { pgTable, text, timestamp, boolean, integer, json, serial } from "drizzle-orm/pg-core";

export const memberships = pgTable("memberships", {
  id: text("id").primaryKey(), // using phone as ID like firestore or UUID
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  age: integer("age").notNull(),
  district: text("district").notNull(),
  wingId: text("wingId").notNull(),
  constituency: text("constituency").notNull(),
  union: text("union_name").notNull(), // union is a reserved keyword in some SQL contexts
  photo: text("photo"),
  date: text("date"),
  cardId: text("cardId"),
  validUntil: text("validUntil"),
  validUntilTimestamp: integer("validUntilTimestamp"),
  dob: text("dob"),
  bloodGroup: text("bloodGroup"),
  memberId: text("memberId"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const officers = pgTable("officers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  name_en: text("name_en").notNull(),
  role: text("role").notNull(),
  role_en: text("role_en").notNull(),
  district: text("district").notNull(),
  district_en: text("district_en").notNull(),
  level: text("level").notNull(),
  phone: text("phone"),
  email: text("email"),
  imageUrl: text("imageUrl"),
  wingId: text("wingId"),
  constituency: text("constituency"),
  constituency_en: text("constituency_en"),
  union: text("union_name"),
  union_en: text("union_en"),
  branch: text("branch"),
  branch_en: text("branch_en"),
  ward: text("ward"),
  ward_en: text("ward_en"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wings = pgTable("wings", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  name_en: text("name_en").notNull(),
  icon: text("icon").notNull(),
  description: text("description").notNull(),
  description_en: text("description_en").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const media = pgTable("media", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  title_en: text("title_en").notNull(),
  type: text("type").notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnailUrl").notNull(),
  tag: text("tag").notNull(),
  tag_en: text("tag_en").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leaders = pgTable("leaders", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  name_en: text("name_en").notNull(),
  title: text("title").notNull(),
  title_en: text("title_en").notNull(),
  quote: text("quote").notNull(),
  quote_en: text("quote_en").notNull(),
  imageUrl: text("imageUrl").notNull(),
  bio: text("bio"),
  bio_en: text("bio_en"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
