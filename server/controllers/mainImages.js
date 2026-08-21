const path = require("path");
const prisma = require("../utills/db"); // ✅ Use shared connection

async function uploadMainImage(req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "Nema otpremljenih fajlova" });
    }
  
    const uploadedFile = req.files.uploadedFile;

    if (!uploadedFile) {
      return res.status(400).json({ message: "uploadedFile is required" });
    }
  
    // Using mv method for moving file to the directory on the server
    const publicDirectory = path.join(__dirname, "..", "..", "public");
    const filePath = path.join(publicDirectory, path.basename(uploadedFile.name));

    uploadedFile.mv(filePath, (err) => {
      if (err) {
        return res.status(500).send(err);
      }
  
      res.status(200).json({ message: "Fajl je uspešno otpremljen", fileName: path.basename(uploadedFile.name) });
    });
  }

  module.exports = {
    uploadMainImage
};