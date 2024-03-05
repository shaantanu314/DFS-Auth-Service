const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: [/^http:\/\/localhost:[0-9]*$/, /^https:\/\/localhost:[0-9]*$/],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;

app.use("/api", require("./routes"));

// error-handlers
app.use(require("./middleware/sqlErrorHandler"));
app.use(require("./middleware/errorHandler"));

app.use("/*", (req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
