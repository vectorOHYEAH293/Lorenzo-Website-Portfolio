  const express = require("express");
  const fs = require("fs");
  const path = require("path");

  const router = express.Router();

/* =====================
    Middleware
  ===================== */
function requireLogin(req,res,next){
if(!req.session.loggedIn){
return res.redirect("/admin/login");
}
next();

}

  /* =====================
    Dashboard
  ===================== */
router.get("/dashboard", requireLogin, (req, res) => {

  const contentPath = path.join(__dirname, "../data/content.json");
  const content = JSON.parse(fs.readFileSync(contentPath));

  const messagesPath = path.join(__dirname, "../data/messages.json");

  let messages = [];

  if (fs.existsSync(messagesPath)) {
    messages = JSON.parse(fs.readFileSync(messagesPath));
  }

  res.render("admin", {
    content,
    messages
  });

});

 /* =====================
    Login
  ===================== */

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", (req, res) => {

  const { username, password } = req.body;

  if (
  username === process.env.ADMIN_USER &&
  password === process.env.ADMIN_PASSWORD
  ) {
  req.session.loggedIn = true;
  return res.redirect("/admin/dashboard");
  }

  res.redirect("/admin/login");

});


  /* =====================
    Save Edits
  ===================== */
router.post("/save", (req, res, next) => {
  try {

    const contentPath = path.join(__dirname, "../data/content.json");

    // Load existing content
    const currentContent = JSON.parse(fs.readFileSync(contentPath));

    // Update fields
    currentContent.heroTitle = req.body.heroTitle;
    currentContent.aboutText = req.body.aboutText;
    currentContent.age = req.body.age;
    currentContent.email = req.body.email;
    currentContent.instagramUsername = req.body.instagramUsername;
    currentContent.instagramURL = req.body.instagramURL;
    currentContent.profileImage = req.body.profileImage;

    // Save file
    fs.writeFileSync(contentPath, JSON.stringify(currentContent, null, 2));

    /* Load messages so they still show on dashboard */
    const messagesPath = path.join(__dirname, "../data/messages.json");

    let messages = [];

    if (fs.existsSync(messagesPath)) {
      messages = JSON.parse(fs.readFileSync(messagesPath));
    }

    res.render("admin", {
      content: currentContent,
      messages,
      saved: true
    });

  } catch (error) {
    next(error);
  }
});
/* =====================
  Admin Route for messages
===================== */

router.get("/messages", requireLogin, (req, res) => {

  const messagesPath = path.join(__dirname, "../data/messages.json");

  const messages = JSON.parse(fs.readFileSync(messagesPath));

  res.render("messages", { messages });

});
/* =====================
  Delete messages route
===================== */

router.post("/messages/delete", requireLogin, (req, res) => {

  try {

    const messagesPath = path.join(__dirname, "../data/messages.json");

    let messages = [];

    if (fs.existsSync(messagesPath)) {
      messages = JSON.parse(fs.readFileSync(messagesPath));
    }

    messages = messages.filter(m => m.id !== req.body.id);

    fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2));

    res.redirect("/admin/dashboard");

  } catch (error) {
    console.error(error);
    res.redirect("/admin/dashboard");
  }

});
  module.exports = router;

