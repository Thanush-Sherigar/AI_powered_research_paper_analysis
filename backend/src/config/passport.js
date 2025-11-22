import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';
import config from './index.js';

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
        new GitHubStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                callbackURL: "http://localhost:5000/api/auth/github/callback",
                scope: ['user:email'],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user exists by GitHub ID
                    let user = await User.findOne({ githubId: profile.id });

                    if (user) {
                        return done(null, user);
                    }

                    // Check if user exists by email
                    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
                    if (email) {
                        user = await User.findOne({ email });
                        if (user) {
                            // Link GitHub account to existing user
                            user.githubId = profile.id;
                            user.authProvider = 'local'; // Keep as local if they originally signed up with email
                            await user.save();
                            return done(null, user);
                        }
                    }

                    // Create new user
                    user = new User({
                        githubId: profile.id,
                        name: profile.displayName || profile.username,
                        email: email, // Note: Email might be null if private, handle accordingly or require it
                        authProvider: 'github',
                    });

                    await user.save();
                    done(null, user);
                } catch (error) {
                    done(error, null);
                }
            }
        )
    );
} else {
    console.warn('⚠️  GitHub Auth disabled: GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is missing in .env');
}

export default passport;
