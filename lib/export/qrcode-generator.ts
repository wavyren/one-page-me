import QRCode from "qrcode";

export async function generateQRCodeDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 320,
    margin: 2,
    color: {
      dark: "#C9854A",
      light: "#F4EFE8",
    },
    type: "image/png",
  });
}

export async function generateQRCodeSvg(url: string): Promise<string> {
  return QRCode.toString(url, {
    width: 320,
    margin: 2,
    color: {
      dark: "#C9854A",
      light: "#F4EFE8",
    },
    type: "svg",
  });
}
