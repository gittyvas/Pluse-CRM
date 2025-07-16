// backend/app.js

require("dotenv").config();
const express = require("express");
const path = require("path");
const logger = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const createError = require("http-errors");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const createDbPool = require("./db");

const app = express();

// ENV checks
if (!process.env.FRONTEND_URL) throw new Error("FRONTEND_URL is missing");
if (!process.env.APP_ID) throw new Error("APP_ID is missing");
if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing");
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI)
  throw new Error("Google OAuth environment variables are missing");

// Production detection
const isProduction = process.env.NODE_ENV === "production";

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_REDIRECT_URI,
  passReqToCallback: true,
}, async (req, accessToken, refreshToken, profile, done) => {
  const user = {
    id: profile.id,
    displayName: profile.displayName,
    email: profile.emails?.[0]?.value,
    photoURL: profile.photos?.[0]?.value,
    accessToken,
    refreshToken,
  };
  done(null, user);
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const db = app.locals.db;
    const [rows] = await db.execute(
      `SELECT id, name AS displayName, email, profile_picture_url AS photoURL FROM users WHERE google_id = ?`,
      [id]
    );
    if (rows.length === 0) return done(null, false);
    done(null, rows[0]);
  } catch (err) {
    console.error("deserializeUser error:", err);
    done(err);
  }
});

// Global context
app.use((req, res, next) => {
  req.app_id = process.env.APP_ID;
  req.jwtSecret = process.env.JWT_SECRET;
  req.userId = req.user ? req.user.id : null;
  next();
});

// Async initializer
app.initialize = async () => {
  try {
    const dbPool = await createDbPool();
    app.locals.db = dbPool;
    console.log("✅ MySQL pool initialized");

    // Ensure reminders and notes tables exist
    await dbPool.execute(`
      CREATE TABLE IF NOT EXISTS reminders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        due_date DATETIME DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    await dbPool.execute(`
      CREATE TABLE IF NOT EXISTS notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Route imports
    const indexRouter = require("./routes/index");
    const authRouter = require("./routes/auth");
    const apiRouter = require("./routes/api");
    const contactsRouter = require("./routes/contacts");
    const userRouter = require("./routes/user");
    const profileRouter = require("./routes/profile");
    const remindersRouter = require("./routes/reminders");
    const notesRouter = require("./routes/notes");

    // Route mounting
    app.use("/", indexRouter);
    app.use("/", authRouter);
    app.use("/api", apiRouter);
    app.use("/api/contacts", contactsRouter);
    app.use("/api/user", userRouter);
    app.use("/api/profile", profileRouter);
    app.use("/api/reminders", remindersRouter);
    app.use("/api/notes", notesRouter);

    // 404 handler
    app.use((req, res, next) => {
      next(createError(404));
    });

    // Error handler
    app.use((err, req, res, next) => {
      console.error("🚨 Error:", err.stack);
      res.status(err.status || 500).json({
        message: err.message,
        error: app.get("env") === "development" ? err : {},
      });
    });

    return app;
  } catch (err) {
    console.error("❌ Failed to initialize app:", err);
    process.exit(1);
  }
};

module.exports = app;
