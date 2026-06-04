import { CanvasTexture } from 'three';

/**
 * Procedurally generates a soft, layered cloud texture using an offscreen canvas.
 * Creates multiple overlapping radial gradients with variable opacity to simulate
 * a fluffy, wispy cloud that matches the sketch/paper aesthetic.
 */
export function generateCloudTexture(aspectRatio: number): CanvasTexture {
  const height = 256;
  const width = Math.round(height * aspectRatio);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new CanvasTexture(canvas);
  }

  // Clear with transparency
  ctx.clearRect(0, 0, width, height);

  // Draw layered puffs for a natural cloud look
  const puffSets = [
    // Inner dense core
    { count: 6, radiusScale: 0.35, opacityBase: 0.85, spread: 0.5 },
    // Mid layer
    { count: 8, radiusScale: 0.45, opacityBase: 0.5, spread: 0.7 },
    // Outer wispy layer
    { count: 10, radiusScale: 0.55, opacityBase: 0.2, spread: 0.9 },
  ];

  // Seeded pseudo-random for consistent clouds
  let seed = Math.floor(aspectRatio * 1000);
  const seededRandom = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  puffSets.forEach(({ count, radiusScale, opacityBase, spread }) => {
    for (let i = 0; i < count; i++) {
      const cx = (0.2 + seededRandom() * 0.6) * width;
      const cy = (0.3 + seededRandom() * 0.4) * height;
      const r = (radiusScale + seededRandom() * 0.15) * height;
      const opacity = opacityBase + seededRandom() * 0.15;

      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      gradient.addColorStop(0, `rgba(245, 242, 235, ${opacity})`);
      gradient.addColorStop(0.3, `rgba(240, 237, 228, ${opacity * 0.7})`);
      gradient.addColorStop(0.6, `rgba(235, 232, 222, ${opacity * 0.35})`);
      gradient.addColorStop(1, 'rgba(230, 225, 215, 0)');

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Add subtle pencil-sketch grain overlay
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3]! > 10) {
      const noise = (seededRandom() - 0.5) * 15;
      data[i] = Math.min(255, Math.max(0, data[i]! + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1]! + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2]! + noise));
    }
  }
  ctx.putImageData(imageData, 0, 0);

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Pre-generate the 8 cloud textures with varied aspect ratios
export const cloudTextures = [
  generateCloudTexture(1.894),
  generateCloudTexture(2.459),
  generateCloudTexture(3.577),
  generateCloudTexture(1.794),
  generateCloudTexture(1.997),
  generateCloudTexture(1.905),
  generateCloudTexture(3.000),
  generateCloudTexture(1.875),
];
