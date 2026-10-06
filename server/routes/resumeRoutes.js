const express = require("express");
const multer = require("multer");
const { PDFParse } = require("pdf-parse");
const { analyzeResume } = require("../controllers/resumeController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

// Test route
router.get("/test", analyzeResume);

// Resume upload route
router.post("/upload", upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "No resume uploaded",
    });
  }

  const { jobDescription } = req.body;

  if (!jobDescription) {
    return res.status(400).json({
      message: "Job description is required",
    });
  }

  try {
    const parser = new PDFParse({
      data: req.file.buffer,
    });

    const pdfData = await parser.getText();

    await parser.destroy();

    req.body.resumeText = pdfData.text;

    return analyzeResume(req, res);
  } catch (error) {
    console.error("PDF parsing error:", error);

    res.status(500).json({
      message: "Could not read the PDF.",
    });
  }
});

module.exports = router;