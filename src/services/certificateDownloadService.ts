import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { CertificateRecord } from '../components/CertificatePortal';

export const getCertificateTemplatePath = (achievementType?: string): string => {
  const typeLower = (achievementType || '').toLowerCase();
  if (typeLower.includes('leadership') || typeLower.includes('leader')) {
    return '/assets/aistudio/Certificate_of_Leadership_e0b3d616.png';
  }
  if (typeLower.includes('volunteer') || typeLower.includes('volunteerism')) {
    return '/assets/aistudio/Certificate_of_Volunteerism_e195dba3.png';
  }
  return '/assets/aistudio/Certificate_Of_Participation__1__0f22824f.png';
};

/**
 * Loads an image from a URL or asset path into an HTMLImageElement
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load image at ${src}: ${e}`));
    img.src = src;
  });
}

/**
 * Renders an authentic, high-resolution certificate canvas (2000 x 1414)
 * with the template background, student name, and dynamic verification QR code.
 */
export async function renderCertificateToCanvas(cert: CertificateRecord): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = 2000;
  canvas.height = 1414;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  // 1. Draw Background Template
  const templatePath = getCertificateTemplatePath(cert.achievementType);
  const templateImg = await loadImage(templatePath);
  ctx.drawImage(templateImg, 0, 0, 2000, 1414);

  // 2. Render Student / Recipient Name
  // Positioned under 'This certificate is awarded to' around Y = 582 (41.2%)
  const recipientName = cert.recipientName || 'Valued Participant';
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#0f172a'; // Deep slate navy

  // Dynamic font sizing based on recipient name length
  let fontSize = 72;
  if (recipientName.length > 28) fontSize = 48;
  else if (recipientName.length > 22) fontSize = 56;
  else if (recipientName.length > 16) fontSize = 64;

  ctx.font = `900 ${fontSize}px "Playfair Display", "Times New Roman", Georgia, serif`;
  
  // Slight subtle drop shadow for prestigious look
  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 2;

  ctx.fillText(recipientName, 1000, 582);
  ctx.restore();

  // 3. Generate & Draw Fixed Unique Verification QR Code in Bottom Square
  // Position: left 42.9% (858px), top 82.65% (1168px), width 11.13% (222px), height 14.58% (206px)
  const verifyUrl = `${window.location.origin}/certificate?verify=${encodeURIComponent(cert.id)}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 400,
    margin: 1,
    color: {
      dark: '#1e1b4b',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'H'
  });
  const qrImg = await loadImage(qrDataUrl);

  const qrX = 860;
  const qrY = 1170;
  const qrW = 215;
  const qrH = 205;

  // Clean white rounded background behind QR code for sharp contrast
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(qrX, qrY, qrW, qrH, 12);
  } else {
    ctx.rect(qrX, qrY, qrW, qrH);
  }
  ctx.fill();
  ctx.drawImage(qrImg, qrX + 8, qrY + 6, qrW - 16, qrH - 12);
  ctx.restore();

  return canvas;
}

/**
 * Downloads the certificate as a pristine, print-ready PDF (A4 landscape)
 */
export async function downloadCertificateAsPdf(cert: CertificateRecord): Promise<void> {
  const canvas = await renderCertificateToCanvas(cert);
  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  // A4 dimensions in landscape: 297mm width, 210mm height
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210, undefined, 'FAST');
  
  const safeName = (cert.recipientName || 'Certificate').replace(/[^a-zA-Z0-9_-]/g, '_');
  pdf.save(`Collabs_Certificate_${safeName}_${cert.id}.pdf`);
}

/**
 * Downloads the certificate as a high-resolution PNG image (2000 x 1414)
 */
export async function downloadCertificateAsImage(cert: CertificateRecord): Promise<void> {
  const canvas = await renderCertificateToCanvas(cert);
  const dataUrl = canvas.toDataURL('image/png');

  const safeName = (cert.recipientName || 'Certificate').replace(/[^a-zA-Z0-9_-]/g, '_');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `Collabs_Certificate_${safeName}_${cert.id}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
