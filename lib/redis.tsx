import { Redis } from '@upstash/redis';

const redisUrl =
  process.env.KV_REST_API_URL ||
  process.env.UPSTASH_REDIS_REST_URL ||
  'https://bursting-perch-30195.upstash.io';
const redisToken =
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  'AXXzAAIjcDE5OGI0ZjU2Y2Y2N2Q0MDZlOWY0YzNmMGRiMmRiMzdlYnAxMA';

export const redis = new Redis({
  url: redisUrl,
  token: redisToken,
});
