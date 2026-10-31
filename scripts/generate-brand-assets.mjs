import fs from "fs";
import path from "path";
import sharp from "sharp";

const imgPath = "C:/Users/ASUS/.gemini/antigravity/brain/95e66384-2588-44a4-bc77-d7aff77f3dc4/.user_uploaded/media_1793456313349_095f20ad.png";
const brandDir = "public/brand";

if (!fs.existsSync(brandDir)) {
  fs.mkdirSync(brandDir, { recursive: true });
}

async function main() {
  console.log("Reading source image:", imgPath);
  const trimmed = await sharp(imgPath).trim().toBuffer({ resolveWithObject: true });
  console.log("Trimmed dimensions:", trimmed.info.width, "x", trimmed.info.height);

  const maxDim = Math.max(trimmed.info.width, trimmed.info.height);
  // Add 4% padding so it sits comfortably without touching edges
  const targetSize = Math.round(maxDim * 1.04);
  const padX = Math.round((targetSize - trimmed.info.width) / 2);
  const padY = Math.round((targetSize - trimmed.info.height) / 2);

  const squareBuf = await sharp(trimmed.data)
    .extend({
      top: padY,
      bottom: targetSize - trimmed.info.height - padY,
      left: padX,
      right: targetSize - trimmed.info.width - padX,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  // 1. Master high-res transparent PNG (512x512)
  await sharp(squareBuf)
    .resize(512, 512)
    .png({ quality: 95, compressionLevel: 9 })
    .toFile(path.join(brandDir, "nfcista-emblem.png"));
  console.log("Generated public/brand/nfcista-emblem.png (512x512)");

  // 2. High-res WebP version (512x512)
  await sharp(squareBuf)
    .resize(512, 512)
    .webp({ quality: 95, lossless: true })
    .toFile(path.join(brandDir, "nfcista-emblem.webp"));
  console.log("Generated public/brand/nfcista-emblem.webp (512x512)");

  // 3. UI sized PNG (64x64) for navbar & header icons (sharp, crisp)
  await sharp(squareBuf)
    .resize(64, 64)
    .png({ quality: 95, compressionLevel: 9 })
    .toFile(path.join(brandDir, "nfcista-emblem-64.png"));
  console.log("Generated public/brand/nfcista-emblem-64.png (64x64)");

  // 4. Update app/icon.svg embedding the high-res 128x128 PNG as data URI
  const iconBuf = await sharp(squareBuf).resize(128, 128).png().toBuffer();
  const b64 = iconBuf.toString("base64");
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <image href="data:image/png;base64,${b64}" width="128" height="128" />
</svg>
`;
  fs.writeFileSync("app/icon.svg", svgContent, "utf8");
  console.log("Updated app/icon.svg with exact new emblem");

  // Also write app/icon.png so Next.js file-based favicon route directly serves a crisp PNG
  await sharp(squareBuf)
    .resize(48, 48)
    .png({ quality: 95 })
    .toFile("app/icon.png");
  console.log("Generated app/icon.png (48x48)");
}

main().catch((err) => {
  console.error("Error generating brand assets:", err);
  process.exit(1);
});
