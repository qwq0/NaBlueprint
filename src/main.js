import { current } from "./control/mouse.js";
import { Block } from "./print/Block.js";
import { blockTree } from "./print/BlockTree.js";
import { canvas, scCt } from "./print/draw.js";
import { ListElement } from "./print/ListElement.js";
import { screenPosition } from "./print/ScreenPosition.js";
import { blockTreeStorage } from "./print/storage.js";



var workspace = sessionStorage.getItem("workspace");
if (workspace)
{
    blockTree.root = blockTreeStorage.deserialize(workspace);
}
setInterval(() =>
{
    window.sessionStorage.setItem("workspace", blockTreeStorage.serialize(blockTree.root));
}, 2000);




/**
 * 每帧渲染
 */
function eachFrame()
{
    scCt.clearRect(0, 0, canvas.element.width, canvas.element.height);


    blockTree.traverseRefreshScreenPosition() // 更新坐标
    blockTree.traverseDrawToScreen(); // 绘制块

    if (current.listElement) // 绘制当前连线
    {
        let pos = screenPosition.get(current.listElement);
        let currentLineStartX = pos.x + current.listElement.width / 2;
        let currentLineStartY = pos.y + current.listElement.height / 2;
        scCt.beginPath();
        scCt.moveTo(currentLineStartX, currentLineStartY);
        scCt.bezierCurveTo(
            currentLineStartX + (current.lineX - currentLineStartX) * 0.3, currentLineStartY,
            current.lineX - (current.lineX - currentLineStartX) * 0.3, current.lineY,
            current.lineX, current.lineY
        );
        scCt.strokeStyle = "rgb(240, 240, 240, 0.5)";
        scCt.lineWidth = 3;
        scCt.stroke();
    }


    requestAnimationFrame(eachFrame);
}
requestAnimationFrame(eachFrame);



