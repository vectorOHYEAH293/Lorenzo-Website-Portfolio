const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const { getGalleries, getImages, getProfileImage } = require("../config/drive");

const { google } = require("googleapis");


const NodeCache = require("node-cache");
const imageCache = new NodeCache({
  stdTTL: 3600
});

const GALLERIES_FOLDER_ID = process.env.GALLERIES_FOLDER_ID;
const PROFILE_FOLDER_ID = process.env.PROFILE_FOLDER_ID;

const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

const drive = google.drive({ version: "v3", auth });

/* =====================
Home Page
===================== */
router.get("/", async (req, res, next) => {
  try {

    const galleries = await getGalleries(GALLERIES_FOLDER_ID);
    const profileImage = await getProfileImage(PROFILE_FOLDER_ID);

    const contentPath = path.join(__dirname, "../data/content.json");
    const content = JSON.parse(fs.readFileSync(contentPath));

    res.render("index", {
      galleries,
      content,
      profileImage
    });

  } catch (error) {
    next(error);
  }
});

/* =====================
Gallery Page
===================== */
router.get("/gallery/:id", async (req, res, next) => {
  try {
    const images = await getImages(req.params.id);

    const galleries = await getGalleries(GALLERIES_FOLDER_ID);
    const gallery = galleries.find(g => g.id === req.params.id);

    res.render("gallery", {
      images,
      galleryName: gallery ? gallery.name : "Gallery"
    });

  } catch (error) {
    next(error);
  }
});

/* =====================
Image Proxy
===================== */
router.get("/image/:id", async (req, res) => {

  const fileId = req.params.id;

  const cachedImage = imageCache.get(fileId);

  if (cachedImage) {
    res.setHeader("Content-Type", "image/jpeg");
    return res.send(cachedImage);
  }

  try {

    const response = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "arraybuffer" }
    );

    const buffer = Buffer.from(response.data);

    imageCache.set(fileId, buffer);

    res.setHeader("Content-Type", "image/jpeg");
    res.send(buffer);

  } catch (error) {

    console.error("Image Fetch Error:", error);
    res.status(500).send("Failed to load image");

  }

});

router.get("/profile", async (req, res) => {

  try {

    const files = await drive.files.list({
      q: `'${process.env.PROFILE_FOLDER_ID}' in parents and mimeType contains 'image/'`,
      fields: "files(id,name)"
    });

    if (!files.data.files.length) {
      return res.status(404).send("No profile image found");
    }

    const fileId = files.data.files[0].id;

    const driveStream = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

    driveStream.data.pipe(res);

  } catch (err) {
    res.status(500).send("Error loading profile image");
  }

});
/* =====================
Contact Form
===================== */
router.post("/contact", (req, res) => {
  const { name, email, message } = req.body;

  const messagesPath = path.join(__dirname, "../data/messages.json");

  let messages = [];

  if (fs.existsSync(messagesPath)) {
    messages = JSON.parse(fs.readFileSync(messagesPath));
  }

  const newMessage = {
    id: Date.now().toString(),
    name,
    email,
    message
  };

  messages.push(newMessage);

  fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2));

  res.redirect("/#contact");
});

module.exports = router;
