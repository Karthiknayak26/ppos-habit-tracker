import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
      callbackURL: '/api/auth/google/callback',
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists in DB
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          done(null, user);
        } else {
          // Check if user exists with the same email
          user = await User.findOne({ email: profile.emails[0].value });
          
          if(user) {
            // Update existing user to include googleId
            user.googleId = profile.id;
            if(!user.avatar) user.avatar = profile.photos[0].value;
            await user.save();
            done(null, user);
          } else {
             // Create new user
            user = await User.create({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
              avatar: profile.photos[0].value,
            });
            done(null, user);
          }
        }
      } catch (error) {
        console.error(error);
        done(error, null);
      }
    }
  )
);
