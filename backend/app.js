    // google-oauth-app/google-oauth-app/backend/app.js

    var createError = require("http-errors");
    var express = require("express");
    var path = require("path");
    var cookieParser = require("cookie-parser");
    var logger = require("morgan");
    var cors = require("cors");
    var firebase = require("firebase-admin"); // Firebase Admin SDK

    // Load environment variables. In production, these are typically set directly in the environment.
    // For local development, ensure you have a .env file with these variables.
    // require("dotenv").config(); // Uncomment this line if you are using a .env file for local development

    var app = express();

    // --- Environment Variable Checks (CRITICAL for Production) ---
    if (!process.env.FRONTEND_URL) {
      console.error('CRITICAL ERROR: FRONTEND_URL environment variable is not set!');
      process.exit(1);
    }
    if (!process.env.APP_ID) {
      console.error('CRITICAL ERROR: APP_ID environment variable (Firebase Project ID) is not set!');
      process.exit(1);
    }

    // --- IMPORTANT: Use FIREBASE_CONFIG_BASE64 for the encoded string ---
    // This variable will hold the Base64 encoded JSON string
    const firebaseConfigBase64 = process.env.FIREBASE_CONFIG_BASE64;
    if (!firebaseConfigBase64) {
      console.error('CRITICAL ERROR: FIREBASE_CONFIG_BASE64 environment variable (Base64 encoded service account JSON) is not set!');
      process.exit(1);
    }

    // --- Set up CORS ---
    app.use(
      cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
      })
    );

    // --- Initialize Firebase Admin SDK ---
    let serviceAccount;
    try {
      // Decode the Base64 string back to a JSON string
      const decodedConfigString = Buffer.from(firebaseConfigBase64, 'base64').toString('utf8');
      // Parse the JSON string into a JavaScript object
      serviceAccount = JSON.parse(decodedConfigString);
    } catch (error) {
      console.error('CRITICAL ERROR: Failed to decode or parse FIREBASE_CONFIG_BASE64:', error.message);
      process.exit(1);
    }

    const appId = process.env.APP_ID;
    console.log(`Backend: Initializing Firebase Admin SDK for APP_ID: ${appId}`);

    // --- DEBUG LOG ---
    // This will print the private key *after* decoding and parsing,
    // allowing us to verify its format if there are still issues.
    console.log('DEBUG: Private Key received by app (after decoding/parsing):', serviceAccount.private_key);
    // --- END DEBUG LOG ---

    const firebaseAdminApp = firebase.initializeApp({
      credential: firebase.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.projectId}.firebaseio.com`,
      storageBucket: `${serviceAccount.projectId}.appspot.com`,
      projectId: serviceAccount.projectId
    }, appId);

    // Make Firestore instance available globally via app.locals
    app.locals.db = firebase.firestore(firebaseAdminApp);
    app.locals.authAdmin = firebase.auth(firebaseAdminApp);

    // Now require routes/controllers AFTER Firebase is initialized
    var indexRouter = require("./routes/index");
    var authRouter = require("./routes/auth");
    var apiRouter = require("./routes/api");

    app.use(logger("dev"));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, "public")));

    // --- Middleware to attach app_id to the request object ---
    app.use((req, res, next) => {
      req.app_id = process.env.APP_ID;
      next();
    });

    // --- Route Mounting ---
    app.use("/", indexRouter);
    app.use("/", authRouter);
    app.use("/api", apiRouter);

    // Catch 404 and forward to error handler
    app.use(function (req, res, next) {
      next(createError(404));
    });

    // Error handler (simplified for API-only backend)
    app.use(function (err, req, res, next) {
      console.error("Backend Error Handler:", err.stack);

      res.status(err.status || 500);

      res.json({
        message: err.message,
        error: req.app.get("env") === "development" ? err : {},
      });
    });

    module.exports = app;
    
