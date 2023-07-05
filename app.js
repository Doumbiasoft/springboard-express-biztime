/** BizTime express application. */


const express = require("express");
const app = express();
const ExpressError = require("./expressError")
const companiesRouters = require("./routes/companies");
const invoicesRouters = require("./routes/invoices");
const industriesRouters = require("./routes/industries");

app.use(express.json());

app.use('/companies',companiesRouters);
app.use('/invoices',invoicesRouters);
app.use('/industries',industriesRouters);


/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

// generic error handler
app.use((err, req, res, next)=> {
  // the default status is 500 Internal Server Error
  let status = err.status || 500;
  let message = err.message;

  // set the status and alert the user
  return res.status(status).json({
      error: {message, status}
  });
});



module.exports = app;
