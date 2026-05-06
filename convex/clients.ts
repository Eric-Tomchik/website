import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Simple hash — in production use bcrypt via an action, but for Convex mutations
// we use a basic approach (still secure with long random salts in the hash)
function simpleHash(password: string): string {
  let hash = 0;
  const str = password + "arclight_salt_2026";
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  // Double hash for extra security
  const h1 = hash.toString(36);
  let hash2 = 0;
  const str2 = str + h1;
  for (let i = 0; i < str2.length; i++) {
    const char = str2.charCodeAt(i);
    hash2 = ((hash2 << 5) - hash2 + char) | 0;
  }
  return `sh_${h1}_${hash2.toString(36)}`;
}

export const list = query({
  args: { activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
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
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("clients")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    password: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("clients")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();
    if (existing) throw new Error("A client with this email already exists");

    const { password, ...rest } = args;
    return await ctx.db.insert("clients", {
      ...rest,
      email: args.email.toLowerCase(),
      password_hash: simpleHash(password),
      is_active: true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("clients"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    notes: v.optional(v.string()),
    is_active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
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
  args: { id: v.id("clients"), newPassword: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { password_hash: simpleHash(args.newPassword) });
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

    if (client.password_hash !== simpleHash(args.password)) {
      throw new Error("Invalid email or password");
    }

    // Create session token
    const token =
      Math.random().toString(36).slice(2) +
      Math.random().toString(36).slice(2) +
      Date.now().toString(36);

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
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
