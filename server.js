import express from "express";
import QRCode from "qrcode";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static("public"));

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Generate QR code endpoint
app.post("/generate-qr", async (req, res) => {
  try {
    const {
      url,
      format = "png",
      size = 200,
      transparentBackground = false,
    } = req.body;

    if (!url) {
      return res.status(400).json({
        error: "URL is required",
        message: "Please provide a URL to generate QR code",
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (urlError) {
      return res.status(400).json({
        error: "Invalid URL format",
        message: "Please provide a valid URL",
      });
    }

    // QR code options
    const options = {
      width: parseInt(size),
      margin: 2,
      color: {
        dark: "#000000",
        light: transparentBackground ? "#FFFFFF00" : "#FFFFFF",
      },
    };

    if (format === "svg") {
      // Generate SVG QR code
      const qrCodeSVG = await QRCode.toString(url, {
        ...options,
        type: "svg",
      });

      res.setHeader("Content-Type", "image/svg+xml");
      res.send(qrCodeSVG);
    } else {
      // Generate PNG QR code as base64
      const qrCodeDataURL = await QRCode.toDataURL(url, options);

      res.json({
        success: true,
        url: url,
        qrCode: qrCodeDataURL,
        format: format,
        size: size,
        transparentBackground: transparentBackground,
      });
    }
  } catch (error) {
    console.error("Error generating QR code:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to generate QR code",
    });
  }
});

// Generate QR code via GET request (for direct image access)
app.get("/qr", async (req, res) => {
  try {
    const {
      url,
      format = "png",
      size = 200,
      transparent = "false",
    } = req.query;

    if (!url) {
      return res.status(400).json({
        error: "URL parameter is required",
        message:
          "Usage: /qr?url=https://example.com&format=png&size=200&transparent=false",
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (urlError) {
      return res.status(400).json({
        error: "Invalid URL format",
        message: "Please provide a valid URL",
      });
    }

    const transparentBackground = transparent === "true";

    // QR code options
    const options = {
      width: parseInt(size),
      margin: 2,
      color: {
        dark: "#000000",
        light: transparentBackground ? "#FFFFFF00" : "#FFFFFF",
      },
    };

    if (format === "svg") {
      // Generate and return SVG directly
      const qrCodeSVG = await QRCode.toString(url, {
        ...options,
        type: "svg",
      });

      res.setHeader("Content-Type", "image/svg+xml");
      res.send(qrCodeSVG);
    } else {
      // Generate and return PNG directly
      const qrCodeBuffer = await QRCode.toBuffer(url, options);

      res.setHeader("Content-Type", "image/png");
      res.send(qrCodeBuffer);
    }
  } catch (error) {
    console.error("Error generating QR code:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to generate QR code",
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "QR Code Generator API",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not found",
    message: "The requested endpoint does not exist",
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    error: "Internal server error",
    message: "An unexpected error occurred",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 QR Code Generator API is running on port ${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} to view the web interface`);
  console.log(`🔗 API Endpoints:`);
  console.log(`   POST /generate-qr - Generate QR code (returns JSON)`);
  console.log(`   GET  /qr?url=<URL> - Generate QR code (returns image)`);
  console.log(`   GET  /health - Health check`);
});

module.exports = app;
