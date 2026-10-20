import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "purge sessions older than 24 months",
  { hourUTC: 3, minuteUTC: 15 },
  internal.retention.purgeExpired,
);

export default crons;
