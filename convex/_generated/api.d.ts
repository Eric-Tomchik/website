/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as books from "../books.js";
import type * as clientDocuments from "../clientDocuments.js";
import type * as clients from "../clients.js";
import type * as contacts from "../contacts.js";
import type * as discountCodes from "../discountCodes.js";
import type * as downloadTokens from "../downloadTokens.js";
import type * as milestones from "../milestones.js";
import type * as orders from "../orders.js";
import type * as portfolio from "../portfolio.js";
import type * as projects from "../projects.js";
import type * as seedDescriptions from "../seedDescriptions.js";
import type * as seedISBN from "../seedISBN.js";
import type * as seedPortfolio from "../seedPortfolio.js";
import type * as tickets from "../tickets.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  books: typeof books;
  clientDocuments: typeof clientDocuments;
  clients: typeof clients;
  contacts: typeof contacts;
  discountCodes: typeof discountCodes;
  downloadTokens: typeof downloadTokens;
  milestones: typeof milestones;
  orders: typeof orders;
  portfolio: typeof portfolio;
  projects: typeof projects;
  seedDescriptions: typeof seedDescriptions;
  seedISBN: typeof seedISBN;
  seedPortfolio: typeof seedPortfolio;
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
