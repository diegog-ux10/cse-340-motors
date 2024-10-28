/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const cookieParser = require("cookie-parser")
const env = require("dotenv").config()
const session = require("express-session")
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const bodyParser = require("body-parser")

const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const reviewsRoute = require("./routes/reviewsRoute")
const accountRoute = require("./routes/accountRoute")
const pool = require('./database/')
const static = require("./routes/static")
const utilities = require("./utilities/")

const app = express()

// New error controller
const errorController = require("./controllers/errorController")

/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  name: 'sessionId',
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24
  }
}))

app.use((req, res, next) => {
  res.locals.accountId = req.session.accountId;
  res.locals.accountType = req.session.accountType;
  next();
})

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(cookieParser())
app.use(utilities.checkJWTToken)

/* ***********************
 * View Engine and Template
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root
app.use(static)

/* ***********************
 * Routes
 *************************/
// static route
app.use(require("./routes/static"))
app.use(cookieParser())
// index route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inv", inventoryRoute)

app.use("/review", reviewsRoute)

// account route
app.use("/account", accountRoute)

// New error trigger route
app.get("/trigger-error", utilities.handleErrors(errorController.triggerError))

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if(err.status == 404){ message = err.message} else {message = 'Oh no! There was a crash. Maybe try a different route?'}
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
