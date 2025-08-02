export interface QRCodeGenerateRequest {
  url: string;
  format?: 'png' | 'svg';
  size?: number;
  transparentBackground?: boolean;
}

export interface QRCodeGenerateResponse {
  success: boolean;
  url: string;
  qrCode: string;
  format: 'png' | 'svg';
  size: number;
  transparentBackground: boolean;
}

export interface QRCodeQueryParams {
  url: string;
  format?: 'png' | 'svg';
  size?: string;
  transparent?: 'true' | 'false';
}

export interface ErrorResponse {
  error: string;
  message: string;
}

export interface HealthResponse {
  status: 'OK';
  timestamp: string;
  service: string;
}

export interface QRCodeOptions {
  width: number;
  margin: number;
  color: {
    dark: string;
    light: string;
  };
}
