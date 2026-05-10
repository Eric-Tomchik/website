import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertAdmin } from "./lib/auth";

/* ─── Queries ──────────────────────────────────────────────────────── */

export const list = query({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    return await ctx.db.query("drip_sequences").collect();
  },
});

export const get = query({
  args: { adminKey: v.string(), id: v.id("drip_sequences") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    return await ctx.db.get(args.id);
  },
});

export const getSteps = query({
  args: { adminKey: v.string(), sequenceId: v.id("drip_sequences") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const steps = await ctx.db
      .query("drip_steps")
      .withIndex("by_sequence", (q) => q.eq("sequence_id", args.sequenceId))
      .collect();
    return steps.sort((a, b) => a.step_order - b.step_order);
  },
});

export const getEnrollments = query({
  args: { adminKey: v.string(), sequenceId: v.id("drip_sequences") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const enrollments = await ctx.db
      .query("drip_enrollments")
      .withIndex("by_sequence", (q) => q.eq("sequence_id", args.sequenceId))
      .collect();
    return enrollments.sort((a, b) => b.enrolled_at - a.enrolled_at);
  },
});

export const stats = query({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const sequences = await ctx.db.query("drip_sequences").collect();
    const enrollments = await ctx.db.query("drip_enrollments").collect();
    const active = enrollments.filter((e) => e.status === "active").length;
    const completed = enrollments.filter((e) => e.status === "completed").length;
    const totalSent = sequences.reduce((s, seq) => s + seq.total_sent, 0);
    return {
      sequences: sequences.length,
      activeSequences: sequences.filter((s) => s.is_active).length,
      totalEnrolled: enrollments.length,
      activeEnrollments: active,
      completedEnrollments: completed,
      totalEmailsSent: totalSent,
    };
  },
});

/* ─── Sequence CRUD ────────────────────────────────────────────────── */

export const create = mutation({
  args: {
    adminKey: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    trigger: v.union(v.literal("on_subscribe"), v.literal("manual")),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    return await ctx.db.insert("drip_sequences", {
      name: args.name,
      description: args.description,
      trigger: args.trigger,
      is_active: false,
      enrolled_count: 0,
      completed_count: 0,
      total_sent: 0,
    });
  },
});

export const update = mutation({
  args: {
    adminKey: v.string(),
    id: v.id("drip_sequences"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    trigger: v.optional(v.union(v.literal("on_subscribe"), v.literal("manual"))),
    is_active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const { adminKey: _, id, ...updates } = args;
    const filtered: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(updates)) {
      if (val !== undefined) filtered[k] = val;
    }
    await ctx.db.patch(id, filtered);
  },
});

export const remove = mutation({
  args: { adminKey: v.string(), id: v.id("drip_sequences") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    // Delete steps
    const steps = await ctx.db
      .query("drip_steps")
      .withIndex("by_sequence", (q) => q.eq("sequence_id", args.id))
      .collect();
    for (const step of steps) {
      await ctx.db.delete(step._id);
    }
    // Delete enrollments
    const enrollments = await ctx.db
      .query("drip_enrollments")
      .withIndex("by_sequence", (q) => q.eq("sequence_id", args.id))
      .collect();
    for (const e of enrollments) {
      await ctx.db.delete(e._id);
    }
    await ctx.db.delete(args.id);
  },
});

/* ─── Step CRUD ────────────────────────────────────────────────────── */

export const addStep = mutation({
  args: {
    adminKey: v.string(),
    sequenceId: v.id("drip_sequences"),
    subject: v.string(),
    preview_text: v.optional(v.string()),
    content: v.string(),
    delay_hours: v.number(),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    // Get current max step_order
    const steps = await ctx.db
      .query("drip_steps")
      .withIndex("by_sequence", (q) => q.eq("sequence_id", args.sequenceId))
      .collect();
    const maxOrder = steps.reduce((m, s) => Math.max(m, s.step_order), -1);
    return await ctx.db.insert("drip_steps", {
      sequence_id: args.sequenceId,
      step_order: maxOrder + 1,
      subject: args.subject,
      preview_text: args.preview_text,
      content: args.content,
      delay_hours: args.delay_hours,
    });
  },
});

export const updateStep = mutation({
  args: {
    adminKey: v.string(),
    id: v.id("drip_steps"),
    subject: v.optional(v.string()),
    preview_text: v.optional(v.string()),
    content: v.optional(v.string()),
    delay_hours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const { adminKey: _, id, ...updates } = args;
    const filtered: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(updates)) {
      if (val !== undefined) filtered[k] = val;
    }
    await ctx.db.patch(id, filtered);
  },
});

export const removeStep = mutation({
  args: { adminKey: v.string(), id: v.id("drip_steps") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const step = await ctx.db.get(args.id);
    if (!step) return;
    await ctx.db.delete(args.id);
    // Re-order remaining steps
    const steps = await ctx.db
      .query("drip_steps")
      .withIndex("by_sequence", (q) => q.eq("sequence_id", step.sequence_id))
      .collect();
    const sorted = steps.sort((a, b) => a.step_order - b.step_order);
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].step_order !== i) {
        await ctx.db.patch(sorted[i]._id, { step_order: i });
      }
    }
  },
});

/* ─── Enrollment ──────────────────────────────────────────────────── */

export const enroll = mutation({
  args: {
    adminKey: v.string(),
    sequenceId: v.id("drip_sequences"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const email = args.email.toLowerCase().trim();
    // Check if already enrolled in this sequence
    const existing = await ctx.db
      .query("drip_enrollments")
      .withIndex("by_sequence_email", (q) =>
        q.eq("sequence_id", args.sequenceId).eq("email", email)
      )
      .first();
    if (existing && (existing.status === "active" || existing.status === "completed")) {
      return { alreadyEnrolled: true };
    }
    // Get first step to determine initial delay
    const steps = await ctx.db
      .query("drip_steps")
      .withIndex("by_sequence", (q) => q.eq("sequence_id", args.sequenceId))
      .collect();
    const sorted = steps.sort((a, b) => a.step_order - b.step_order);
    if (sorted.length === 0) {
      return { error: "Sequence has no steps" };
    }
    const now = Date.now();
    const firstDelay = sorted[0].delay_hours * 60 * 60 * 1000;
    if (existing) {
      // Re-enroll (was paused/unsubscribed)
      await ctx.db.patch(existing._id, {
        status: "active",
        current_step: 0,
        enrolled_at: now,
        next_send_at: now + firstDelay,
        last_sent_at: undefined,
        emails_sent: 0,
      });
    } else {
      await ctx.db.insert("drip_enrollments", {
        sequence_id: args.sequenceId,
        email,
        current_step: 0,
        status: "active",
        enrolled_at: now,
        next_send_at: now + firstDelay,
        emails_sent: 0,
      });
    }
    // Increment enrolled count
    const seq = await ctx.db.get(args.sequenceId);
    if (seq) {
      await ctx.db.patch(args.sequenceId, { enrolled_count: seq.enrolled_count + 1 });
    }
    return { success: true };
  },
});

/** Auto-enroll email into all active on_subscribe sequences */
export const autoEnroll = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    const sequences = await ctx.db
      .query("drip_sequences")
      .withIndex("by_active", (q) => q.eq("is_active", true))
      .collect();
    const autoSequences = sequences.filter((s) => s.trigger === "on_subscribe");
    const now = Date.now();
    for (const seq of autoSequences) {
      // Check not already enrolled
      const existing = await ctx.db
        .query("drip_enrollments")
        .withIndex("by_sequence_email", (q) =>
          q.eq("sequence_id", seq._id).eq("email", email)
        )
        .first();
      if (existing && (existing.status === "active" || existing.status === "completed")) {
        continue;
      }
      const steps = await ctx.db
        .query("drip_steps")
        .withIndex("by_sequence", (q) => q.eq("sequence_id", seq._id))
        .collect();
      if (steps.length === 0) continue;
      const sorted = steps.sort((a, b) => a.step_order - b.step_order);
      const firstDelay = sorted[0].delay_hours * 60 * 60 * 1000;
      if (existing) {
        await ctx.db.patch(existing._id, {
          status: "active",
          current_step: 0,
          enrolled_at: now,
          next_send_at: now + firstDelay,
          last_sent_at: undefined,
          emails_sent: 0,
        });
      } else {
        await ctx.db.insert("drip_enrollments", {
          sequence_id: seq._id,
          email,
          current_step: 0,
          status: "active",
          enrolled_at: now,
          next_send_at: now + firstDelay,
          emails_sent: 0,
        });
      }
      await ctx.db.patch(seq._id, { enrolled_count: seq.enrolled_count + 1 });
    }
  },
});

export const pauseEnrollment = mutation({
  args: { adminKey: v.string(), id: v.id("drip_enrollments") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    await ctx.db.patch(args.id, { status: "paused" });
  },
});

export const resumeEnrollment = mutation({
  args: { adminKey: v.string(), id: v.id("drip_enrollments") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    await ctx.db.patch(args.id, { status: "active", next_send_at: Date.now() });
  },
});

export const removeEnrollment = mutation({
  args: { adminKey: v.string(), id: v.id("drip_enrollments") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    await ctx.db.delete(args.id);
  },
});

/* ─── Processing: called by API route ─────────────────────────────── */

/** Get all enrollments due to send right now */
export const getDueEnrollments = query({
  args: { adminKey: v.string(), now: v.number() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const enrollments = await ctx.db
      .query("drip_enrollments")
      .withIndex("by_status_next", (q) => q.eq("status", "active"))
      .collect();
    return enrollments.filter((e) => e.next_send_at <= args.now);
  },
});

/** Advance enrollment after successful send */
export const advanceEnrollment = mutation({
  args: {
    adminKey: v.string(),
    enrollmentId: v.id("drip_enrollments"),
    nextStepDelayHours: v.optional(v.number()), // if undefined, sequence is complete
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) return;
    const now = Date.now();
    if (args.nextStepDelayHours === undefined) {
      // Sequence complete
      await ctx.db.patch(args.enrollmentId, {
        status: "completed",
        current_step: enrollment.current_step + 1,
        last_sent_at: now,
        emails_sent: enrollment.emails_sent + 1,
      });
      const seq = await ctx.db.get(enrollment.sequence_id);
      if (seq) {
        await ctx.db.patch(enrollment.sequence_id, {
          completed_count: seq.completed_count + 1,
          total_sent: seq.total_sent + 1,
        });
      }
    } else {
      await ctx.db.patch(args.enrollmentId, {
        current_step: enrollment.current_step + 1,
        last_sent_at: now,
        next_send_at: now + args.nextStepDelayHours * 60 * 60 * 1000,
        emails_sent: enrollment.emails_sent + 1,
      });
      const seq = await ctx.db.get(enrollment.sequence_id);
      if (seq) {
        await ctx.db.patch(enrollment.sequence_id, { total_sent: seq.total_sent + 1 });
      }
    }
  },
});
