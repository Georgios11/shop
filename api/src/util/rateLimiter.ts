import { rateLimit } from 'express-rate-limit';
import { Request, Response } from 'express';

const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per `windowMs`
  message: 'Too many requests from this IP address, try again later',
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP address, try again later',
    });
  },
});

export default rateLimiter;
