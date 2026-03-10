import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "purge stale presence records",
  { minutes: 5 },
  internal.presence.purgeStale,
);

export default crons;
