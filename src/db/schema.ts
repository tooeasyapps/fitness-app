import { pgTable, serial, varchar, integer, real, date, timestamp, text } from "drizzle-orm/pg-core";

// Two clients: Ver and Val
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Weekly check-ins (kJ burnt, calorie score, weight)
export const checkins = pgTable("checkins", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  weekDate: date("week_date").notNull(),
  kjBurnt: integer("kj_burnt"),
  calorieScore: integer("calorie_score"), // 0-10
  weightKg: real("weight_kg"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Per-session lift logs (one row per exercise per session)
export const lifts = pgTable("lifts", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  sessionDate: date("session_date").notNull(),
  exerciseName: varchar("exercise_name", { length: 100 }).notNull(),
  startingWeight: real("starting_weight"),
  set1Weight: real("set1_weight"),
  set1Reps: integer("set1_reps"),
  set2Weight: real("set2_weight"),
  set2Reps: integer("set2_reps"),
  set3Weight: real("set3_weight"),
  set3Reps: integer("set3_reps"),
  set4Weight: real("set4_weight"),
  set4Reps: integer("set4_reps"),
  pbWeight: real("pb_weight"),
  nextSessionTarget: real("next_session_target"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type NewCheckin = typeof checkins.$inferInsert;
export type Checkin = typeof checkins.$inferSelect;
export type NewLift = typeof lifts.$inferInsert;
export type Lift = typeof lifts.$inferSelect;

// FAQs / Questions
export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer"),
  askedBy: varchar("asked_by", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type NewFAQ = typeof faqs.$inferInsert;
export type FAQ = typeof faqs.$inferSelect;
