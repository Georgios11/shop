// passportConfig.ts
import passport from 'passport';
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptions,
} from 'passport-jwt';
import User, { UserDocument } from '../models/User';
import dotenv from 'dotenv';
import { JWT_KEY } from '../util/secrets';

const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    (req) => {
      // First try to get the token from the token cookie
      const token = req.cookies?.token;
      if (token) return token;

      // If no token, try to get from refreshToken cookie
      const refreshToken = req.cookies?.refreshToken;
      if (refreshToken) return refreshToken;

      return null;
    },
  ]),
  secretOrKey: JWT_KEY,
};

passport.use(
  new JwtStrategy(options, async (payload, done) => {
    try {
      const user = (await User.findById(payload.userId)) as UserDocument | null;
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);
export default passport;
