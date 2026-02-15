import QRCode from "qrcode";

export async function generateQrCode(url: string): Promise<string> {
  const dataUrl = await QRCode.toDataURL(url, {
    width: 400,
    margin: 2,
    color: {
      dark: "#1A1A2E",
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "M",
  });

  return dataUrl;
}

export async function generateQrCodeSvg(url: string): Promise<string> {
  const svg = await QRCode.toString(url, {
    type: "svg",
    width: 400,
    margin: 2,
    color: {
      dark: "#1A1A2E",
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "M",
  });

  return svg;
}
