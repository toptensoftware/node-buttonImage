import { createCanvas } from "canvas";

/**
 * Draw wrapped text on a transparent canvas with alignment options
 *
 * @param {string} text - Text to draw
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {object} options - Optional settings
 * @param {string} [options.font] - CSS font string (e.g. "bold 16px sans-serif")
 * @param {string} [options.foreColor] - Text color (default "#ffffff")
 * @param {number} [options.padding] - Padding inside canvas (default 3)
 * @param {"left"|"center"|"right"} [options.textAlign] - Horizontal alignment (default "center")
 * @param {"top"|"center"|"bottom"} [options.verticalAlign] - Vertical alignment (default "center")
 * @param {number} [options.translateX] - Horizontal translation
 * @param {number} [options.translateY] - Vertical translation
 * @returns {{ buffer: Buffer, width: number, height: number, channels: number }}
 */
export function drawText(
    text,
    width,
    height,
    options = {}
)
{
    let {
        font = "bold 16px sans-serif",
        foreColor = "#ffffff",
        padding = 3,
        textAlign = "center",
        verticalAlign = "center",
    } = options;

    if (!Array.isArray(padding))
    {
        padding = [padding, padding, padding, padding];
    }
    if (padding.length == 2)
    {
        padding = [padding[0], padding[1], padding[0], padding[1]];
    }

    let hPadding = padding[1] + padding[3];
    let vPadding = padding[0] + padding[2];

    let hSpace = width - hPadding;
    let vSpace = height - vPadding;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Transparent background
    ctx.clearRect(0, 0, width, height);

    // Text style
    ctx.fillStyle = foreColor;
    ctx.font = font;
    ctx.textAlign = textAlign;       // left, center, right
    ctx.textBaseline = "top";        // We'll handle vertical alignment manually

    // Word wrapping
    const words = text.split(" ");
    const lines = [];
    let line = "";

    let metrics = ctx.measureText("Xy");
    let lineHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    if (lineHeight < 20)
        lineHeight *= 1.0;
    if (lineHeight < 40)
        lineHeight *= 1.1;
    else
        lineHeight *= 1.2;

    if (options.lineSpacing)
        lineHeight * options.lineSpacing;

    for (let i = 0; i < words.length; i++) 
    {
        const testLine = line ? line + " " + words[i] : words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > hSpace)
        {
            if (line) 
            {
                lines.push(line);
                line = words[i];
            }
        }
        else
            line = testLine;
    }
    if (line) 
        lines.push(line);

    // Calculate starting Y based on vertical alignment
    const totalHeight = lines.length * lineHeight;
    let startY = padding[0];
    switch (verticalAlign)
    {
        case "center":
            startY = padding[0] + (vSpace - totalHeight) / 2;
            break;

        case "bottom":
            startY = height - totalHeight - padding[2];
            break;
    }

    // X position based on horizontal alignment
    let x = padding[3];
    switch (textAlign)
    {
        case "center":
            x = padding[3] + hSpace / 2;
            break;

        case "right":
            x = width - padding[1];
            break;
    }

    if (options.translateX !== undefined)
        x += options.translateX;
    if (options.translateY !== undefined)
        startY += options.translateY;


    // Draw each line
    lines.forEach((lineText, i) =>
    {
        const y = startY + i * lineHeight;
        ctx.fillText(lineText, x, y);
    });

    const buffer = canvas.toBuffer("raw"); // RGBA
    for (let i = 0; i < buffer.length; i += 4)
    {
        const r = buffer[i];
        buffer[i] = buffer[i + 2];
        buffer[i + 2] = r;
    }
    return { buffer, width, height, channels: 4 };
}

