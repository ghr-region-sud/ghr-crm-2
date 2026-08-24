import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Coordinates are expressed against the validated 1323 x 1871 reference artwork.
// The reference PDF itself remains the visual master: we only erase technical
// placeholders and inject CRM values/checkmarks on top of it.
const REF_W = 1323, REF_H = 1871;
const BLUE = rgb(0.09, 0.27, 0.66);
const WHITE = rgb(1, 1, 1);
const TINT = rgb(0.995, 0.985, 0.965);
const GOLD = rgb(.84, .56, .08);

const sx = (x, w) => x * w / REF_W;
const sy = (y, h) => h - y * h / REF_H;

function clean(v) {
  if (v === null || v === undefined) return '';
  return String(v).trim();
}
function amount(v) {
  const n = Number(v || 0);
  return n ? new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(n) : '';
}
function normalizeActivity(v) {
  return String(v || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[★*]/g, '*')
    .replace(/\s+/g, ' ')
    .trim();
}
function activityFlags(items = []) {
  const list = (Array.isArray(items) ? items : [items]).map(normalizeActivity);
  const has = (...aliases) => aliases.some(a => list.includes(normalizeActivity(a)));
  return {
    hotel: has('Hôtel'),
    hotel2: has('Hôtel 2*'),
    hotel3: has('Hôtel 3*'),
    hotel4: has('Hôtel 4*'),
    hotel5: has('Hôtel 5*'),
    luxuryHotel: has('Hôtel de luxe'),
    restaurant: has('Restaurant Brasserie', 'Restaurant / Brasserie', 'Restaurant de plage'),
    cafeBar: has('Café Bar', 'Café / Bar'),
    nightclub: has('Discothèque'),
    ambianceBar: has('Bar à ambiance'),
    caterer: has('Traiteur organisateur de réception', 'Traiteur'),
    fastFood: has('Restauration rapide')
  };
}
function fitSize(font, text, maxWidth, start, min = 4.0) {
  let size = start;
  while (size > min && font.widthOfTextAtSize(text, size) > maxWidth) size -= 0.2;
  return size;
}
function coverPx(page, { x, y, w, h }, pageW, pageH, color = WHITE) {
  page.drawRectangle({
    x: sx(x, pageW),
    y: sy(y + h, pageH),
    width: sx(w, pageW),
    height: h * pageH / REF_H,
    color
  });
}
function valuePx(page, font, text, box, pageW, pageH, { size = 6.0, color = BLUE, align = 'right', bg = WHITE, pad = 2 } = {}) {
  // Important: cover ONLY the placeholder/value zone, never the label or dotted line.
  coverPx(page, box, pageW, pageH, bg);
  const t = clean(text);
  if (!t) return;
  const maxW = sx(box.w - pad * 2, pageW);
  const fs = fitSize(font, t, maxW, size, 4.0);
  const tw = font.widthOfTextAtSize(t, fs);
  let x = sx(box.x + pad, pageW);
  if (align === 'right') x = sx(box.x + box.w - pad, pageW) - tw;
  else if (align === 'center') x = sx(box.x, pageW) + (sx(box.w, pageW) - tw) / 2;
  const y = sy(box.y + box.h - 2, pageH);
  page.drawText(t, { x, y, size: fs, font, color });
}
function drawMarkPx(page, x, y, pageW, pageH, size = 13) {
  // Crisp X inside the existing checkbox. It is intentionally smaller than the box.
  const px = sx(x, pageW), py = sy(y + size, pageH);
  const sw = size * pageW / REF_W, sh = size * pageH / REF_H;
  const insetX = sw * .22, insetY = sh * .22;
  page.drawLine({ start: { x: px + insetX, y: py + insetY }, end: { x: px + sw - insetX, y: py + sh - insetY }, thickness: 1.05, color: BLUE });
  page.drawLine({ start: { x: px + insetX, y: py + sh - insetY }, end: { x: px + sw - insetX, y: py + insetY }, thickness: 1.05, color: BLUE });
}
function replaceHeaderYear(page, font, year, pageW, pageH) {
  // Keep exactly the validated title treatment while allowing other years.
  coverPx(page, { x: 492, y: 210, w: 238, h: 60 }, pageW, pageH, WHITE);
  const label = `ANNÉE ${year}`;
  page.drawText(label, { x: sx(500, pageW), y: sy(251, pageH), size: 14.2, font, color: GOLD });
}

export async function buildBulletinPdf(referenceBytes, company = {}, membership = {}, contact = {}) {
  const src = await PDFDocument.load(referenceBytes);
  const out = await PDFDocument.create();
  const [page] = await out.copyPages(src, [0]);
  out.addPage(page);
  const pageW = page.getWidth(), pageH = page.getHeight();
  const font = await out.embedFont(StandardFonts.HelveticaBold);
  const year = Number(String(membership.startDate || '').slice(0, 4)) || Number(membership.year) || new Date().getFullYear();

  replaceHeaderYear(page, font, year, pageW, pageH);

  // The previous version used large white masks over complete areas. Those masks
  // were the source of the visible white rectangles and clipped labels. Every
  // dynamic field below now cleans only its own placeholder zone.

  // Membership type checkboxes.
  if (normalizeActivity(membership.type) === normalizeActivity('Renouvellement')) drawMarkPx(page, 440, 297, pageW, pageH, 13);
  else drawMarkPx(page, 201, 297, pageW, pageH, 13);

  const V = (box, text, opt) => valuePx(page, font, text, box, pageW, pageH, opt);

  // 1. Établissement
  V({ x: 642, y: 416, w: 145, h: 28 }, company.name);
  V({ x: 620, y: 452, w: 167, h: 28 }, company.legalName);
  V({ x: 620, y: 488, w: 167, h: 28 }, company.address);
  V({ x: 220, y: 524, w: 175, h: 28 }, company.postalCode);
  V({ x: 640, y: 524, w: 147, h: 28 }, company.city);
  V({ x: 190, y: 560, w: 205, h: 29 }, company.phone);
  V({ x: 635, y: 560, w: 152, h: 29 }, company.email);

  // 2. Contact référent
  V({ x: 195, y: 697, w: 205, h: 32 }, contact.lastName);
  V({ x: 590, y: 697, w: 197, h: 32 }, contact.firstName);
  V({ x: 575, y: 735, w: 212, h: 32 }, contact.role);
  V({ x: 215, y: 772, w: 185, h: 32 }, contact.phone);
  V({ x: 590, y: 772, w: 197, h: 32 }, contact.email);

  // 3. Activité - coordinates match the 6-column validated reference.
  const a = activityFlags(company.businessActivities || []);
  const checks = {
    hotel: [58, 961], hotel2: [161, 961], hotel3: [264, 961],
    hotel4: [367, 961], hotel5: [470, 961], luxuryHotel: [575, 961],
    restaurant: [58, 1001], cafeBar: [264, 1001], nightclub: [367, 1001], ambianceBar: [470, 1001],
    caterer: [58, 1041], fastFood: [161, 1041]
  };
  Object.entries(checks).forEach(([k, [x, y]]) => { if (a[k]) drawMarkPx(page, x, y, pageW, pageH, 13); });

  // Precise value zones: no large overlays, so labels/dotted rules stay intact.
  V({ x: 600, y: 1028, w: 187, h: 29 }, company.otherActivity);
  V({ x: 270, y: 1066, w: 175, h: 29 }, company.employees);
  V({ x: 645, y: 1066, w: 142, h: 29 }, company.rooms);
  V({ x: 285, y: 1103, w: 160, h: 29 }, company.classification);
  V({ x: 285, y: 1140, w: 160, h: 29 }, company.licenseType);
  V({ x: 300, y: 1177, w: 145, h: 29 }, company.siret);
  V({ x: 650, y: 1177, w: 137, h: 29 }, company.naf);
  V({ x: 500, y: 1214, w: 287, h: 29 }, company.legalStatus);

  // 4. Adhésion & cotisation. The reference already contains the printed year in
  // the sentence; do not draw another year on top of it.
  V({ x: 625, y: 1344, w: 162, h: 31 }, amount(membership.amountExpected));
  V({ x: 600, y: 1381, w: 187, h: 31 }, membership.type);
  V({ x: 650, y: 1419, w: 137, h: 31 }, year);

  // 5. Options: remove only technical placeholder labels on the far right.
  [
    { x: 650, y: 1531, w: 137, h: 27 },
    { x: 650, y: 1569, w: 137, h: 27 },
    { x: 650, y: 1607, w: 137, h: 27 },
    { x: 650, y: 1645, w: 137, h: 27 }
  ].forEach(b => coverPx(page, b, pageW, pageH, WHITE));
  const optionRows = [
    [membership.newsletter, 494, 1541, 558],
    [membership.insuranceInfo, 494, 1579, 558],
    [membership.legalProtection, 494, 1617, 558],
    [membership.communicationConsent, 494, 1655, 558]
  ];
  optionRows.forEach(([yes, xYes, y, xNo]) => drawMarkPx(page, yes ? xYes : xNo, y, pageW, pageH, 12));

  // 6. Mode de règlement
  const method = normalizeActivity(membership.paymentMethod || '');
  const payY = method.includes('cheque') ? 481 : (method.includes('sepa') || method.includes('prelevement')) ? 513 : method.includes('virement') ? 548 : null;
  if (payY) drawMarkPx(page, 838, payY, pageW, pageH, 13);

  // 7. Mandat SEPA - exact placeholder boxes on the tinted area.
  V({ x: 1070, y: 804, w: 205, h: 30 }, membership.sepa?.accountHolder, { bg: TINT });
  V({ x: 1070, y: 841, w: 205, h: 30 }, membership.sepa?.address, { bg: TINT });
  V({ x: 1100, y: 878, w: 175, h: 30 }, membership.sepa?.postalCode, { bg: TINT });
  V({ x: 1110, y: 915, w: 165, h: 30 }, membership.sepa?.city, { bg: TINT });
  V({ x: 1105, y: 952, w: 170, h: 30 }, membership.sepa?.country || 'France', { bg: TINT });
  V({ x: 1040, y: 1027, w: 235, h: 30 }, membership.sepa?.iban, { bg: TINT, size: 5.2 });
  V({ x: 1090, y: 1104, w: 185, h: 30 }, membership.sepa?.bic, { bg: TINT });
  V({ x: 1120, y: 1272, w: 155, h: 30 }, amount(membership.amountExpected), { bg: TINT });

  // 8. Validation remains blank unless explicitly supplied.
  V({ x: 1085, y: 1455, w: 190, h: 30 }, membership.signaturePlace || '', { bg: TINT });
  V({ x: 1085, y: 1492, w: 190, h: 30 }, membership.signatureDate || '', { bg: TINT });

  out.setTitle(`Bulletin d'adhésion - ${clean(company.name) || 'GHR Région Sud'}`);
  out.setSubject(`Bulletin d'adhésion ${year}`);
  out.setCreator('CRM GHR Région Sud');
  out.setProducer('CRM GHR Région Sud');
  return await out.save({ useObjectStreams: false });
}
