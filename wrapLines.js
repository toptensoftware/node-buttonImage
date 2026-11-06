/**
 * Split text into lines that fit a width: "\n" (or "\r\n") always breaks,
 * and each line is word-wrapped on spaces. A word wider than the line gets
 * a line of its own.
 *
 * @param {string} text - Text to wrap
 * @param {(s: string) => number} measure - Width of a string
 * @param {number} maxWidth - Available width
 * @returns {string[]}
 */
export function wrapLines(text, measure, maxWidth)
{
    const lines = [];
    for (const paragraph of text.split(/\r?\n/))
    {
        let line = "";
        for (const word of paragraph.split(" "))
        {
            const testLine = line ? line + " " + word : word;
            if (line && measure(testLine) > maxWidth)
            {
                lines.push(line);
                line = word;
            }
            else
                line = testLine;
        }
        lines.push(line);
    }
    return lines;
}
