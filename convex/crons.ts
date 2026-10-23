import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
crons.interval(
  "purge expired traffic quotas",
  { minutes: 5 },
  internal.rateLimit.purgeExpired,
);

crons.daily(
  "purge sessions older than 24 months",
  { hourUTC: 3, minuteUTC: 15 },
  internal.retention.purgeExpired,
);

export default crons;
