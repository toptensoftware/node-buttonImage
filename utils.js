import sharp from "sharp";
import { createCanvas } from "canvas";
import fs from 'node:fs';

/**
 * Extract width, height, and viewBox from an SVG string
 * by first isolating the <svg ...> tag
 * @param {string} svgText - SVG content as a string
 * @returns {{width: number|null, height: number|null, viewBox: [number, number, number, number]|null}}
 */
export function getSvgSize(svgText) {
  // Remove newlines for easier regex
  const text = svgText.replace(/\r?\n/g, " ");

  // Match the opening <svg ...> tag (non-greedy)
  const svgTagMatch = text.match(/<svg\b([^>]*)>/i);
  if (!svgTagMatch) return { width: null, height: null, viewBox: null };

  const svgTag = svgTagMatch[1]; // contents inside <svg ...>

  // Regex for width and height (matches units like px too)
  const widthMatch = svgTag.match(/\bwidth\s*=\s*["']?([\d.]+)(px)?["']?/i);
  const heightMatch = svgTag.match(/\bheight\s*=\s*["']?([\d.]+)(px)?["']?/i);

  const width = widthMatch ? parseFloat(widthMatch[1]) : null;
  const height = heightMatch ? parseFloat(heightMatch[1]) : null;

  // Regex for viewBox
  const viewBoxMatch = svgTag.match(/\bviewBox\s*=\s*["']?([\d.\-eE\s]+)["']?/i);
  let viewBox = null;
  if (viewBoxMatch) {
    const parts = viewBoxMatch[1].trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts.every(n => !isNaN(n))) {
      viewBox = parts; // [minX, minY, width, height]
    }
  }

  return { width, height, viewBox };
}


/**
 * Scale the font size in a CSS font string by a given factor
 * @param {string} fontStr - CSS font string (e.g. "italic bold 20px Arial")
 * @param {number} scale - Scaling factor (e.g. 1.5)
 * @returns {string} - New font string with scaled size
 */
export function scaleFont(fontStr, scale) {
  // Match the first occurrence of a pixel value like "20px"
  const regex = /(\d+(?:\.\d+)?)px/;
  const match = fontStr.match(regex);

  if (!match) {
    throw new Error('Font string must contain a pixel size (NNpx)');
  }

  const originalSize = parseFloat(match[1]);
  const scaledSize = originalSize * scale;

  // Replace the original size with the scaled size (keeping "px")
  return fontStr.replace(regex, `${scaledSize}px`);
}