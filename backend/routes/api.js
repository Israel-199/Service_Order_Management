// app.js
const express = require("express");
const app = express();

// Your middleware and routes go here
app.use(express.json());

// Example test route
app.get("/", (req, res) => {
  res.send("Hello from the Express App!");
});

module.exports = app;
