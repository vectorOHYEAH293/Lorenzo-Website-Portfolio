const { google } = require("googleapis");

const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

const drive = google.drive({ version: "v3", auth });

/* ======================
   Get Galleries + Cover
====================== */
async function getGalleries(mainFolderId) {
  try {

    const response = await drive.files.list({
      q: `'${mainFolderId}' in parents and mimeType='application/vnd.google-apps.folder'`,
      fields: "files(id, name)",
      orderBy: "name asc"
    });

    const folders = response.data.files || [];

    const galleries = await Promise.all(
      folders.map(async (folder) => {

        const images = await drive.files.list({
          q: `'${folder.id}' in parents and mimeType contains 'image/'`,
          fields: "files(id)",
          orderBy: "name asc",
          pageSize: 1
        });

        const coverImage = images.data.files?.[0]?.id || null;

        return {
          id: folder.id,
          name: folder.name,
          cover: coverImage
        };

      })
    );

    return galleries;

  } catch (error) {
    console.error("Drive Gallery Error:", error);
    throw new Error("Failed to fetch galleries");
  }
}

/* ======================
   Get Images in Gallery
====================== */
async function getImages(folderId) {
  try {

    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/'`,
      fields: "files(id, name)",
      orderBy: "name asc"
    });

    const images = (response.data.files || []).map(file => ({
      id: file.id,
      name: file.name,
      url: `/image/${file.id}`,
      thumb: `/image/${file.id}?size=600`
    }));

    return images;

  } catch (error) {
    console.error("Drive Error:", error);
    throw new Error("Failed to fetch images");
  }
}

/* ======================
   Get Profile Image
====================== */
async function getProfileImage(profileFolderId) {
  try {

    const response = await drive.files.list({
      q: `'${profileFolderId}' in parents and mimeType contains 'image/'`,
      fields: "files(id)",
      orderBy: "name asc",
      pageSize: 1
    });

    const file = response.data.files?.[0];

    return file ? file.id : null;

  } catch (error) {
    console.error("Profile Image Error:", error);
    return null;
  }
}

module.exports = { getGalleries, getImages, getProfileImage };