import fs from "node:fs";
import { drawButton } from "./drawButton.js";
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class ButtonImage
{
    constructor(options)
    {
        if (options)
        {
            Object.assign(this, options);
        }
    }

    #backColor = "black";
    #svgForeColor = null;
    #svgFile;
    #svgCode;
    #svgScale = 1.0;
    #svgText = null;
    #text = null;
    #textColor = "white";
    #textAlign = "center";
    #textVAlign = "center";
    #font = "bold 16px sans-serif";
    #lineHeight = null;
    #textPadding = 3;
    #textTranslate = null;
    #rendered = null;
    
    #invalidate()
    {
        this.#rendered = null;
        this.onInvalidate?.();
    }

    async render(width, height)
    {
        if (!this.#rendered || this.#rendered.width != width || this.#rendered.height != height)
        {
            this.#rendered = {
                image: await drawButton(width, height, this),
                width,
                height,
            }
        }
        return this.#rendered.image;
    }

    get backColor()
    {
        return this.#backColor;
    }

    set backColor(value)
    {
        if (this.#backColor != value)
        {
            this.#backColor = value;
            this.#invalidate();
        }
    }

    get svgFile()
    {
        return this.#svgFile;
    }

    set svgFile(value)
    {
        if (this.#svgFile != value)
        {
            this.#svgFile = value;

            if (value)
            {
                if (value.startsWith("#"))
                {
                    value = join(__dirname, "images", value.substring(1) + ".svg");
                }
                // Load SVG file
                this.svgCode = fs.readFileSync(value, "utf8");
            }
            else
            {
                this.svgCode = null;
            }
        }
    }

    get svgCode()
    {
        return this.#svgCode;
    }

    set svgCode(value)
    {
        if (this.#svgCode != value)
        {
            this.#svgCode = value;
            this.#invalidate();
        }
    }

    get svgScale()
    {
        return this.#svgScale;
    }

    set svgScale(value)
    {
        if (this.#svgScale != value)
        {
            this.#svgScale = value;
            this.#invalidate();
        }
    }

    get svgText()
    {
        return this.#svgText;
    }

    set svgText(value)
    {
        if (this.#svgText != value)
        {
            this.#svgText = value;
            this.#invalidate();
        }
    }

    get svgForeColor()
    {
        return this.#svgForeColor;
    }

    set svgForeColor(value)
    {
        if (this.#svgForeColor != value)
        {
            this.#svgForeColor = value;
            this.#invalidate();
        }
    }

    get text()
    {
        return this.#text;
    }

    set text(value)
    {
        if (this.#text != value)
        {
            this.#text = value;
            this.#invalidate();
        }
    }

    get textColor()
    {
        return this.#textColor;
    }

    set textColor(value)
    {
        if (this.#textColor != value)
        {
            this.#textColor = value;
            this.#invalidate();
        }
    }

    get textAlign()
    {
        return this.#textAlign;
    }

    set textAlign(value)
    {
        if (this.#textAlign != value)
        {
            this.#textAlign = value;
            this.#invalidate();
        }
    }

    get textVAlign()
    {
        return this.#textVAlign;
    }

    set textVAlign(value)
    {
        if (this.#textVAlign != value)
        {
            this.#textVAlign = value;
            this.#invalidate();
        }
    }

    get font()
    {
        return this.#font;
    }

    set font(value)
    {
        if (this.#font != value)
        {
            this.#font = value;
            this.#invalidate();
        }
    }

    get lineHeight()
    {
        return this.#lineHeight;
    }

    set lineHeight(value)
    {
        if (this.#lineHeight != value)
        {
            this.#lineHeight = value;
            this.#invalidate();
        }
    }

    get textPadding()
    {
        return this.#textPadding;
    }

    set textPadding(value)
    {
        if (this.#textPadding != value)
        {
            this.#textPadding = value;
            this.#invalidate();
        }
    }

    get textTranslate()
    {
        return this.#textTranslate;
    }

    set textTranslate(value)
    {
        this.#textTranslate = value;
        this.#invalidate();
    }

}

export class StreamDeckDevice
{
    constructor(device)
    {
        this.#device = device;
        this.#buttons = new Array(this.#device.CONTROLS.find((control) => control.type === 'button').length);
    }

    #device = null;
    #buttons = null;

    setButton(index, button)
    {

    }
}

export class Button extends ButtonImage
{
    constructor()
    {
        super();
    }

    #device = null;
    #buttonIndex = null;

    onActivate(device, buttonIndex)
    {
        this.#device = device;
        this.#buttonIndex = buttonIndex;
    }

    onDeactivate()
    {
        this.#device = null;
        this.#buttonIndex = null;
    }

    onPress()
    {

    }

    onRelease()
    {

    }

    onInvalidate()
    {
        if (this.#device)
        {
            this.#device.invalidateButton(this);
        }
    }
}