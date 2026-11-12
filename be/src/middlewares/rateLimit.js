const buckets = new Map();

function sweep(now) {
  if (buckets.size < 10000) return;
  for (const [key, bucket] of buckets) {
    if (now - bucket.resetAt > 0) buckets.delete(key);
  }
}

export function rateLimit({ windowMs = 15 * 60 * 1000, max = 30, message = 'Quá nhiều yêu cầu, vui lòng thử lại sau' } = {}) {
  return (req, res, next) => {
    const key = `${req.ip || req.socket?.remoteAddress || 'unknown'}`;
    const now = Date.now();
    sweep(now);
    let bucket = buckets.get(key);
    if (!bucket || now > bucket.resetAt) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    if (bucket.count > max) {
      res.set('Retry-After', Math.ceil((bucket.resetAt - now) / 1000));
      return res.status(429).json({ success: false, message });
    }
    next();
  };
}
