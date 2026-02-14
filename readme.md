# node-winkeyhook

A library for generating button images for hardware devices such as StreamDeck.

## Installation

```
npm install --save toptensoftware/node-buttonImage
```

## Basic Usage

Create an instance of the `ButtonImage` class, passing settings for what to render:

```js
import { ButtonImage } from "@toptensoftware/node-buttonImage";

// Create button
let bi = new ButtonImage({
    svgFile = "./myIcon.svg",
    backColor = "black",
});
```

Call `render` to render the image to a raw image buffer:

```js
// Returns a raw rgb (3-channel) image buffer of requested size
let img = await bi.render(72, 72);

// Send to stream-deck
await device.fillKeyBuffer(buttonIndex, pixels);
```


## Button States

Often you'll want to create variations on button to show different states:

```js
// Create a button with a "checked" state
let bi = new ButtonImage({
    svgFile = "./myIcon.svg",
    backColor = "black",
    states: {
        checked: {
            backColor: "orange",
        }
    }
});
```

The `ButtonImage`'s state property determines which image is rendered:

```js
bi.state = "checked";
bi.render(...);      // Will return the checked version
```

Note: the properties of each state are merged over the base button image
properties so you only need to define the settings that are different
for that state.



## Invalidation

The `onInvalidate` method of the `ButtonImage` class is called if any
of the base properties are changed:

```js
// Create a button
let bi = new ButtonImage({
    svgFile = "./myIcon.svg",
    backColor = "black",
});

// Hook up change handler
bi.onInvalidate = () => { /* send new image to device */ }

// Change something, device will update automatically.
bi.backColor = "green";
```

Note: changing a properties of state objects doesn't trigger invalidation, but changing the `state` property itself does.

```js
// WRONG: this doesn't trigger invalidate
bi.states.checked.backColor = "green";

// This will trigger invalidation:
bi.state = "checked";
```



## Image Properties

The following properties control the rendered image:

* `backColor` - the background color of the image (default = "black")
* `svgForeColor` - a color that will replace any `#848484` color in the SVG file
* `svgFile` - path to an SVG file to be rendered (or a special built-in icon - see below).
* `svgCode` - SVG as a text string
* `svgScale` - scaling to be applied to the SVG
* `svgText` - text that will replace `$(x)` in the SVG file
* `svgTranslate` - SVG translation `{ x: number, y: number }`
* `text` - text to be drawn in front of the SVG
* `textColor` - text color
* `textAlign` - text horizontal alignment - "left", "right" or "center"
* `textVAlign` - text vertical alignment - "top", "bottom" or "center
* `font` - CSS font string eg: "bold 16px sans-serif"
* `textLineSpacing` - scaling factor for text line spacing (default = 1)
* `textPadding` - text padding - either a single number for all sides, or `[topBottom, leftRight]` or `[top, right, bottom, left]`
* `textTranslate` - text offset `{ x: number, y: number }`
* `virtualSize` - virtual size for scaling (see below)



## Units and Scaling

By default all images have a default "virtual size" of 72x72 virtual pixels.
This can be changed using the `virtualSize` property.

All size based properties (eg: `svgTranslate`, `textPadding`, font size etc...) are scaled using the `virtualSize` and the render size.

ie: with a virtual size of 72, a value of 36 will always be half the size
of the image - no matter the size it's actually rendered at.

Note this virtual size is independent of an SVG sizing.  SVG files are always
rendered to fit the renderSize multiplied by the svgScale.



## Color Values

All color values are CSS color values.  

eg: "red", "#FF0000", "#F00" etc..


## Rendered Image Caching

The `ButtonImage` class caches the images returned from the `render()` method and
returns the same result for subsequent requests for the same size and state.

If any of the `ButtonImage`'s properties are changed, the cache is discarded.

The cache maintains one rendered image per-state.  Requesting the same image state
at the same size will return the cached image.  Requesting a different size will
discard the last cached image and cache the result of the new rendering.

ie: if rendering the same button to multiple devices it's best to use multiple
`ButtonImage` instances, one for each device.


## Built-in Icons

For convenience and testing a standard set of icons are included.  To
reference these prefix the "svgFile" property value with `#`.

eg: 

```js
// Create image using built-in icon
let bi = new ButtonImage({
    svgFile = "#heart",
    svgForeColor = "red",
});
```

See the [images](./images/) folder for the list of available icons.


## The `drawButton` Function

Instead of using the `ButtonImage` class, images can be rendered directly
using the `drawButton` function.

```js
import { drawButton } from "@toptensoftware/node-buttonImage";
let img = drawButton(72, 72, {
    // same settings as ButtonImage class
});
```



## Material Icons

Google's material icons are a great resource for icon images (and most of the 
built-in icons come from there).  However... they're generally oversized
for hardware devices and need to be scaled down.

This can be done using the `svgScale` property, or  the scaling can be baked into 
the svg by adjusting the original Material icon `svg` node with:

`
<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="-144 -1104 1248 1248" width="24px" fill="#848484">
`

Note: this reduces the size of the icon (by adjusting the viewBox) and sets the 
fill color (to #848484) so the `svgForeColor` property can be used to change the 
icon color.



## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
