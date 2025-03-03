const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Configure Passport strategies
module.exports = function () {
    // GitHub OAuth Strategy
    passport.use(
        new GitHubStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                callbackURL: process.env.GITHUB_CALLBACK_URL,
                scope: ['user:email']
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user already exists
                    let user = await User.findOne({
                        $or: [
                            { providerId: profile.id.toString() },
                            { email: profile.emails[0].value }
                        ]
                    });

                    if (user) {
                        // Update GitHub info if user exists
                        user.providerId = profile.id.toString();
                        user.githubUsername = profile.username;
                        user.lastLogin = new Date();
                        await user.save();
                        return done(null, user);
                    }

                    // Create new user if doesn't exist
                    user = new User({
                        displayName: profile.displayName || profile.username,
                        email: profile.emails[0].value,
                        avatarUrl: profile._json.avatar_url,
                        authProvider: 'github',
                        providerId: profile.id,
                        githubUsername: profile.username
                    });

                    await user.save();
                    return done(null, user);
                } catch (err) {
                    return done(err, null);
                }
            }
        )
    );

    // Google OAuth Strategy
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL,
                scope: ['profile', 'email']
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user already exists
                    let user = await User.findOne({
                        $or: [
                            { 'google.id': profile.id },
                            { email: profile.emails[0].value }
                        ]
                    });

                    if (user) {
                        // Update Google info if user exists
                        if (!user.google.id) {
                            user.google = {
                                id: profile.id,
                                name: profile.displayName,
                                email: profile.emails[0].value
                            };
                            await user.save();
                        }
                        return done(null, user);
                    }

                    // Create new user if doesn't exist
                    user = new User({
                        displayName: profile.displayName,
                        email: profile.emails[0].value,
                        avatarUrl: profile.photos[0].value,
                        authProvider: 'google',
                        providerId: profile.id
                    });

                    await user.save();
                    return done(null, user);
                } catch (err) {
                    return done(err, null);
                }
            }
        )
    );

    // Serialize user for session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialize user from session
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};