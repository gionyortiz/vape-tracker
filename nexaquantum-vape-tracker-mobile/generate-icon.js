const sharp = require('sharp');
const path = require('path');

// Closely matches the NXQ RETAIL green hexagon cart poster icon
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#0d2b2b"/>
      <stop offset="100%" stop-color="#050d15"/>
    </radialGradient>
    <radialGradient id="hexGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1aff9c" stop-opacity="0.35"/>
      <stop offset="60%" stop-color="#0aaa6a" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#050d15" stop-opacity="0"/>
    </radialGradient>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="softglow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c8d8e0"/>
      <stop offset="40%" stop-color="#8aa0a8"/>
      <stop offset="100%" stop-color="#4a6068"/>
    </linearGradient>
    <linearGradient id="greenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2dffa0"/>
      <stop offset="100%" stop-color="#0dcc78"/>
    </linearGradient>
    <clipPath id="hexClip">
      <polygon points="512,85 870,295 870,715 512,925 154,715 154,295"/>
    </clipPath>
  </defs>

  <!-- Background -->
  <rect width="1024" height="1024" fill="url(#bgGrad)" rx="180"/>

  <!-- Glow behind hexagon -->
  <ellipse cx="512" cy="500" rx="380" ry="360" fill="url(#hexGlow)"/>

  <!-- ===== OUTER HEXAGON - metallic border ===== -->
  <polygon points="512,85 870,295 870,715 512,925 154,715 154,295"
    fill="none" stroke="url(#metalGrad)" stroke-width="14" filter="url(#softglow)"/>

  <!-- Outer hex glow line -->
  <polygon points="512,85 870,295 870,715 512,925 154,715 154,295"
    fill="none" stroke="#1aff9c" stroke-width="3" opacity="0.6"/>

  <!-- ===== MIDDLE HEXAGON ===== -->
  <polygon points="512,155 800,325 800,670 512,840 224,670 224,325"
    fill="#091e2a" stroke="url(#metalGrad)" stroke-width="10"/>
  <polygon points="512,155 800,325 800,670 512,840 224,670 224,325"
    fill="none" stroke="#1aff9c" stroke-width="2.5" opacity="0.7"/>

  <!-- ===== INNER HEXAGON (darkest plate) ===== -->
  <polygon points="512,238 752,375 752,630 512,762 272,630 272,375"
    fill="#071520" stroke="#1aff9c" stroke-width="2" opacity="0.9"/>

  <!-- Circuit board line patterns on middle hex -->
  <!-- Top left -->
  <line x1="224" y1="495" x2="272" y2="495" stroke="#1aff9c" stroke-width="2" opacity="0.5"/>
  <line x1="800" y1="495" x2="752" y2="495" stroke="#1aff9c" stroke-width="2" opacity="0.5"/>
  <line x1="368" y1="238" x2="368" y2="375" stroke="#1aff9c" stroke-width="2" opacity="0.4"/>
  <line x1="656" y1="238" x2="656" y2="375" stroke="#1aff9c" stroke-width="2" opacity="0.4"/>
  <line x1="368" y1="762" x2="368" y2="630" stroke="#1aff9c" stroke-width="2" opacity="0.4"/>
  <line x1="656" y1="762" x2="656" y2="630" stroke="#1aff9c" stroke-width="2" opacity="0.4"/>

  <!-- Connector dots at hex vertices -->
  <circle cx="512" cy="85" r="9" fill="#1aff9c" filter="url(#glow)"/>
  <circle cx="870" cy="295" r="9" fill="#1aff9c" filter="url(#glow)"/>
  <circle cx="870" cy="715" r="9" fill="#1aff9c" filter="url(#glow)"/>
  <circle cx="512" cy="925" r="9" fill="#1aff9c" filter="url(#glow)"/>
  <circle cx="154" cy="715" r="9" fill="#1aff9c" filter="url(#glow)"/>
  <circle cx="154" cy="295" r="9" fill="#1aff9c" filter="url(#glow)"/>

  <!-- Inner hex vertex dots -->
  <circle cx="512" cy="238" r="6" fill="#1aff9c" opacity="0.8"/>
  <circle cx="752" cy="375" r="6" fill="#1aff9c" opacity="0.8"/>
  <circle cx="752" cy="630" r="6" fill="#1aff9c" opacity="0.8"/>
  <circle cx="512" cy="762" r="6" fill="#1aff9c" opacity="0.8"/>
  <circle cx="272" cy="630" r="6" fill="#1aff9c" opacity="0.8"/>
  <circle cx="272" cy="375" r="6" fill="#1aff9c" opacity="0.8"/>

  <!-- ===== SHOPPING CART ICON (centered, green) ===== -->
  <!-- Cart handle/pole -->
  <line x1="290" y1="360" x2="336" y2="410" stroke="url(#greenGrad)"
    stroke-width="30" stroke-linecap="round" filter="url(#softglow)"/>

  <!-- Cart basket -->
  <path d="M336,410 L690,410 L650,565 L375,565 Z"
    fill="url(#greenGrad)" opacity="0.95" filter="url(#softglow)"/>

  <!-- Cart basket highlight line -->
  <line x1="336" y1="410" x2="690" y2="410" stroke="#6fffcc" stroke-width="4" opacity="0.6"/>

  <!-- Cart basket bottom detail -->
  <line x1="375" y1="565" x2="650" y2="565" stroke="#0aa860" stroke-width="3" opacity="0.8"/>

  <!-- Left vertical strut -->
  <line x1="400" y1="460" x2="390" y2="565" stroke="#0aa860" stroke-width="3" opacity="0.5"/>
  <!-- Right vertical strut -->
  <line x1="600" y1="455" x2="618" y2="565" stroke="#0aa860" stroke-width="3" opacity="0.5"/>

  <!-- Wheels -->
  <circle cx="410" cy="610" r="42" fill="url(#greenGrad)" filter="url(#softglow)"/>
  <circle cx="410" cy="610" r="18" fill="#071520"/>
  <circle cx="620" cy="610" r="42" fill="url(#greenGrad)" filter="url(#softglow)"/>
  <circle cx="620" cy="610" r="18" fill="#071520"/>

  <!-- Wheel hub dots -->
  <circle cx="410" cy="610" r="5" fill="#1aff9c"/>
  <circle cx="620" cy="610" r="5" fill="#1aff9c"/>
</svg>`;

const assets = path.join(__dirname, 'assets');
const files = [
  { name: 'icon.png', size: 1024 },
  { name: 'splash-icon.png', size: 1024 },
  { name: 'android-icon-foreground.png', size: 1024 },
  { name: 'android-icon-monochrome.png', size: 1024 },
  { name: 'favicon.png', size: 48 },
];

Promise.all(files.map(f =>
  sharp(Buffer.from(svg))
    .resize(f.size, f.size)
    .png()
    .toFile(path.join(assets, f.name))
    .then(info => ({ name: f.name, ...info }))
)).then(results => {
  results.forEach(r => console.log(`✅ ${r.name}: ${r.width}x${r.height}, ${r.size} bytes`));
  console.log('\n✔ NXQ RETAIL hexagon cart icon generated for all platforms');
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
