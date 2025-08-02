import express, { Request, Response, NextFunction, Application } from "express";
import QRCode from "qrcode";
import cors from "cors";
import path from "path";
import {
  QRCodeGenerateRequest,
  QRCodeGenerateResponse,
  QRCodeQueryParams,
  ErrorResponse,
  HealthResponse,
  QRCodeOptions,
} from "./types";

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || "3000", 10);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static("public"));

// Root route
app.get("/", (_req: Request, res: Response): void => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Generate QR code endpoint
app.post(
  "/generate-qr",
  async (
    req: Request<
      {},
      QRCodeGenerateResponse | ErrorResponse,
      QRCodeGenerateRequest
    >,
    res: Response<QRCodeGenerateResponse | string | ErrorResponse>
  ): Promise<void> => {
    try {
      const {
        url,
        format = "png",
        size = 200,
        transparentBackground = false,
      } = req.body;

      if (!url) {
        res.status(400).json({
          error: "URL is required",
          message: "Please provide a URL to generate QR code",
        });
        return;
      }

      // Validate URL format
      try {
        new URL(url);
      } catch (urlError) {
        res.status(400).json({
          error: "Invalid URL format",
          message: "Please provide a valid URL",
        });
        return;
      }

      // Validate format
      if (format !== "png" && format !== "svg") {
        res.status(400).json({
          error: "Invalid format",
          message: 'Format must be either "png" or "svg"',
        });
        return;
      }

      // Validate size
      const sizeNum = Number(size);
      if (isNaN(sizeNum) || sizeNum < 100 || sizeNum > 1000) {
        res.status(400).json({
          error: "Invalid size",
          message: "Size must be a number between 100 and 1000",
        });
        return;
      }

      // QR code options
      const options: QRCodeOptions = {
        width: sizeNum,
        margin: 2,
        color: {
          dark: "#000000",
          light: transparentBackground ? "#FFFFFF00" : "#FFFFFF",
        },
      };

      if (format === "svg") {
        // Generate SVG QR code
        const qrCodeSVG: string = await QRCode.toString(url, {
          ...options,
          type: "svg",
        });

        res.setHeader("Content-Type", "image/svg+xml");
        res.send(qrCodeSVG);
      } else {
        // Generate PNG QR code as base64
        const qrCodeDataURL: string = await QRCode.toDataURL(url, options);

        res.json({
          success: true,
          url: url,
          qrCode: qrCodeDataURL,
          format: format,
          size: sizeNum,
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
  }
);

// Generate QR code via GET request (for direct image access)
app.get(
  "/qr",
  async (
    req: Request<{}, any, {}, QRCodeQueryParams>,
    res: Response
  ): Promise<void> => {
    try {
      const {
        url,
        format = "png",
        size = "200",
        transparent = "false",
      } = req.query;

      if (!url) {
        res.status(400).json({
          error: "URL parameter is required",
          message:
            "Usage: /qr?url=https://example.com&format=png&size=200&transparent=false",
        });
        return;
      }

      // Validate URL format
      try {
        new URL(url);
      } catch (urlError) {
        res.status(400).json({
          error: "Invalid URL format",
          message: "Please provide a valid URL",
        });
        return;
      }

      // Validate format
      if (format !== "png" && format !== "svg") {
        res.status(400).json({
          error: "Invalid format",
          message: 'Format must be either "png" or "svg"',
        });
        return;
      }

      // Validate size
      const sizeNum = parseInt(size, 10);
      if (isNaN(sizeNum) || sizeNum < 100 || sizeNum > 1000) {
        res.status(400).json({
          error: "Invalid size",
          message: "Size must be a number between 100 and 1000",
        });
        return;
      }

      const transparentBackground: boolean = transparent === "true";

      // QR code options
      const options: QRCodeOptions = {
        width: sizeNum,
        margin: 2,
        color: {
          dark: "#000000",
          light: transparentBackground ? "#FFFFFF00" : "#FFFFFF",
        },
      };

      if (format === "svg") {
        // Generate and return SVG directly
        const qrCodeSVG: string = await QRCode.toString(url, {
          ...options,
          type: "svg",
        });

        res.setHeader("Content-Type", "image/svg+xml");
        res.send(qrCodeSVG);
      } else {
        // Generate and return PNG directly
        const qrCodeBuffer: Buffer = await QRCode.toBuffer(url, options);

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
  }
);

// Health check endpoint
app.get("/health", (_req: Request, res: Response<HealthResponse>): void => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "QR Code Generator API",
  });
});

// 404 handler
app.use("*", (_req: Request, res: Response<ErrorResponse>): void => {
  res.status(404).json({
    error: "Not found",
    message: "The requested endpoint does not exist",
  });
});

// Error handling middleware
app.use(
  (
    error: Error,
    _req: Request,
    res: Response<ErrorResponse>,
    _next: NextFunction
  ): void => {
    console.error("Unhandled error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred",
    });
  }
);

// Start server
app.listen(PORT, (): void => {
  console.log(`🚀 QR Code Generator API is running on port ${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} to view the web interface`);
  console.log(`🔗 API Endpoints:`);
  console.log(`   POST /generate-qr - Generate QR code (returns JSON)`);
  console.log(`   GET  /qr?url=<URL> - Generate QR code (returns image)`);
  console.log(`   GET  /health - Health check`);
});

export default app;
