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
const Githubstrategy= require('passport-github2').Strategy;
const passport = require('passport');
const session = require('express-session');

var app = express();
var port = process.env.PORT || 3000;

const mongodb = require("./data/database");

app.set("views", path.join(__dirname, "views"));
app.set('trust proxy', 1);

app.use(logger("dev"));
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Enable CORS before route handlers so successful responses include the header.
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Z-Key");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// Oauth
app
  
    .use(session({
      secret: "secret", //THIS IS THE COOKIE CALLED SECRET
      resave: false,
      saveUninitialized: true ,
    }))
    .use(passport.initialize())
    .use(passport.session())
    .use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        "Access-Control-Allow-Methods",
          "Origin, x-Requested-With, Content-Type, Z-key, Authorization"
        );
    res.setHeader("Access-Control-Allow-Headers",
          "POST, GET, PUT, PATCH, OPTIONS, DELETE"
        );

    next();
})
  

app.use(express.urlencoded({ extended: true }));



passport.use(new Githubstrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL
},
function(accessToken,refreshToken,profile,done)
{
  return done(null,profile);
}




)),



passport.serializeUser((user,done)=>
{
  done(null,user);

})


passport.deserializeUser((user,done)=>
{
  done(null,user);
  
})



app.get('/',(req,res)=>{
  if(req.session.user)
  {
    const name = req.session.user.username
    res.send(`logged in as ${name}`)
  }
  else{
    res.send("Logged Out")}
})

app.get('/auth/github/callback', passport.authenticate('github',{
  failureRedirect: '/api-docs', session: false}),
  (req,res)=>{
    req.session.user = req.user;
    res.redirect('/');
  }
)

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


}});

app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

module.exports = app;
