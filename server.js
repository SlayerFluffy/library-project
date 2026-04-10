if (process.env.NODE_ENV !== "production") {
  try {
    require("dotenv").config();
  } catch {
    console.warn("dotenv not found; using existing environment variables.");
  }
}
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var requestLogger = require("./middleware/requestLogger");
var notFound = require("./middleware/notFound");
var errorHandler = require("./middleware/errorHandler");

// OAuth
const Githubstrategy = require("passport-github2").Strategy;
const passport = require("passport");
const session = require("express-session");

var app = express();
var port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://library-project-ioy4.onrender.com",
  process.env.CLIENT_URL,
].filter(Boolean);

const mongodb = require("./data/database");

app.set("views", path.join(__dirname, "views"));
app.set("trust proxy", 1);

app.use(logger("dev"));
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Credentials", "true");
  }

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Z-Key",
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-session-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new Githubstrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL:
        process.env.CALLBACK_URL ||
        "http://localhost:3000/auth/github/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    const name = req.user.username;
    res.send(`logged in as ${name}`);
  } else {
    res.send("Login Out");
  }
});

app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] }),
);

app.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/api-docs",
  }),
  (req, res) => {
    res.redirect("/");
  },
);

// routes
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/genres", require("./routes/genres"));
app.use("/loans", require("./routes/loans"));

//error handlers
app.use(notFound);
app.use(errorHandler);

//MongoDB connection
mongodb.initDb((err, _mongodb) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Database connected successfully`);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
