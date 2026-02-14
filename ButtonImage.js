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

    #state = "normal";
    #virtualSize = { width: 72, height: 72 };
    #backColor = "black";
    #svgForeColor = null;
    #svgFile;
    #svgCode;
    #svgScale = 1.0;
    #svgText = null;
    #svgTranslate = null;
    #text = null;
    #textColor = "white";
    #textAlign = "center";
    #textVAlign = "center";
    #font = "bold 16px sans-serif";
    #textLineSpacing = 1;
    #textPadding = 3;
    #textTranslate = null;
    #renderCache = new Map();
    
    #invalidate()
    {
        this.#renderCache.clear();
        this.onInvalidate?.();
    }

    async render(width, height)
    {
        // Work out resolved stae
        let rs = this.resolvedState;

        // Check if have cached image at correct size
        let rendered = this.#renderCache.get(rs);
        if (!rendered || rendered.width != width || rendered.height != height)
        {
            // What to render
            let bi = this;

            // Override with active state?
            if (rs != "normal")
            {
                bi = Object.assign(cloneWithAccessorValues(this), this.states[rs]);
            }

            // Render it
            rendered = {
                image: await drawButton(width, height, bi),
                width,
                height,
            }

            // Cache it
            this.#renderCache.set(rs, rendered);
        }

        return rendered.image;
    }

    get state()
    {
        return this.#state;
    }
    
    set state(value)
    {
        if (this.#state != value)
        {
            let oldResolvedState = this.resolvedState;
            this.#state = value;
            if (this.resolvedState != oldResolvedState)
            {
                // NB: Invalidate button but not render cache
                this.onInvalidate?.();
            }
        }
    }

    get resolvedState()
    {
        if (!this.states)
            return "normal";

        if (this.states[this.#state] !== undefined)
            return this.#state;

        return "normal";
    }

    get virtualSize()
    {
        return this.#virtualSize;
    }

    set virtualSize(value)
    {
        if (this.#virtualSize != value)
        {
            this.#virtualSize = value;
            this.#invalidate();
        }
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

    get svgTranslate()
    {
        return this.#svgTranslate;
    }

    set svgTranslate(value)
    {
        this.#svgTranslate = value;
        this.#invalidate();
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

    get textLineSpacing()
    {
        return this.#textLineSpacing;
    }

    set textLineSpacing(value)
    {
        if (this.#textLineSpacing != value)
        {
            this.#textLineSpacing = value;
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

function cloneWithAccessorValues(obj) {
    let clone = {};
    let proto = obj;
    
    // Walk up the prototype chain
    while (proto && proto !== Object.prototype) {
        for (let key of Object.getOwnPropertyNames(proto)) {
            if (!(key in clone)) {
                clone[key] = obj[key];  // This will invoke getters
            }
        }
        proto = Object.getPrototypeOf(proto);
    }
    
    return clone;
}