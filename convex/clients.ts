import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

// Password hashing: bcrypt (preferred) with legacy SHA-256 + simpleHash fallback
const BCRYPT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  // bcrypt hashes start with $2a$ or $2b$
  if (storedHash.startsWith("$2")) {
    return bcrypt.compare(password, storedHash);
  }
  // Legacy SHA-256 format
  if (storedHash.startsWith("sha256:")) {
    const parts = storedHash.split(":");
    if (parts.length !== 3) return false;
    const salt = parts[1];
    const computed = await legacySha256Hash(password, salt);
    return computed === storedHash;
  }
  // Legacy simpleHash format
  return storedHash === legacySimpleHash(password);
}

// Legacy SHA-256 — kept only for verifying old hashes; new passwords use bcrypt
async function legacySha256Hash(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(password + salt);
  let hash = data;
  for (let i = 0; i < 1000; i++) {
    hash = new Uint8Array(await crypto.subtle.digest("SHA-256", hash));
  }
  const hashHex = Array.from(hash)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `sha256:${salt}:${hashHex}`;
}

// Legacy simpleHash — kept only for verifying old hashes
function legacySimpleHash(password: string): string {
  let hash = 0;
  const str = password + "arclight_salt_2026";
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
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
      password_hash: await hashPassword(password),
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
    await ctx.db.patch(args.id, {
      password_hash: await hashPassword(args.newPassword),
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

    const valid = await verifyPassword(args.password, client.password_hash);
    if (!valid) {
      throw new Error("Invalid email or password");
    }

    // Auto-migrate legacy (simpleHash / SHA-256) hashes to bcrypt on login
    if (!client.password_hash.startsWith("$2")) {
      await ctx.db.patch(client._id, {
        password_hash: await hashPassword(args.password),
      });
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
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
