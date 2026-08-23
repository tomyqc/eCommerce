const prisma = require("../utills/db"); // ✅ Use shared connection

async function uploadMainImage(req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "Nema otpremljenih fajlova" });
    }
  
    const uploadedFile = req.files.uploadedFile;

    if (!uploadedFile) {
      return res.status(400).json({ message: "uploadedFile is required" });
    }
  
    if (!uploadedFile.mimetype || !uploadedFile.mimetype.startsWith("image/") || uploadedFile.size > 4 * 1024 * 1024) {
      return res.status(400).json({ message: "Use an image smaller than 4 MB" });
    }
    const dataUrl = `data:${uploadedFile.mimetype};base64,${uploadedFile.data.toString("base64")}`;
    res.status(200).json({ message: "Image uploaded", fileName: dataUrl });
  }

  module.exports = {
    uploadMainImage
};