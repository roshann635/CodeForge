import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  lastLogin: timestamp('last_login')
});

export const problems = pgTable('problems', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  difficulty: text('difficulty').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull()
});

export const submissions = pgTable('submissions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  problemId: integer('problem_id').references(() => problems.id),
  languageId: integer('language_id').notNull(),
  sourceCode: text('source_code').notNull(),
  status: text('status').notNull(), // 'Accepted', 'Wrong Answer', 'Time Limit Exceeded'
  executionTimeMs: integer('execution_time_ms'),
  memoryBytes: integer('memory_bytes'),
  createdAt: timestamp('created_at').defaultNow()
});
