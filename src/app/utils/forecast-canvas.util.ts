import { DayForecast, GuildStock } from '../models/material.model';
import { getMaterialIcon } from './material-icon.util';
import { getGuildIcon, getGuildColor } from './guild-icon.util';
import { translateMaterialName } from './material-translation.util';
import { Language } from '../services/settings.service';

interface ForecastExportOptions {
  today: DayForecast;
  tomorrow: DayForecast | null;
  mode: 'single' | 'both';
  lang: Language;
}

/**
 * Loads an image safely without throwing or rejecting on 404/offline errors.
 */
function loadImageSafely(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null); // Never reject! Graceful fallback
    img.src = src;
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

interface ComputedPill {
  name: string;
  iconSrc: string;
  width: number;
  height: number;
  x: number;
  y: number;
}

interface ComputedRow {
  guild: GuildStock;
  guildIconSrc: string;
  guildColor: string;
  rowX: number;
  rowY: number;
  rowWidth: number;
  rowHeight: number;
  pills: ComputedPill[];
}

/**
 * Computes layout metrics for a list of guilds.
 */
function layoutGuildRows(
  ctx: CanvasRenderingContext2D,
  guilds: GuildStock[],
  startX: number,
  startY: number,
  rowWidth: number,
  lang: Language
): { rows: ComputedRow[]; totalHeight: number } {
  const colGuildWidth = 155;
  const pillPaddingX = 8;
  const pillHeight = 24;
  const pillGapX = 6;
  const pillGapY = 5;
  const rowPaddingY = 8;

  let currentY = startY;
  const rows: ComputedRow[] = [];

  for (const g of guilds) {
    const pills: ComputedPill[] = [];
    const matsStartX = startX + colGuildWidth + 10;
    const matsMaxX = startX + rowWidth - 10;
    const availableWidth = matsMaxX - matsStartX;

    let cursorX = matsStartX;
    let cursorY = currentY + rowPaddingY;
    let linesCount = 1;

    ctx.font = '11px sans-serif';

    for (const m of g.materials) {
      const translated = translateMaterialName(m, lang);
      const textWidth = ctx.measureText(translated).width;
      const pillW = 16 + 5 + textWidth + pillPaddingX * 2; // icon(16) + gap(5) + text + pad

      if (cursorX + pillW > matsMaxX && cursorX > matsStartX) {
        // Move to next line
        cursorX = matsStartX;
        cursorY += pillHeight + pillGapY;
        linesCount++;
      }

      pills.push({
        name: translated,
        iconSrc: getMaterialIcon(m),
        width: pillW,
        height: pillHeight,
        x: cursorX,
        y: cursorY
      });

      cursorX += pillW + pillGapX;
    }

    const computedRowHeight = Math.max(46, (linesCount * (pillHeight + pillGapY)) - pillGapY + (rowPaddingY * 2));

    rows.push({
      guild: g,
      guildIconSrc: getGuildIcon(g.guildName),
      guildColor: getGuildColor(g.guildName),
      rowX: startX,
      rowY: currentY,
      rowWidth,
      rowHeight: computedRowHeight,
      pills
    });

    currentY += computedRowHeight + 8; // 8px gap between rows
  }

  const totalHeight = currentY - startY;
  return { rows, totalHeight };
}

/**
 * Preloads all unique images required by the export.
 */
async function preloadImages(
  logoSrc: string,
  rowsA: ComputedRow[],
  rowsB: ComputedRow[] = []
): Promise<Map<string, HTMLImageElement>> {
  const urls = new Set<string>();
  if (logoSrc) urls.add(logoSrc);

  for (const r of [...rowsA, ...rowsB]) {
    if (r.guildIconSrc) urls.add(r.guildIconSrc);
    for (const p of r.pills) {
      if (p.iconSrc) urls.add(p.iconSrc);
    }
  }

  const imageMap = new Map<string, HTMLImageElement>();
  await Promise.all(
    Array.from(urls).map(async (url) => {
      const img = await loadImageSafely(url);
      if (img) {
        imageMap.set(url, img);
      }
    })
  );

  return imageMap;
}

/**
 * Generates a high-resolution, offline-safe PNG data URL of the guild materials forecast.
 */
export async function generateForecastImage(options: ForecastExportOptions): Promise<string> {
  const { today, tomorrow, mode, lang } = options;
  const isBoth = mode === 'both' && !!tomorrow;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  const scale = 2; // Retina sharpness

  // 1. Measure layout dimensions
  const paddingX = 22;
  const headerHeight = isBoth ? 95 : 82;
  const footerHeight = 44;

  let logicalWidth: number;
  let logicalHeight: number;
  let rowsToday: ComputedRow[] = [];
  let rowsTomorrow: ComputedRow[] = [];

  if (!isBoth) {
    logicalWidth = 600;
    const contentWidth = logicalWidth - (paddingX * 2);
    const layout = layoutGuildRows(ctx, today.guilds, paddingX, headerHeight + 14, contentWidth, lang);
    rowsToday = layout.rows;
    logicalHeight = headerHeight + 14 + layout.totalHeight + footerHeight;
  } else {
    logicalWidth = 1180;
    const colWidth = (logicalWidth - (paddingX * 2) - 18) / 2; // 18px column gap
    const startY = headerHeight + 46; // extra space for column tags
    const layoutToday = layoutGuildRows(ctx, today.guilds, paddingX, startY, colWidth, lang);
    const layoutTomorrow = layoutGuildRows(ctx, tomorrow!.guilds, paddingX + colWidth + 18, startY, colWidth, lang);

    rowsToday = layoutToday.rows;
    rowsTomorrow = layoutTomorrow.rows;
    const maxContentHeight = Math.max(layoutToday.totalHeight, layoutTomorrow.totalHeight);
    logicalHeight = startY + maxContentHeight + footerHeight;
  }

  // Set real canvas dimensions with scale
  canvas.width = Math.round(logicalWidth * scale);
  canvas.height = Math.round(logicalHeight * scale);
  ctx.scale(scale, scale);

  // 2. Preload assets
  const logoUrl = 'assets/icon/last_codex.png';
  const images = await preloadImages(logoUrl, rowsToday, rowsTomorrow);

  // 3. Draw Background
  ctx.fillStyle = '#161514';
  ctx.fillRect(0, 0, logicalWidth, logicalHeight);

  // Outer border
  ctx.strokeStyle = '#bda545';
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, 1, 1, logicalWidth - 2, logicalHeight - 2, 8);
  ctx.stroke();

  // 4. Draw Header
  const logoImg = images.get(logoUrl);
  if (logoImg) {
    ctx.save();
    drawRoundedRect(ctx, paddingX, 18, 44, 44, 22);
    ctx.clip();
    ctx.drawImage(logoImg, paddingX, 18, 44, 44);
    ctx.restore();
    ctx.strokeStyle = '#bda545';
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, paddingX, 18, 44, 44, 22);
    ctx.stroke();
  }

  // App Title & Subtitle
  ctx.fillStyle = '#bda545';
  ctx.font = 'bold 20px serif, Georgia, sans-serif';
  ctx.fillText('LastResources', paddingX + 54, 38);

  ctx.fillStyle = '#8f887c';
  ctx.font = '11px sans-serif';
  const subtitle = lang === 'es'
    ? 'Pronóstico de Tiendas de Gremio — Orna RPG'
    : 'Guild Shop Material Stock Forecast — Orna RPG';
  ctx.fillText(subtitle, paddingX + 54, 55);

  if (!isBoth) {
    // Single Day Badge on right
    const badgeText = lang === 'es' ? 'HOY' : 'TODAY';
    ctx.font = 'bold 10px sans-serif';
    const tagW = ctx.measureText(badgeText).width + 12;
    const tagX = logicalWidth - paddingX - tagW;
    const tagY = 22;

    ctx.fillStyle = 'rgba(189, 165, 69, 0.2)';
    drawRoundedRect(ctx, tagX, tagY, tagW, 18, 4);
    ctx.fill();
    ctx.strokeStyle = '#bda545';
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, tagX, tagY, tagW, 18, 4);
    ctx.stroke();

    ctx.fillStyle = '#bda545';
    ctx.fillText(badgeText, tagX + 6, tagY + 13);

    // Date
    ctx.fillStyle = '#eeeeee';
    ctx.font = 'bold 12px serif, Georgia, sans-serif';
    const dateW = ctx.measureText(today.dateTitle).width;
    ctx.fillText(today.dateTitle, logicalWidth - paddingX - dateW, 55);

    // Divider Line
    ctx.strokeStyle = '#bda545';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(paddingX, headerHeight);
    ctx.lineTo(logicalWidth - paddingX, headerHeight);
    ctx.stroke();
  } else {
    // Dual Summary Pills on Right
    ctx.font = 'bold 11px sans-serif';
    const pill1 = `${lang === 'es' ? 'HOY' : 'TODAY'}: ${today.dateTitle}`;
    const pill2 = `${lang === 'es' ? 'MAÑANA' : 'TOMORROW'}: ${tomorrow!.dateTitle}`;

    const p2W = ctx.measureText(pill2).width + 16;
    const p1W = ctx.measureText(pill1).width + 16;
    const rightX = logicalWidth - paddingX;

    // Pill 2 (Tomorrow)
    ctx.fillStyle = 'rgba(79, 195, 247, 0.18)';
    drawRoundedRect(ctx, rightX - p2W, 36, p2W, 22, 5);
    ctx.fill();
    ctx.strokeStyle = '#4fc3f7';
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, rightX - p2W, 36, p2W, 22, 5);
    ctx.stroke();
    ctx.fillStyle = '#4fc3f7';
    ctx.fillText(pill2, rightX - p2W + 8, 51);

    // Pill 1 (Today)
    ctx.fillStyle = 'rgba(189, 165, 69, 0.18)';
    drawRoundedRect(ctx, rightX - p2W - p1W - 10, 36, p1W, 22, 5);
    ctx.fill();
    ctx.strokeStyle = '#bda545';
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, rightX - p2W - p1W - 10, 36, p1W, 22, 5);
    ctx.stroke();
    ctx.fillStyle = '#bda545';
    ctx.fillText(pill1, rightX - p2W - p1W - 2, 51);

    // Divider Line
    ctx.strokeStyle = '#bda545';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(paddingX, headerHeight);
    ctx.lineTo(logicalWidth - paddingX, headerHeight);
    ctx.stroke();

    // Column Headers
    const colW = (logicalWidth - (paddingX * 2) - 18) / 2;
    // Left column header
    ctx.fillStyle = 'rgba(189, 165, 69, 0.12)';
    drawRoundedRect(ctx, paddingX, headerHeight + 10, colW, 26, 5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(189, 165, 69, 0.4)';
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, paddingX, headerHeight + 10, colW, 26, 5);
    ctx.stroke();
    ctx.fillStyle = '#bda545';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`★ ${lang === 'es' ? 'HOY' : 'TODAY'} — ${today.dateTitle}`, paddingX + 12, headerHeight + 27);

    // Right column header
    const col2X = paddingX + colW + 18;
    ctx.fillStyle = 'rgba(79, 195, 247, 0.12)';
    drawRoundedRect(ctx, col2X, headerHeight + 10, colW, 26, 5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(79, 195, 247, 0.4)';
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, col2X, headerHeight + 10, colW, 26, 5);
    ctx.stroke();
    ctx.fillStyle = '#4fc3f7';
    ctx.fillText(`★ ${lang === 'es' ? 'MAÑANA' : 'TOMORROW'} — ${tomorrow!.dateTitle}`, col2X + 12, headerHeight + 27);
  }

  // 5. Render Rows Function
  const renderRows = (rows: ComputedRow[]) => {
    for (const r of rows) {
      // Row box
      ctx.fillStyle = '#201f1e';
      drawRoundedRect(ctx, r.rowX, r.rowY, r.rowWidth, r.rowHeight, 6);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      drawRoundedRect(ctx, r.rowX, r.rowY, r.rowWidth, r.rowHeight, 6);
      ctx.stroke();

      // Guild icon or color dot
      const gImg = r.guildIconSrc ? images.get(r.guildIconSrc) : null;
      const iconY = r.rowY + 11;
      if (gImg) {
        ctx.drawImage(gImg, r.rowX + 10, iconY, 20, 20);
      } else {
        ctx.fillStyle = r.guildColor || '#bda545';
        ctx.beginPath();
        ctx.arc(r.rowX + 18, iconY + 10, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Guild Name
      ctx.fillStyle = '#eeeeee';
      ctx.font = 'bold 12px sans-serif';
      const maxGuildTextW = 120;
      let displayName = r.guild.guildName;
      if (ctx.measureText(displayName).width > maxGuildTextW) {
        while (displayName.length > 3 && ctx.measureText(displayName + '…').width > maxGuildTextW) {
          displayName = displayName.slice(0, -1);
        }
        displayName += '…';
      }
      ctx.fillText(displayName, r.rowX + 36, iconY + 14);

      // Material Pills
      for (const p of r.pills) {
        ctx.fillStyle = '#2a2826';
        drawRoundedRect(ctx, p.x, p.y, p.width, p.height, 5);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, p.x, p.y, p.width, p.height, 5);
        ctx.stroke();

        const mImg = p.iconSrc ? images.get(p.iconSrc) : null;
        if (mImg) {
          ctx.drawImage(mImg, p.x + 6, p.y + 4, 16, 16);
        } else {
          ctx.fillStyle = '#bda545';
          ctx.beginPath();
          ctx.arc(p.x + 12, p.y + 12, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#e4dfd7';
        ctx.font = '11px sans-serif';
        ctx.fillText(p.name, p.x + 26, p.y + 16);
      }
    }
  };

  renderRows(rowsToday);
  if (isBoth && rowsTomorrow.length > 0) {
    renderRows(rowsTomorrow);
  }

  // 6. Draw Footer
  const footerY = logicalHeight - 16;
  ctx.fillStyle = '#7a756d';
  ctx.font = '10.5px sans-serif';
  const footerText = 'Generado por LastResources • https://lastresources.vercel.app • Orna Community Tools';
  ctx.fillText(footerText, paddingX, footerY);

  return canvas.toDataURL('image/png', 0.98);
}
