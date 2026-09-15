// One-off build script: bakes the pickleball paddle (front/back photo +
// procedural edge texture + handle) into a real .glb 3D model file, so the
// app loads an actual asset instead of building geometry at runtime.
// Run with: node scripts/export-paddle-glb.mjs
import { Document, NodeIO } from "@gltf-transform/core";
import sharp from "sharp";
import * as THREE from "three";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "..", "public");
const THICKNESS = 0.34;
// Paddle face half-width/half-height, shared by the shape outline and the
// photo crop below so the two stay in sync (same aspect ratio).
const PADDLE_HALF_W = 1.55;
const PADDLE_HALF_H = 2.05;

// The 4 source paddle photos shown in the scroll-story section. Each model
// is baked with its OWN accent color, extracted directly from that photo's
// pixels (not a hand-typed guess), so the 3D face matches the real artwork.
const PADDLE_SOURCES = [
  { name: "paddle-1", image: "img-vuot.webp" },
  { name: "paddle-2", image: "vuot3D-2.webp" },
  { name: "paddle-3", image: "vuot3D-3.webp" },
  { name: "paddle-4", image: "vuot3D-4.webp" },
];

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;
  if (max === min) { h = s = 0; } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

function toHex([r, g, b]) {
  return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("");
}

/**
 * Extracts the dominant *saturated* color from a paddle photo. Plain
 * averaging pulls the result toward the near-black/near-white background
 * that fills most of these product photos, so instead this buckets pixels
 * by quantized color and picks the most common bucket among pixels that are
 * actually colorful (decent saturation, mid lightness) — i.e. the paddle
 * itself, not its background.
 */
async function extractDominantColor(imagePath) {
  const { data } = await sharp(imagePath)
    .resize(150, 150, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const buckets = new Map();
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 128) continue;
    const [, s, l] = rgbToHsl(r, g, b);
    if (s < 0.25 || l < 0.15 || l > 0.85) continue;
    const key = [Math.round(r / 16) * 16, Math.round(g / 16) * 16, Math.round(b / 16) * 16].join(",");
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  let bestKey = null;
  let bestCount = -1;
  for (const [key, count] of buckets) {
    if (count > bestCount) { bestCount = count; bestKey = key; }
  }
  if (!bestKey) return { dark: BRAND_DARK, deep: BRAND_DEEP, primary: BRAND_PRIMARY, light: BRAND_LIGHT };
  const [r, g, b] = bestKey.split(",").map(Number);
  const [h, s] = rgbToHsl(r, g, b);
  return {
    dark: toHex(hslToRgb(h, Math.min(1, s * 0.9), 0.12)),
    deep: toHex(hslToRgb(h, Math.min(1, s * 0.95), 0.28)),
    primary: toHex(hslToRgb(h, s, 0.5)),
    light: toHex(hslToRgb(h, s * 0.6, 0.78)),
  };
}

function buildPaddleShape() {
  const shape = new THREE.Shape();
  const w = PADDLE_HALF_W;
  const h = PADDLE_HALF_H;
  const r = 0.55;
  shape.moveTo(-w + r, -h);
  shape.lineTo(w - r, -h);
  shape.quadraticCurveTo(w, -h, w, -h + r);
  shape.lineTo(w, h - r);
  shape.quadraticCurveTo(w, h, w - r, h);
  shape.lineTo(-w + r, h);
  shape.quadraticCurveTo(-w, h, -w, h - r);
  shape.lineTo(-w, -h + r);
  shape.quadraticCurveTo(-w, -h, -w + r, -h);
  return shape;
}

function addMeshFromGeometry(document, buffer, name, geometry, material, groupIndex) {
  let posArr = geometry.attributes.position.array;
  let normArr = geometry.attributes.normal.array;
  let uvArr = geometry.attributes.uv.array;
  let indexArr = geometry.index ? geometry.index.array : null;

  if (groupIndex !== undefined) {
    const group = geometry.groups.find((g) => g.materialIndex === groupIndex);
    if (indexArr) {
      // Indexed geometry: keep full vertex buffers, slice the index range.
      indexArr = indexArr.slice(group.start, group.start + group.count);
    } else {
      // Non-indexed geometry (e.g. ExtrudeGeometry side walls): group
      // start/count address vertices directly, so slice the vertex
      // buffers themselves and build a fresh 0..N sequential index.
      posArr = posArr.slice(group.start * 3, (group.start + group.count) * 3);
      normArr = normArr.slice(group.start * 3, (group.start + group.count) * 3);
      uvArr = uvArr.slice(group.start * 2, (group.start + group.count) * 2);
      indexArr = Uint32Array.from({ length: group.count }, (_, i) => i);
    }
  } else if (!indexArr) {
    indexArr = Uint32Array.from({ length: posArr.length / 3 }, (_, i) => i);
  }

  const positionAccessor = document
    .createAccessor()
    .setType("VEC3")
    .setArray(new Float32Array(posArr))
    .setBuffer(buffer);
  const normalAccessor = document
    .createAccessor()
    .setType("VEC3")
    .setArray(new Float32Array(normArr))
    .setBuffer(buffer);
  const uvAccessor = document
    .createAccessor()
    .setType("VEC2")
    .setArray(new Float32Array(uvArr))
    .setBuffer(buffer);
  const indexAccessor = document
    .createAccessor()
    .setType("SCALAR")
    .setArray(new Uint32Array(indexArr))
    .setBuffer(buffer);

  const prim = document
    .createPrimitive()
    .setAttribute("POSITION", positionAccessor)
    .setAttribute("NORMAL", normalAccessor)
    .setAttribute("TEXCOORD_0", uvAccessor)
    .setIndices(indexAccessor)
    .setMaterial(material);

  const mesh = document.createMesh(name).addPrimitive(prim);
  return document.createNode(name).setMesh(mesh);
}

// Brand palette (matches --primary / --accent in globals.css, oklch(0.55
// 0.21 258) indigo-blue) approximated to sRGB hex for SVG bakes.
const BRAND_DARK = "#0c1330";
const BRAND_DEEP = "#1d2a63";
const BRAND_PRIMARY = "#3d55d6";
const BRAND_LIGHT = "#aab8ff";

async function edgeTextureBuffer() {
  const w = 1024;
  const h = 128;
  const svg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs>
        <linearGradient id="rim" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#23262e"/>
          <stop offset="50%" stop-color="#15171c"/>
          <stop offset="100%" stop-color="#0a0b0e"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#rim)"/>
      ${Array.from({ length: 32 }, (_, i) => {
    const x = i * 45 - 45;
    return `<line x1="${x}" y1="0" x2="${x + h}" y2="${h}" stroke="rgba(255,255,255,0.1)" stroke-width="7"/>`;
  }).join("")}
      <rect x="0" y="${h * 0.42}" width="100%" height="${h * 0.16}" fill="${BRAND_PRIMARY}" opacity="0.55"/>
    </svg>`);
  return sharp(svg).png().toBuffer();
}

// Realistic, matte composite paddle-face texture (no dependency on a
// product photo). Instead of a bright, flat gradient "sticker" look, this
// uses: a mostly-solid matte base color (real paddles are close to one
// color, not a rainbow sweep), fine fiberglass/carbon grain via SVG
// turbulence noise, a soft off-center light falloff (not a hard gloss
// streak), and a subtle, low-contrast sweet-spot mark — closer to how a
// real painted/composite surface reflects light unevenly.
async function faceTextureBuffer({ w, h, mirrored = false, palette }) {
  const cx = w * (mirrored ? 0.66 : 0.34);
  const cy = h * 0.3;
  const svg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs>
        <radialGradient id="light" cx="${cx}" cy="${cy}" r="${w * 0.95}" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="${palette.primary}" stop-opacity="1"/>
          <stop offset="55%" stop-color="${palette.deep}" stop-opacity="1"/>
          <stop offset="100%" stop-color="${palette.dark}" stop-opacity="1"/>
        </radialGradient>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${mirrored ? 7 : 3}" result="noise"/>
          <feColorMatrix in="noise" type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.9 0 0 0 0"/>
        </filter>
        <linearGradient id="vignette" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
          <stop offset="78%" stop-color="#000000" stop-opacity="0"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.35"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#light)"/>
      <rect width="100%" height="100%" filter="url(#grain)" opacity="0.05"/>
      <circle cx="${w / 2}" cy="${h * 0.48}" r="${w * 0.3}" fill="none" stroke="#000000" stroke-width="3" opacity="0.14"/>
      <circle cx="${w / 2}" cy="${h * 0.48}" r="${w * 0.3}" fill="none" stroke="${palette.light}" stroke-width="1" opacity="0.2"/>
      <rect x="0" y="${h * 0.9}" width="100%" height="${h * 0.02}" fill="#000000" opacity="0.2"/>
      <rect width="100%" height="100%" fill="url(#vignette)"/>
    </svg>`);
  return sharp(svg).png().toBuffer();
}

async function buildOne({ name, image }) {
  const OUT = path.join(PUBLIC_DIR, "models", `${name}.glb`);
  const palette = await extractDominantColor(path.join(PUBLIC_DIR, image));

  const document = new Document();
  const buffer = document.createBuffer();

  // Face texture aspect matches the paddle shape exactly, so the default
  // 0..1 UV mapping covers the face with no stretching.
  const targetW = 1024;
  const targetH = Math.round(targetW * (PADDLE_HALF_H / PADDLE_HALF_W));
  const frontPng = await faceTextureBuffer({ w: targetW, h: targetH, mirrored: false, palette });
  const backPng = await faceTextureBuffer({ w: targetW, h: targetH, mirrored: true, palette });
  const edgePng = await edgeTextureBuffer();

  const frontTex = document.createTexture("front").setImage(frontPng).setMimeType("image/png");
  const backTex = document.createTexture("backFace").setImage(backPng).setMimeType("image/png");
  const edgeTex = document.createTexture("edge").setImage(edgePng).setMimeType("image/png");

  // Plain, non-metallic material — no metalness/high-gloss so the real-time
  // directional lights don't blow the surface out into a bright specular
  // streak while the paddle spins.
  const frontMat = document.createMaterial("front").setBaseColorTexture(frontTex).setRoughnessFactor(0.75).setMetallicFactor(0);
  const backMat = document.createMaterial("back").setBaseColorTexture(backTex).setRoughnessFactor(0.8).setMetallicFactor(0);
  const edgeMat = document.createMaterial("edge").setBaseColorTexture(edgeTex).setRoughnessFactor(0.7).setMetallicFactor(0);
  const handleMat = document.createMaterial("handle").setBaseColorFactor([0.08, 0.09, 0.12, 1]).setRoughnessFactor(0.65);

  // glTF's default texture wrap mode is REPEAT. The paddle face UVs (from
  // ShapeGeometry on a rounded/curved outline) slightly exceed 0..1 at the
  // curved corners, so without clamping, the photo tiles into a distracting
  // grid instead of covering the face once. Clamp front/back; the edge
  // texture is intentionally repeated around the rim, so leave it as-is.
  const CLAMP_TO_EDGE = 33071;
  for (const mat of [frontMat, backMat]) {
    const info = mat.getBaseColorTextureInfo();
    if (info) {
      info.setWrapS(CLAMP_TO_EDGE);
      info.setWrapT(CLAMP_TO_EDGE);
    }
  }
  const gripMat = document.createMaterial("grip").setBaseColorFactor([0.078, 0.09, 0.2, 1]).setRoughnessFactor(0.55);

  const shape = buildPaddleShape();
  const capGeo = new THREE.ShapeGeometry(shape, 24);
  const sideGeo = new THREE.ExtrudeGeometry(shape, { depth: THICKNESS, bevelEnabled: false, curveSegments: 24 });
  sideGeo.translate(0, 0, -THICKNESS / 2);

  const scene = document.createScene("Scene");
  const root = document.createNode("Paddle");

  const edgeNode = addMeshFromGeometry(document, buffer, "Edge", sideGeo, edgeMat, 0);
  root.addChild(edgeNode);

  const frontNode = addMeshFromGeometry(document, buffer, "Front", capGeo, frontMat);
  frontNode.setTranslation([0, 0, THICKNESS / 2]);
  root.addChild(frontNode);

  const backNode = addMeshFromGeometry(document, buffer, "Back", capGeo, backMat);
  backNode.setTranslation([0, 0, -THICKNESS / 2]);
  backNode.setRotation(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI).toArray());
  root.addChild(backNode);

  const handleGeo = new THREE.CylinderGeometry(0.24, 0.28, 1.1, 24);
  const handleNode = addMeshFromGeometry(document, buffer, "Handle", handleGeo, handleMat);
  handleNode.setTranslation([0, -2.55, 0]);
  root.addChild(handleNode);

  const gripGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.16, 24);
  const gripNode = addMeshFromGeometry(document, buffer, "Grip", gripGeo, gripMat);
  gripNode.setTranslation([0, -2.05, 0]);
  root.addChild(gripNode);

  scene.addChild(root);

  const io = new NodeIO();
  await io.write(OUT, document);
  console.log("Wrote", OUT, "palette", palette);
}

async function main() {
  for (const source of PADDLE_SOURCES) {
    await buildOne(source);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
