/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as auditLog from "../auditLog.js";
import type * as blogPosts from "../blogPosts.js";
import type * as books from "../books.js";
import type * as clientDocuments from "../clientDocuments.js";
import type * as clients from "../clients.js";
import type * as contacts from "../contacts.js";
import type * as contentCalendar from "../contentCalendar.js";
import type * as discountCodes from "../discountCodes.js";
import type * as downloadTokens from "../downloadTokens.js";
import type * as emailBroadcasts from "../emailBroadcasts.js";
import type * as invoices from "../invoices.js";
import type * as mediaFiles from "../mediaFiles.js";
import type * as milestones from "../milestones.js";
import type * as newsletter from "../newsletter.js";
import type * as notifications from "../notifications.js";
import type * as orders from "../orders.js";
import type * as portfolio from "../portfolio.js";
import type * as projects from "../projects.js";
import type * as rateLimit from "../rateLimit.js";
import type * as reviews from "../reviews.js";
import type * as seoKeywords from "../seoKeywords.js";
import type * as siteSettings from "../siteSettings.js";
import type * as socialCampaigns from "../socialCampaigns.js";
import type * as socialPosts from "../socialPosts.js";
import type * as storage from "../storage.js";
import type * as tickets from "../tickets.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  auditLog: typeof auditLog;
  blogPosts: typeof blogPosts;
  books: typeof books;
  clientDocuments: typeof clientDocuments;
  clients: typeof clients;
  contacts: typeof contacts;
  contentCalendar: typeof contentCalendar;
  discountCodes: typeof discountCodes;
  downloadTokens: typeof downloadTokens;
  emailBroadcasts: typeof emailBroadcasts;
  invoices: typeof invoices;
  mediaFiles: typeof mediaFiles;
  milestones: typeof milestones;
  newsletter: typeof newsletter;
  notifications: typeof notifications;
  orders: typeof orders;
  portfolio: typeof portfolio;
  projects: typeof projects;
  rateLimit: typeof rateLimit;
  reviews: typeof reviews;
  seoKeywords: typeof seoKeywords;
  siteSettings: typeof siteSettings;
  socialCampaigns: typeof socialCampaigns;
  socialPosts: typeof socialPosts;
  storage: typeof storage;
  tickets: typeof tickets;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
