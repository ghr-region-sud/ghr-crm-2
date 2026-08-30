import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const A4 = [595.28, 841.89];
const NAVY = rgb(0.035, 0.13, 0.37);
const BLUE = rgb(0.055, 0.18, 0.55);
const GOLD = rgb(0.84, 0.55, 0.08);
const TEXT = rgb(0.08, 0.09, 0.12);
const MUTED = rgb(0.38, 0.42, 0.50);
const BORDER = rgb(0.84, 0.87, 0.92);
const TINT = rgb(0.992, 0.981, 0.957);
const SOFT = rgb(0.965, 0.973, 0.988);
const WHITE = rgb(1, 1, 1);

const clean = (v) => (v === null || v === undefined ? '' : String(v).trim());
const yes = (v) => v === true || v === 1 || String(v).toLowerCase() === 'true' || String(v).toLowerCase() === 'oui';
const norm = (v) => clean(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[★]/g, '*').replace(/\s+/g, ' ');
const money = (v) => {
  const n = Number(v || 0);
  if (!Number.isFinite(n) || n === 0) return '';
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(n)} €`;
};

function fit(font, text, maxWidth, start = 6.6, min = 4.1) {
  const t = clean(text);
  let size = start;
  while (size > min && font.widthOfTextAtSize(t, size) > maxWidth) size -= 0.15;
  return size;
}

function text(page, font, value, x, y, size = 6.4, color = TEXT, options = {}) {
  const t = clean(value);
  if (!t) return;
  const fs = options.maxWidth ? fit(font, t, options.maxWidth, size, options.minSize || 4.1) : size;
  let tx = x;
  const width = font.widthOfTextAtSize(t, fs);
  if (options.align === 'right') tx = x - width;
  if (options.align === 'center') tx = x - width / 2;
  page.drawText(t, { x: tx, y, size: fs, font, color });
}

function line(page, x1, y1, x2, y2, color = BORDER, thickness = 0.7, dashArray) {
  page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, color, thickness, dashArray });
}

function box(page, x, y, w, h, options = {}) {
  page.drawRectangle({
    x, y, width: w, height: h,
    color: options.fill || WHITE,
    borderColor: options.border || BORDER,
    borderWidth: options.borderWidth ?? 0.7,
    borderRadius: options.radius || 0,
  });
}

function checkbox(page, x, y, checked = false, size = 7) {
  page.drawRectangle({ x, y, width: size, height: size, borderColor: rgb(.55, .60, .68), borderWidth: .8, color: WHITE });
  if (checked) {
    page.drawLine({ start: { x: x + 1.5, y: y + 1.6 }, end: { x: x + size - 1.4, y: y + size - 1.4 }, thickness: 1.05, color: BLUE });
    page.drawLine({ start: { x: x + 1.5, y: y + size - 1.4 }, end: { x: x + size - 1.4, y: y + 1.6 }, thickness: 1.05, color: BLUE });
  }
}

function circleIcon(page, x, y, r = 10) {
  page.drawCircle({ x, y, size: r, color: NAVY });
  page.drawRectangle({ x: x - 2.4, y: y - 2.4, width: 4.8, height: 4.8, color: WHITE });
}

function sectionHeader(page, bold, n, title, x, topY, width, fill = WHITE) {
  circleIcon(page, x + 14, topY - 15, 10);
  text(page, bold, `${n}. ${title}`, x + 31, topY - 19, 8.1, NAVY);
}

function fieldLine(page, regular, bold, label, value, x, y, w, options = {}) {
  const labelSize = options.labelSize || 5.8;
  text(page, bold, label, x, y, labelSize, TEXT);
  const labelW = Math.min(options.labelWidth || regular.widthOfTextAtSize(label, labelSize) + 7, w * 0.55);
  const vx = x + labelW;
  line(page, vx, y - 1.4, x + w, y - 1.4, rgb(.52,.53,.56), .55, [1.2, 1.4]);
  if (clean(value)) text(page, bold, value, x + w - 1, y + 0.4, 5.6, BLUE, { align: 'right', maxWidth: w - labelW - 3, minSize: 4.0 });
}

function booleanRow(page, regular, bold, label, value, x, y, w) {
  text(page, regular, label, x, y, 5.25, TEXT, { maxWidth: w - 65 });
  const yesX = x + w - 50;
  const noX = x + w - 22;
  checkbox(page, yesX, y - 1.0, yes(value), 6);
  text(page, regular, 'Oui', yesX + 9, y, 5.1, TEXT);
  checkbox(page, noX, y - 1.0, !yes(value), 6);
  text(page, regular, 'Non', noX + 9, y, 5.1, TEXT);
}

function activitiesSelected(company) {
  const list = Array.isArray(company.businessActivities) ? company.businessActivities : [company.businessActivities].filter(Boolean);
  const set = new Set(list.map(norm));
  const has = (...labels) => labels.some(l => set.has(norm(l)));
  return {
    hotel: has('Hôtel'), hotel2: has('Hôtel 2*'), hotel3: has('Hôtel 3*'), hotel4: has('Hôtel 4*'), hotel5: has('Hôtel 5*'), luxury: has('Hôtel de luxe'),
    restaurant: has('Restaurant / Brasserie','Restaurant Brasserie','Restaurant de plage'), cafe: has('Café / Bar','Café Bar'), disco: has('Discothèque'), ambience: has('Bar à ambiance'), caterer: has('Traiteur','Traiteur organisateur de réception'), fast: has('Restauration rapide')
  };
}

function activityItem(page, regular, label, checked, x, y) {
  checkbox(page, x, y - 1, checked, 7);
  text(page, regular, label, x + 11, y, 5.45, TEXT);
}

function yearFrom(membership) {
  return Number(String(membership.startDate || '').slice(0,4)) || Number(membership.year) || new Date().getFullYear();
}

export async function buildBulletinPdf({ logoBytes, company = {}, membership = {}, contact = {} }) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage(A4);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const logo = logoBytes ? await pdf.embedPng(logoBytes) : null;
  const W = page.getWidth(), H = page.getHeight();
  const m = 16;
  const year = yearFrom(membership);

  // Page border.
  page.drawRectangle({ x: 3, y: 3, width: W - 6, height: H - 6, borderColor: BORDER, borderWidth: .7, color: WHITE });

  // Header.
  if (logo) {
    const dims = logo.scale(0.20);
    const maxW = 188, maxH = 73;
    const scale = Math.min(maxW / dims.width, maxH / dims.height, 1);
    page.drawImage(logo, { x: 18, y: H - 94, width: dims.width * scale, height: dims.height * scale });
  }
  text(page, bold, "BULLETIN\nD'ADHÉSION", 226, H - 44, 21, NAVY);
  // pdf-lib does not wrap newlines; redraw second line explicitly.
  text(page, bold, "BULLETIN", 226, H - 40, 19.5, NAVY);
  text(page, bold, "D'ADHÉSION", 226, H - 68, 19.5, NAVY);
  line(page, 226, H - 84, 280, H - 84, GOLD, 2.2);
  text(page, bold, `ANNÉE ${year}`, 226, H - 109, 13.5, GOLD);

  line(page, 406, H - 16, 406, H - 137, rgb(.68,.68,.68), .7);
  // Simple gold icon cluster.
  page.drawCircle({ x: 437, y: H - 31, size: 3.8, color: GOLD });
  page.drawCircle({ x: 446, y: H - 31, size: 3.8, color: GOLD });
  page.drawCircle({ x: 441.5, y: H - 22, size: 3.8, color: GOLD });
  text(page, bold, 'Un réseau qui vous', 428, H - 50, 7.8, NAVY);
  text(page, bold, 'accompagne au quotidien', 428, H - 62, 7.8, NAVY);
  ['Conseil, défense, tarifs négociés,', 'formations, assurances, avantages', 'exclusifs... Le GHR est à vos côtés', 'pour vous informer, vous conseiller', 'et faire entendre votre voix.'].forEach((t, i) => text(page, regular, t, 428, H - 80 - i * 10, 5.8, TEXT));

  box(page, 84, H - 147, 206, 19, { border: rgb(.62,.66,.72), borderWidth: .65 });
  checkbox(page, 92, H - 141, norm(membership.type) !== norm('Renouvellement'), 7);
  text(page, bold, 'NOUVELLE ADHÉSION', 105, H - 140, 6.3, NAVY);
  checkbox(page, 198, H - 141, norm(membership.type) === norm('Renouvellement'), 7);
  text(page, bold, 'RENOUVELLEMENT', 211, H - 140, 6.3, NAVY);

  const leftX = 16, leftW = 344, rightX = 369, rightW = 210;

  // 1. Établissement
  let top = H - 162;
  box(page, leftX, top - 116, leftW, 116);
  sectionHeader(page, bold, 1, 'ÉTABLISSEMENT', leftX, top, leftW);
  fieldLine(page, regular, bold, "Nom de l'établissement", company.name, leftX + 10, top - 34, leftW - 20, { labelWidth: 85 });
  fieldLine(page, regular, bold, 'Raison sociale / Société', company.legalName, leftX + 10, top - 51, leftW - 20, { labelWidth: 117 });
  fieldLine(page, regular, bold, 'Adresse', company.address, leftX + 10, top - 68, leftW - 20, { labelWidth: 54 });
  fieldLine(page, regular, bold, 'Code postal', company.postalCode, leftX + 10, top - 85, 144, { labelWidth: 60 });
  fieldLine(page, regular, bold, 'Ville', company.city, leftX + 181, top - 85, 153, { labelWidth: 34 });
  fieldLine(page, regular, bold, 'Téléphone', company.phone, leftX + 10, top - 102, 144, { labelWidth: 49 });
  fieldLine(page, regular, bold, 'E-mail', company.email, leftX + 181, top - 102, 153, { labelWidth: 36 });

  // 6. Mode de règlement
  box(page, rightX, top - 158, rightW, 158, { fill: TINT, border: TINT });
  sectionHeader(page, bold, 6, 'MODE DE RÈGLEMENT', rightX, top, rightW, TINT);
  text(page, bold, 'Mode de règlement choisi :', rightX + 10, top - 40, 5.9, TEXT);
  const pay = norm(membership.paymentMethod);
  const payRows = [
    ['Chèque (à l’ordre de « GHR Région Sud »)', pay.includes('cheque')],
    ['Prélèvement SEPA (remplir le mandat ci-dessous)', pay.includes('sepa') || pay.includes('prelevement')],
    ['Virement', pay.includes('virement')],
  ];
  payRows.forEach(([label, checked], i) => { checkbox(page, rightX + 10, top - 56 - i*15, checked, 7); text(page, regular, label, rightX + 22, top - 55 - i*15, 5.35, TEXT, { maxWidth: rightW - 34 }); });
  box(page, rightX + 10, top - 150, rightW - 20, 54, { fill: WHITE, border: BLUE, borderWidth: .65 });
  text(page, bold, 'Coordonnées bancaires du GHR Région Sud', rightX + rightW/2, top - 111, 5.6, NAVY, { align: 'center' });
  text(page, bold, 'IBAN :', rightX + 20, top - 129, 5.4, NAVY);
  text(page, regular, 'FR76 1027 8097 1100 0206 6909 976/', rightX + 52, top - 129, 5.25, NAVY);
  text(page, bold, 'BIC :', rightX + 20, top - 143, 5.4, NAVY);
  text(page, regular, 'CMCIFR2A', rightX + 52, top - 143, 5.25, NAVY);

  // 2. Contact
  top -= 123;
  box(page, leftX, top - 92, leftW, 92);
  sectionHeader(page, bold, 2, 'CONTACT RÉFÉRENT', leftX, top, leftW);
  fieldLine(page, regular, bold, 'Nom', contact.lastName, leftX + 10, top - 40, 139, { labelWidth: 25 });
  fieldLine(page, regular, bold, 'Prénom', contact.firstName, leftX + 175, top - 40, 159, { labelWidth: 43 });
  fieldLine(page, regular, bold, 'Fonction', contact.role, leftX + 10, top - 58, leftW - 20, { labelWidth: 48 });
  fieldLine(page, regular, bold, 'Téléphone', contact.phone, leftX + 10, top - 77, 139, { labelWidth: 51 });
  fieldLine(page, regular, bold, 'E-mail', contact.email, leftX + 175, top - 77, 159, { labelWidth: 35 });

  // 7. SEPA
  const sepaTop = H - 328;
  box(page, rightX, sepaTop - 290, rightW, 290, { fill: TINT, border: TINT });
  sectionHeader(page, bold, 7, 'MANDAT DE PRÉLÈVEMENT SEPA', rightX, sepaTop, rightW, TINT);
  text(page, regular, 'À compléter uniquement en cas de prélèvement SEPA', rightX + 34, sepaTop - 32, 4.9, TEXT);
  let sy = sepaTop - 55;
  fieldLine(page, regular, bold, 'Titulaire du compte', membership.sepa?.accountHolder, rightX + 10, sy, rightW - 20, { labelWidth: 72 }); sy -= 18;
  fieldLine(page, regular, bold, 'Adresse', membership.sepa?.address, rightX + 10, sy, rightW - 20, { labelWidth: 43 }); sy -= 18;
  fieldLine(page, regular, bold, 'Code postal', membership.sepa?.postalCode, rightX + 10, sy, rightW - 20, { labelWidth: 58 }); sy -= 18;
  fieldLine(page, regular, bold, 'Ville', membership.sepa?.city, rightX + 10, sy, rightW - 20, { labelWidth: 30 }); sy -= 18;
  fieldLine(page, regular, bold, 'Pays', membership.sepa?.country || '', rightX + 10, sy, rightW - 20, { labelWidth: 32 }); sy -= 25;
  text(page, bold, 'Coordonnées bancaires', rightX + 10, sy, 5.7, TEXT); sy -= 18;
  fieldLine(page, regular, bold, 'IBAN', membership.sepa?.iban, rightX + 10, sy, rightW - 20, { labelWidth: 28 }); sy -= 24;
  fieldLine(page, regular, bold, 'BIC', membership.sepa?.bic, rightX + 10, sy, rightW - 20, { labelWidth: 24 }); sy -= 30;
  box(page, rightX + 10, sy - 50, rightW - 20, 50, { fill: WHITE, border: rgb(.72,.74,.78), borderWidth: .55 });
  text(page, bold, 'Créancier :', rightX + 16, sy - 12, 5.1, TEXT); text(page, regular, 'GHR Région Sud', rightX + 58, sy - 12, 5.1, TEXT);
  text(page, regular, '830 Boulevard de Léry - 83140 Six Fours Les Plages', rightX + 16, sy - 23, 4.8, TEXT, { maxWidth: rightW - 32 });
  text(page, bold, 'Type de paiement :', rightX + 16, sy - 34, 4.8, TEXT); text(page, regular, 'Paiement récurrent / Reconductible', rightX + 77, sy - 34, 4.8, TEXT);
  text(page, bold, 'Montant de la cotisation annuelle :', rightX + 16, sy - 45, 4.8, TEXT); text(page, bold, money(membership.amountExpected), rightX + rightW - 16, sy - 45, 4.9, BLUE, { align: 'right' });
  sy -= 60;
  box(page, rightX + 10, sy - 20, 132, 20, { fill: SOFT, border: SOFT });
  text(page, bold, 'Joindre obligatoirement un RIB', rightX + 23, sy - 13, 5.2, NAVY);

  // 3. Activité
  top -= 99;
  box(page, leftX, top - 195, leftW, 195);
  sectionHeader(page, bold, 3, 'ACTIVITÉ', leftX, top, leftW);
  text(page, regular, 'Type(s) d’activité (cochez votre ou vos activités principales)', leftX + 10, top - 38, 5.2, TEXT);
  const a = activitiesSelected(company);
  const cols = [leftX + 10, leftX + 117, leftX + 226];
  const ys = [top - 57, top - 77, top - 97, top - 117];
  activityItem(page, regular, 'Hôtel', a.hotel, cols[0], ys[0]);
  activityItem(page, regular, 'Hôtel 2★', a.hotel2, cols[1], ys[0]);
  activityItem(page, regular, 'Hôtel 3★', a.hotel3, cols[2], ys[0]);
  activityItem(page, regular, 'Hôtel 4★', a.hotel4, cols[0], ys[1]);
  activityItem(page, regular, 'Hôtel 5★', a.hotel5, cols[1], ys[1]);
  activityItem(page, regular, 'Hôtel de luxe', a.luxury, cols[2], ys[1]);
  activityItem(page, regular, 'Restaurant / Brasserie', a.restaurant, cols[0], ys[2]);
  activityItem(page, regular, 'Café / Bar', a.cafe, cols[1], ys[2]);
  activityItem(page, regular, 'Discothèque', a.disco, cols[2], ys[2]);
  activityItem(page, regular, 'Bar à ambiance', a.ambience, cols[0], ys[3]);
  activityItem(page, regular, 'Traiteur', a.caterer, cols[1], ys[3]);
  activityItem(page, regular, 'Restauration rapide', a.fast, cols[2], ys[3]);
  fieldLine(page, regular, bold, 'Autre', company.otherActivity, leftX + 10, top - 140, leftW - 20, { labelWidth: 35 });
  fieldLine(page, regular, bold, 'Nombre de salariés', company.employees, leftX + 10, top - 158, 164, { labelWidth: 95 });
  fieldLine(page, regular, bold, 'Nombre de chambres', company.rooms, leftX + 183, top - 158, 151, { labelWidth: 100 });
  fieldLine(page, regular, bold, 'Classement', company.classification, leftX + 10, top - 176, leftW - 20, { labelWidth: 60 });
  fieldLine(page, regular, bold, 'Type de licence', company.licenseType, leftX + 10, top - 194, leftW - 20, { labelWidth: 75 });

  // 4. Adhésion + bottom rows of activity in a separate compact box to preserve one page.
  top -= 202;
  box(page, leftX, top - 98, leftW, 98);
  fieldLine(page, regular, bold, 'Numéro de SIRET', company.siret, leftX + 10, top - 15, 160, { labelWidth: 82 });
  fieldLine(page, regular, bold, 'Code NAF', company.naf, leftX + 185, top - 15, 149, { labelWidth: 52 });
  fieldLine(page, regular, bold, "Statut juridique de l’exploitant", company.legalStatus, leftX + 10, top - 34, leftW - 20, { labelWidth: 145 });
  line(page, leftX + 8, top - 46, leftX + leftW - 8, top - 46, BORDER, .6);
  circleIcon(page, leftX + 14, top - 62, 10);
  text(page, bold, '4. ADHÉSION & COTISATION', leftX + 31, top - 66, 8.1, NAVY);
  fieldLine(page, regular, bold, `Montant de votre cotisation ${year}`, money(membership.amountExpected), leftX + 10, top - 80, leftW - 20, { labelWidth: 160 });
  fieldLine(page, regular, bold, "Type d’adhésion", membership.type, leftX + 10, top - 95, 182, { labelWidth: 75 });
  fieldLine(page, regular, bold, "Année d’adhésion", year, leftX + 201, top - 95, 133, { labelWidth: 78 });

  // 8. Validation
  const valTop = 187;
  box(page, rightX, valTop - 122, rightW, 122, { fill: TINT, border: TINT });
  sectionHeader(page, bold, 8, 'VALIDATION', rightX, valTop, rightW, TINT);
  fieldLine(page, regular, bold, 'Fait à', membership.signaturePlace, rightX + 10, valTop - 38, rightW - 20, { labelWidth: 35 });
  fieldLine(page, regular, bold, 'Le', membership.signatureDate, rightX + 10, valTop - 55, rightW - 20, { labelWidth: 20 });
  box(page, rightX + 10, valTop - 112, rightW - 20, 47, { fill: WHITE, border: rgb(.62,.64,.67), borderWidth: .55 });
  text(page, regular, "Signature et cachet de l’adhérent", rightX + rightW / 2, valTop - 87, 5.1, TEXT, { align: 'center' });

  // 5. Options
  const optTop = 166;
  box(page, leftX, optTop - 92, leftW, 92);
  sectionHeader(page, bold, 5, 'OPTIONS & AUTORISATIONS', leftX, optTop, leftW);
  text(page, regular, '(cochez vos choix)', leftX + 181, optTop - 19, 4.7, TEXT);
  booleanRow(page, regular, bold, 'Je souhaite recevoir la newsletter', membership.newsletter, leftX + 10, optTop - 40, leftW - 20);
  booleanRow(page, regular, bold, 'Je souhaite recevoir des informations sur GHR-Assurances', membership.insuranceInfo, leftX + 10, optTop - 55, leftW - 20);
  booleanRow(page, regular, bold, 'Je souhaite bénéficier de la protection juridique (en option à 72 €)', membership.legalProtection, leftX + 10, optTop - 70, leftW - 20);
  booleanRow(page, regular, bold, 'J’autorise le GHR Région Sud à faire état de mon adhésion lors de toute communication utile', membership.communicationConsent, leftX + 10, optTop - 85, leftW - 20);

  // Footer block and contacts.
  const footY = 18;
  box(page, leftX, footY + 21, 315, 42, { fill: WHITE, border: WHITE, borderWidth: 0 });
  box(page, leftX, footY + 21, 31, 42, { fill: NAVY, border: NAVY, borderWidth: 0 });
  page.drawCircle({ x: leftX + 15.5, y: footY + 42, size: 7, borderColor: WHITE, borderWidth: 1.2 });
  text(page, bold, 'Déductibilité fiscale', leftX + 39, footY + 52, 5.8, NAVY);
  text(page, regular, "Conformément aux dispositions du 1° du 1 de l’article 39 du Code général des impôts,", leftX + 39, footY + 42, 4.45, TEXT);
  text(page, regular, "vos cotisations d’adhésion peuvent être déduites de votre bénéfice net,", leftX + 39, footY + 34, 4.45, TEXT);
  text(page, regular, "en tant que « frais généraux ».", leftX + 39, footY + 26, 4.45, TEXT);

  text(page, bold, 'GHR Région Sud', rightX + 11, footY + 54, 5.6, NAVY);
  text(page, regular, '830 Boulevard de Léry - 83140 Six Fours Les Plages', rightX + 11, footY + 44, 4.8, TEXT);
  text(page, regular, 'www.ghr-regionsud.fr', rightX + 11, footY + 32, 4.9, NAVY);
  text(page, regular, 'contact@ghr-region-sud.fr', rightX + 107, footY + 32, 4.9, NAVY);
  line(page, 16, footY + 16, W - 16, footY + 16, GOLD, .8);
  text(page, regular, "Les informations recueillies sont nécessaires à la gestion de votre adhésion et à la relation avec votre organisation professionnelle.", 21, footY + 8, 3.8, MUTED);
  text(page, regular, "Vos données sont traitées conformément au RGPD. Vous disposez d’un droit d’accès, de rectification et de suppression sur simple demande.", 21, footY + 3, 3.8, MUTED);
  text(page, bold, `GHR-ADH-${year}-V2`, W - 18, footY + 3, 4.2, NAVY, { align: 'right' });

  pdf.setTitle(`Bulletin d'adhésion - ${clean(company.name) || 'GHR Région Sud'}`);
  pdf.setSubject(`Bulletin d'adhésion ${year}`);
  pdf.setCreator('CRM GHR Région Sud');
  pdf.setProducer('CRM GHR Région Sud');
  return await pdf.save({ useObjectStreams: false });
}
