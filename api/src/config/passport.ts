import passport from 'passport';
import User from '../models/User';

passport.serializeUser(function (user: any, done) {
  done(null, user._id); // Store only the user ID in the session
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id).select('-password');

    if (user) {
      // Transform _id to userId if needed
      const userInfo = {
        userId: user._id, // Renaming _id to userId
        name: user.name,
        email: user.email,
        role: user.role,
        is_banned: user.is_banned,
        favorites: user.favorites,
        orders: user.orders,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
      done(null, userInfo); // Attach only essential fields to req.user
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error, false);
  }
});
