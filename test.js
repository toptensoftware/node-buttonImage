import sharp from "sharp";
import { ButtonImage } from "./ButtonImage.js";

let bi = new ButtonImage();
bi.backColor = "black";
bi.svgFile = "#apple-tv";
bi.svgForeColor = "#404040";
bi.svgTranslate = { y: -7 };
bi.text = "Hello!";
bi.textColor = "white";
bi.textVAlign = "bottom";
bi.textAlign = "center";

bi.virtualSize = { width: 72, height: 72 };

let img = await bi.render(128, 128);

// render() returns raw pixels, so wrap them in sharp to save as PNG
await sharp(img, { raw: { width: 128, height: 128, channels: 3 } }).toFile("test.png");
