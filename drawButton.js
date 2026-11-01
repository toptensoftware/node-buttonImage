import sharp from "sharp";
import { scaleFont } from "./utils.js";
import { drawText } from "./drawText.js";

/**
 * Draw a button image
 *
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {object} options - What to draw
 * @param {object} [options.virtualSize] - .width and .height of coordinates. (defaults to 72x72)
 * @param {string} [options.backColor] - background color
 * @param {string} [options.svgCode] - svg to draw
 * @param {number} [options.svgText] - text to replace $(x) in svg code
 * @param {number} [options.svgForeColor] - text to replace #848484 in svg code
 * @param {string} [options.text] - text to draw in foreground
 * @param {string} [options.textColor] - text color
 * @param {string} [options.font] - text font (with size in virtual px)
 * @param {number} [options.textPadding] - padding around the text (in virtual units)
 * @param {number} [options.textLineSpacing] - scaling factor for line spacing
 * @param {"left"|"center"|"right"} [options.textAlign] - Horizontal alignment (default "center")
 * @param {"top"|"center"|"bottom"} [options.textVAlign] - Vertical alignment (default "center")
 * @param {number} [options.textTranslate] - optional .x and .y translation of text (in virtual px)
 * @param {3|4} [options.channels] - 3 for opaque RGB, 4 for RGBA with alpha (default 3)
 * @returns {Promise<Buffer>} Raw pixel buffer (RGB or RGBA depending on channels)
 */

export async function drawButton(width, height, options)
{
    let virtualSize = options.virtualSize ?? { width: 72, height: 72 };
    let scaleX = width / virtualSize.width;
    let scaleY = height / virtualSize.height;

    // Render background
    let background = sharp({
        create: {
            width: width,
            height: height,
            channels: 4, 
            background: options.backColor ?? "black"
        }
    });

    let compOps = [];

    // Render SVG
    if (options.svgCode)
    {
        // Get svg code
        let svg = options.svgCode;

        // Insert replacement text
        if (options.svgText)
        {
            svg = svg.replace(/\$\(x\)/g, options.svgText);
        }

        // Replace color
        if (options.svgForeColor)
        {
            svg = svg.replace(/#848484/g, options.svgForeColor);
        }

        // Work out render density so the svg's height = button height * svgScale.
        // sharp reports an svg's natural size at 72 dpi, which covers svgs
        // sized by width/height attributes or by viewBox alone.
        let svgMeta = await sharp(Buffer.from(svg)).metadata();
        let density = 72 * (options.svgScale ?? 1) * height / svgMeta.height;

        // Render SVG pixels
        let svgBuf = await sharp(Buffer.from(svg), { density }).toBuffer({ resolveWithObject: true });
        let svgW = svgBuf.info.width;
        let svgH = svgBuf.info.height;

        // Position (centered, plus translation)
        let left = Math.round((width - svgW) / 2 + (options.svgTranslate?.x ?? 0) * scaleX);
        let top = Math.round((height - svgH) / 2 + (options.svgTranslate?.y ?? 0) * scaleY);

        // sharp can't composite an image larger than the background, so crop
        // the rendered pixels to the part that falls on the button
        let x0 = Math.max(0, -left);
        let y0 = Math.max(0, -top);
        let x1 = Math.min(svgW, width - left);
        let y1 = Math.min(svgH, height - top);
        if (x1 > x0 && y1 > y0)
        {
            let input = svgBuf.data;
            if (x0 > 0 || y0 > 0 || x1 < svgW || y1 < svgH)
            {
                input = await sharp(svgBuf.data)
                    .extract({ left: x0, top: y0, width: x1 - x0, height: y1 - y0 })
                    .toBuffer();
            }

            compOps.push({
                input,
                left: left + x0,
                top: top + y0,
            });
        }
    }

    // Render text
    if (options.text && options.text != "")
    {
        let padding = options.textPadding;
        if (!Array.isArray(padding))
        {
            padding = [padding, padding, padding, padding];
        }
        if (padding.length == 2)
        {
            padding = [padding[0], padding[1], padding[0], padding[1]];
        }
        padding[0] = padding[0] * scaleY;
        padding[1] = padding[1] * scaleX;
        padding[2] = padding[2] * scaleY;
        padding[3] = padding[3] * scaleX;

        let textBuf = drawText(options.text, width, height, {
            font: scaleFont(options.font ?? "bold 16px sans-serif", scaleY),
            foreColor: options.textColor,
            padding: padding,
            textAlign: options.textAlign,
            verticalAlign: options.textVAlign,
            lineSpacing: options.textLineSpacing,
            translateX: (options.textTranslate?.x ?? 0) * scaleX,
            translateY: (options.textTranslate?.y ?? 0) * scaleY,
        });

        compOps.push({
            input: textBuf.buffer,
            raw: {
                width: textBuf.width,
                height: textBuf.height,
                channels: textBuf.channels,
            },
            top: 0,
            left: 0,
        })

    }

    // Composite
    let channels = options.channels ?? 3;
    if (channels != 3 && channels != 4)
        throw new Error(`channels must be 3 or 4 (got ${channels})`);

    let img = background.composite(compOps);
    if (channels == 3)
        img = img.removeAlpha();

    return await img.raw().toBuffer();
}
