# QR Code Generator API

A simple Express.js API for generating QR codes from URLs with both web interface and REST API endpoints.

## Features

- 🔗 Generate QR codes from any URL
- 🖼️ Multiple formats: PNG and SVG
- 📏 Customizable size
- � Optional transparent background
- �🌐 Web interface for easy testing
- 🚀 REST API for integration
- ✅ Input validation and error handling
- 📱 Responsive design

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd qr-code-generator
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
# Production
npm start

# Development (with nodemon)
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### POST /generate-qr
Generate a QR code and return JSON response with base64 encoded image.

**Request Body:**
```json
{
  "url": "https://example.com",
  "format": "png",
  "size": 200,
  "transparentBackground": false
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://example.com",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "format": "png",
  "size": 200,
  "transparentBackground": false
}
```

### GET /qr
Generate a QR code and return the image directly.

**Query Parameters:**
- `url` (required): The URL to encode
- `format` (optional): "png" or "svg" (default: "png")
- `size` (optional): Size in pixels (default: 200)
- `transparent` (optional): "true" or "false" for transparent background (default: "false")

**Example:**
```
GET /qr?url=https://example.com&format=svg&size=300&transparent=true
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2023-12-07T10:30:00.000Z",
  "service": "QR Code Generator API"
}
```

## Web Interface

Visit `http://localhost:3000` to access the web interface where you can:
- Enter a URL
- Choose format (PNG/SVG)
- Set custom size
- Toggle transparent background
- Generate and download QR codes

## Usage Examples

### Using curl

Generate QR code (JSON response):
```bash
curl -X POST http://localhost:3000/generate-qr \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com", "format": "svg", "size": 300, "transparentBackground": true}'
```

Get QR code image directly:
```bash
curl "http://localhost:3000/qr?url=https://github.com&format=svg&size=300&transparent=true" \
  --output qrcode.svg
```

### Using JavaScript/Fetch

```javascript
// Generate QR code with transparent background
const response = await fetch('/generate-qr', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://example.com',
    format: 'svg',
    size: 200,
    transparentBackground: true
  })
});

const data = await response.json();
console.log(data.qrCode); // Base64 encoded image
```

## Dependencies

- **express**: Web framework
- **qrcode**: QR code generation library
- **cors**: Enable CORS for API access
- **nodemon**: Development dependency for auto-restart

## Error Handling

The API includes comprehensive error handling:
- URL validation
- Format validation
- Size validation
- Proper HTTP status codes
- Descriptive error messages

## Configuration

You can set the port using the `PORT` environment variable:
```bash
PORT=8080 npm start
```

## License

ISC

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
