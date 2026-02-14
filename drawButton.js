import sharp from "sharp";
import { getSvgSize, scaleFont } from "./utils.js";
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
 * @returns {object} Sharp object
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
            svg = replace(/\$\(x\)/g, options.svgText)
        }

        // Replace color
        if (options.svgForeColor)
        {
            svg = svg.replace(/#848484/g, options.svgForeColor);
        }

        // Work out render density (just use height)
        let svgSize = getSvgSize(options.svgCode);
        let density = 72 * options.svgScale * height / svgSize.height ?? svgSize.viewBox[3] ?? height;

        // Render SVG pixels
        let svgBuf = await sharp(Buffer.from(svg), { density }).toBuffer({ resolveWithObject: true });


        compOps.push({
            input: svgBuf.data,
            top: Math.round((width - svgBuf.info.width) / 2 + (options.svgTranslate?.y ?? 0) * scaleY),
            left: Math.round((height - svgBuf.info.height) / 2 + (options.svgTranslate?.x ?? 0) * scaleX),
        });
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
    return await background
        .composite(compOps)
        .removeAlpha()
        .raw()
        .toBuffer();
}
