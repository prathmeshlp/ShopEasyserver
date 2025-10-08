import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import User from "../models/User";
import logger from "../utils/logger";

// JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!,
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.id);
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (error) {
        logger.error("JWT Strategy Error:", error);
        return done(error, false);
      }
    }
  )
);

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(accessToken, refreshToken, profile);
      try {
        logger.info("Google profile received:", profile);

        // Check if user already exists by email
        let user = await User.findOne({
          $or: [{ email: profile.emails?.[0].value }, { googleId: profile.id }],
        });

        if (user) {
          // User exists, update Google ID if not set
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          return done(null, user);
        } else {
          // Create new user
          user = new User({
            googleId: profile.id,
            email: profile.emails?.[0].value,
            username:
              profile.displayName || profile.emails?.[0].value.split("@")[0],
            // Generate a random password for the user
            password:
              Math.random().toString(36).slice(-8) +
              Math.random().toString(36).slice(-8),
            isVerified: true, // Google verified email
          });

          await user.save();
          return done(null, user);
        }
      } catch (error) {
        logger.error("Google Strategy Error:", error);
        return done(error, false);
      }
    }
  )
);

// Serialize and deserialize (may not be needed but kept for compatibility)
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
