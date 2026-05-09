import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";
import { assertAdmin } from "./lib/auth";

// Password hashing: bcrypt only (use sync methods — Convex mutations don't support setTimeout)
const BCRYPT_ROUNDS = 10;

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, BCRYPT_ROUNDS);
}

function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash.startsWith("$2")) {
    // Reject any non-bcrypt hash — legacy formats have been migrated
    return false;
  }
  return bcrypt.compareSync(password, storedHash);
}

export const list = query({
  args: { adminKey: v.string(), activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    if (args.activeOnly) {
      return await ctx.db
        .query("clients")
        .withIndex("by_active", (q) => q.eq("is_active", true))
        .collect();
    }
    return await ctx.db.query("clients").collect();
  },
});

export const get = query({
  args: { adminKey: v.string(), id: v.id("clients") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    return await ctx.db.get(args.id);
  },
});

export const getByEmail = query({
  args: { adminKey: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    return await ctx.db
      .query("clients")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();
  },
});

export const create = mutation({
  args: { adminKey: v.string(), name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    password: v.string(),
    notes: v.optional(v.string()), },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const existing = await ctx.db
      .query("clients")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();
    if (existing) throw new Error("A client with this email already exists");

    const { password, ...rest } = args;
    return await ctx.db.insert("clients", {
      ...rest,
      email: args.email.toLowerCase(),
      password_hash: hashPassword(password),
      is_active: true,
    });
  },
});

export const update = mutation({
  args: { adminKey: v.string(), id: v.id("clients"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    notes: v.optional(v.string()),
    is_active: v.optional(v.boolean()), },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const { id, adminKey: _adminKey, ...updates } = args;
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        filtered[key] = key === "email" ? (value as string).toLowerCase() : value;
      }
    }
    await ctx.db.patch(id, filtered);
  },
});

export const resetPassword = mutation({
  args: { adminKey: v.string(), id: v.id("clients"), newPassword: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    await ctx.db.patch(args.id, {
      password_hash: hashPassword(args.newPassword),
    });
  },
});

export const login = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const client = await ctx.db
      .query("clients")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!client || !client.is_active) {
      throw new Error("Invalid email or password");
    }

    const valid = verifyPassword(args.password, client.password_hash);
    if (!valid) {
      throw new Error("Invalid email or password");
    }

    // Create session token
    const token =
      crypto.randomUUID().replace(/-/g, "") +
      crypto.randomUUID().replace(/-/g, "");

    await ctx.db.insert("client_sessions", {
      client_id: client._id,
      token,
      expires_at: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    await ctx.db.patch(client._id, { last_login_at: Date.now() });

    return {
      token,
      client: {
        _id: client._id,
        name: client.name,
        email: client.email,
        company: client.company,
      },
    };
  },
});

export const validateSession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("client_sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expires_at < Date.now()) {
      return null;
    }

    const client = await ctx.db.get(session.client_id);
    if (!client || !client.is_active) return null;

    return {
      _id: client._id,
      name: client.name,
      email: client.email,
      company: client.company,
      avatar_url: client.avatar_url,
    };
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("client_sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

export const remove = mutation({
  args: { adminKey: v.string(), id: v.id("clients") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    await ctx.db.delete(args.id);
  },
});
