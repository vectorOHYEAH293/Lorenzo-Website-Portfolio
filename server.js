const fs = require("fs");
const path = require("path");
require("dotenv").config();
const express = require("express");

if (process.env.GOOGLE_CREDENTIALS) {
  const credPath = path.join(__dirname, "credentials.json");
  fs.writeFileSync(credPath, process.env.GOOGLE_CREDENTIALS);
}

const compression = require("compression");
const session = require("express-session");

const publicRoutes = require("./routes/publicRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Ensure required data files exist
const dataFolder = path.join(__dirname, "data");

if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder);
}

const messagesFile = path.join(dataFolder, "messages.json");
const contentFile = path.join(dataFolder, "content.json");

if (!fs.existsSync(messagesFile)) {
  fs.writeFileSync(messagesFile, JSON.stringify([]));
}

if (!fs.existsSync(contentFile)) {
  fs.writeFileSync(
    contentFile,
    JSON.stringify({
      heroTitle: "Welcome",
      heroSubtitle: "Photography Portfolio",
      aboutText: "About section coming soon."
    }, null, 2)
  );
}

const app = express();


/* =====================
Global Middleware
===================== */

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: "supersecretkey",
  resave: false,
  saveUninitialized: false
}));
/* =====================
Static & Views
===================== */

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* =====================
Routes
===================== */

app.use("/", publicRoutes);
app.use("/admin", adminRoutes);

/* =====================
Error Handling
===================== */

app.use((err, req, res, next) => {
console.error("Global Error:", err.message);
res.status(500).send("Something went wrong.");
});

/* =====================
Start Server
===================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});
