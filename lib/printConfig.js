/**
 * NFCISTA Print Configuration
 *
 * Physical card dimensions and layout constants for the Dynamic QR
 * print-ready PDF generator. All values are in millimetres (mm)
 * unless noted otherwise.
 *
 * To change the physical card size, update ONLY this file.
 */

/** CR80 / standard business-card width in mm */
export const CARD_WIDTH_MM = 85.6;

/** CR80 / standard business-card height in mm */
export const CARD_HEIGHT_MM = 54;

/** Gap between cards on the printed sheet (mm) */
export const CARD_GAP_MM = 5;

/** Page margin on every side (mm) */
export const PAGE_MARGIN_MM = 10;

/** PDF page size for the print sheet */
export const PDF_PAGE_FORMAT = "a4";

/** PDF orientation */
export const PDF_ORIENTATION = "portrait";

/**
 * QR code size relative to card height.
 * The QR will occupy this many mm of the card's height.
 */
export const QR_SIZE_MM = 28;

/** Corner radius for drawn card outlines (mm) */
export const CARD_CORNER_RADIUS_MM = 3;

/**
 * QR-Only Print Sheet Configuration (A4)
 */
export const QR_SHEET_PAGE_FORMAT = "a4";
export const QR_SHEET_ORIENTATION = "portrait";
export const QR_SHEET_COLS = 4;
export const QR_SHEET_ROWS = 5;
export const QR_SHEET_CELL_WIDTH_MM = 44;
export const QR_SHEET_CELL_HEIGHT_MM = 50;
export const QR_SHEET_QR_SIZE_MM = 32;
export const QR_SHEET_MARGIN_X_MM = 17; // (210 - 4 * 44) / 2
export const QR_SHEET_MARGIN_Y_MM = 23.5; // (297 - 5 * 50) / 2

