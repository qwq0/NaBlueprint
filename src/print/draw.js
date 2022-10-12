import { getNElement } from "../../lib/qwqframe.js";

function initCanvas(scale = 1)
{
    var canvas = document.body.appendChild(document.createElement("canvas"));
    canvas.style.position = "fixed";
    canvas.style.zIndex = "1";
    canvas.style.left = "0px";
    canvas.style.top = "0px";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    const resize = () =>
    {
        canvas.width = Math.floor(canvas.clientWidth * window.devicePixelRatio * scale);
        canvas.height = Math.floor(canvas.clientHeight * window.devicePixelRatio * scale);
    };
    resize();
    window.addEventListener("resize", resize);
    return canvas;
}
export var canvas = getNElement(initCanvas());
export var scCt = canvas.element.getContext("2d");

/**
 * 绘制圆角矩形
 * @param {CanvasRenderingContext2D} ct
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} r
 */
export function drawRoundedRectangle(ct, x, y, w, h, r)
{
    var shortSide = Math.min(w, h);
    if (r > shortSide / 2)
        r = shortSide / 2;
    ct.beginPath();
    ct.moveTo(x + r, y);
    ct.arcTo(x + w, y, x + w, y + h, r); // 右上角
    ct.arcTo(x + w, y + h, x, y + h, r); // 右下角
    ct.arcTo(x, y + h, x, y, r); // 左下角
    ct.arcTo(x, y, x + w, y, r); // 左上角
    ct.closePath();
}


/**
 * 预渲染图像到ImageBitmap
 * @async
 * @param {number} width 
 * @param {number} height 
 * @param {function(CanvasRenderingContext2D): void} callback 
 * @returns {Promise<ImageBitmap>}
 */
export function preRendered(width, height, callback)
{
    var preRenderedCanvas = document.createElement("canvas");
    preRenderedCanvas.width = width;
    preRenderedCanvas.height = height;
    callback(preRenderedCanvas.getContext("2d"));
    return createImageBitmap(preRenderedCanvas, 0, 0, width, height);
}