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

let img = await bi.render(128,128);

img.toFile("test.png");

/*
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
        */