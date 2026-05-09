import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Clean up expired rate limit entries every hour
crons.interval("rate limit cleanup", { hours: 1 }, internal.rateLimit.cleanup);

export default crons;
