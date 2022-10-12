import { forEach, forEachRev } from "../util/forEach.js";
import { canvas, drawRoundedRectangle, preRendered, scCt } from "./draw.js";
import { ListElement } from "./ListElement.js";
import { screenPosition } from "./ScreenPosition.js";

var blockMinWidth = 200;
var blockMinHeight = 120;

export class Block
{
    /**
     * 相对x坐标
     * @type {number}
     */
    x = 0;
    /**
     * 相对y坐标
     * @type {number}
     */
    y = 0;
    /**
     * 此块的宽度
     * @type {number}
     */
    width = blockMinWidth;
    /**
     * 此块的高度
     * @type {number}
     */
    height = blockMinHeight;
    /**
     * 显示此块
     * @type {boolean}
     */
    display = true;
    /**
     * 此块显示的标题
     * @type {string}
     */
    title = "";
    /**
     * 此块显示的注释
     * @type {string}
     */
    annotation = "";
    /**
     * 此块显示的文本
     * @type {string}
     */
    text = "";
    /**
     * 此块的预渲染ImageBitmap
     * @type {ImageBitmap}
     */
    imageBitmap = null;
    /**
     * 块类型
     * @type {string}
     */
    type = "";
    /**
     * 块上的额外数据
     * 此数据将被序列化
     * @type {Object}
     */
    data = null;
    /**
     * 左侧列表
     * @type {Array<ListElement>}
     */
    leftList = [];
    /**
     * 右侧列表
     * @type {Array<ListElement>}
     */
    rightList = [];
    /**
     * 子节点
     * 跟随父节点移动
     * @type {Array<Block>}
     */
    child = [];
    /**
     * 父节点
     * @type {Block}
     */
    parent = null;

    /**
     * @param {number} [x]
     * @param {number} [y]
     * @param {number} [width]
     * @param {number} [height]
     */
    constructor(x = 0, y = 0, width = blockMinWidth, height = blockMinHeight)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    /**
     * 重新绘制ImageBitmap
     */
    async refreshImageBitmap()
    {
        if (!this.display)
            return;
        var needRefresh = false;
        this.imageBitmap = await preRendered(this.width, this.height, ct =>
        {
            ct.fillStyle = "rgb(100, 100, 200)";
            drawRoundedRectangle(ct, 0, 0, this.width, this.height, 7);
            ct.fill(); // 背景框
            ct.lineWidth = 0.3;
            ct.strokeStyle = "rgb(230, 230, 230)";
            ct.stroke(); // 边框



            var titleY = 7;
            var leftMainConnector = false; // 有左侧主要信号接线柱
            var rightMainConnector = false; // 有右侧主要信号接线柱
            var expectedWidth = blockMinWidth; // 预期宽度
            var leftY = titleY;
            var rightY = titleY;


            // 绘制标题行
            if (this.title != "")
            {
                ct.fillStyle = "rgb(255, 255, 255)";
                ct.textBaseline = "top";
                ct.font = `${21}px SimHei,"Microsoft JhengHei",Arial,Helvetica,sans-serif`;
                var titleX = 9;
                leftMainConnector = (this.leftList.length >= 1 && this.leftList[0].title == "");
                rightMainConnector = (this.rightList.length >= 1 && this.rightList[0].title == "");
                if (leftMainConnector)
                    titleX += this.leftList[0].xDis + this.leftList[0].width;
                ct.fillText(this.title, titleX, titleY); // 标题
                if (!rightMainConnector)
                    expectedWidth = Math.max(20 + titleX + ct.measureText(this.title).width, expectedWidth); // 计算宽度
                else
                    expectedWidth = Math.max(40 + titleX + ct.measureText(this.title).width +
                        this.rightList[0].xDis + this.rightList[0].width, expectedWidth); // 计算宽度
                leftY += (leftMainConnector ? 3 : 28);
                rightY += (rightMainConnector ? 3 : 28);
            }


            // 绘制参数列表(并获取宽度)
            var leftWidth = this.leftList.map(o => // 传入列表
            {
                o.y = leftY;
                o.drawToCt(ct);

                leftY += o.height + 5;
                return o.getWidth(ct);
            });
            var rightWidth = this.rightList.map(o => // 传出列表
            {
                o.y = rightY;
                o.drawToCt(ct);

                rightY += o.height + 5;
                return o.getWidth(ct);
            });


            // 计算宽度
            var leftInd = 0, rightInd = 0;
            while (
                leftInd < leftWidth.length && rightInd < rightWidth.length &&
                this.leftList[leftInd].y + this.leftList[leftInd].height < this.rightList[rightInd].y
            )
                leftInd++;
            while (
                leftInd < leftWidth.length && rightInd < rightWidth.length &&
                this.rightList[rightInd].y + this.rightList[rightInd].height < this.leftList[leftInd].y
            )
                rightInd++;
            while (leftInd < leftWidth.length && rightInd < rightWidth.length)
            {
                let left = this.leftList[leftInd], right = this.rightList[rightInd];
                let leftBottom = left.y + left.height;
                let rightBottom = right.y + right.height;

                expectedWidth = Math.max(20 + leftWidth[leftInd] + rightWidth[rightInd], expectedWidth);

                if (leftBottom < rightBottom)
                    leftInd++;
                else if (leftBottom > rightBottom)
                    rightInd++;
                else
                {
                    leftInd++;
                    rightInd++;
                }
            }
            while (leftInd < leftWidth.length)
            {
                expectedWidth = Math.max(15 + leftWidth[leftInd], expectedWidth);
                leftInd++;
            }
            while (rightInd < rightWidth.length)
            {
                expectedWidth = Math.max(15 + rightWidth[rightInd], expectedWidth);
                rightInd++;
            }


            // 绘制注释
            var annotationY = Math.max(leftY, rightY);
            ct.fillStyle = "rgb(180, 250, 170)";
            ct.textBaseline = "top";
            ct.font = `${17}px SimHei,"Microsoft JhengHei",Arial,Helvetica,sans-serif`;
            this.annotation.split("\n").forEach(o =>
            {
                ct.fillText(o, 10, annotationY); // 注释
                expectedWidth = Math.max(25 + ct.measureText(o).width, expectedWidth); // 计算宽度
                annotationY += 18;
            });



            if (this.height != Math.max(annotationY, blockMinHeight)) // 高度与预期不符
            {
                this.height = Math.max(annotationY, blockMinHeight);
                needRefresh = true;
            }
            if (this.width != expectedWidth) // 宽度与预期不符
            {
                this.width = expectedWidth;
                needRefresh = true;
            }
        });
        if (needRefresh)
            await this.refreshImageBitmap();
    }

    /**
     * 判定此块是否在屏幕空间内
     * @param {number} parentX
     * @param {number} parentY
     * @param {number} viewW
     * @param {number} viewH
     */
    inScreenSpace(parentX, parentY, viewW, viewH)
    {
        var nowX = this.x + parentX, nowY = this.y + parentY;
        return (0 <= nowX + this.width && nowX < viewW && 0 <= nowY + this.height && nowY < viewH)
    }

    /**
     * 将此节点的ImageBitmap绘制到屏幕
     * 绘制到指定全局坐标
     * @param {number} x
     * @param {number} y
     */
    drawToScreen(x, y)
    {
        if (this.imageBitmap)
            scCt.drawImage(this.imageBitmap, x, y);
        else
        {
            scCt.fillStyle = "rgb(255, 255, 255)";
            scCt.fillRect(x, y, this.width, this.height);
        }
    }

    /**
     * 遍历子树并更新屏幕空间坐标
     * @param {number} parentX
     * @param {number} parentY
     */
    traverseRefreshScreenPosition(parentX, parentY)
    {
        var nowX = parentX + this.x, nowY = parentY + this.y; // 此节点的屏幕空间坐标

        screenPosition.set(this, nowX, nowY);
        this.leftList.forEach(o => o.refreshScreenPosition(nowX, nowY));
        this.rightList.forEach(o => o.refreshScreenPosition(nowX, nowY));

        this.child.forEach(o => // 遍历子节点
        {
            o.traverseRefreshScreenPosition(nowX, nowY);
        });
    }

    /**
     * 遍历子树并重新绘制bitmap
     */
    traverseRefreshImageBitmap()
    {
        this.refreshImageBitmap();
        this.child.forEach(o => // 遍历子节点
        {
            o.traverseRefreshImageBitmap();
        });
    }

    /**
     * 遍历树并绘制到屏幕
     * @param {number} parentX
     * @param {number} parentY
     */
    traverseDrawToScreen(parentX, parentY)
    {
        var nowX = parentX + this.x, nowY = parentY + this.y; // 此节点的屏幕空间坐标
        if (this.display && this.inScreenSpace(parentX, parentY, canvas.element.width, canvas.element.height))
            this.drawToScreen(nowX, nowY); // 绘制此块
        this.rightList.forEach(o => { o.drawLineToScreen(nowX, nowY); }); // 绘制连接线
        this.child.forEach(o => // 遍历子节点
        {
            o.traverseDrawToScreen(nowX, nowY);
        });
    }

    /**
     * 通过坐标获取块
     * 将遍历子节点
     * @param {number} x
     * @param {number} y
     * @param {number} parentX
     * @param {number} parentY
     * @returns {{ block: Block, listElement: ListElement }}
     */
    getObjByPosition(x, y, parentX, parentY)
    {
        var ret = null;
        var nowX = parentX + this.x, nowY = parentY + this.y; // 此节点的全局坐标
        if (this.child)
            forEachRev(this.child, o =>
            {
                if ((ret = o.getObjByPosition(x, y, nowX, nowY)).block)
                    return true;
                else
                    return false;
            });
        if ((!ret) && (nowX <= x && x < nowX + this.width && nowY <= y && y < nowY + this.height))
            ret = { block: this, listElement: this.getListElementByPosition(x - nowX, y - nowY) };
        return (ret ? ret : { block: null, listElement: null });
    }

    /**
     * 添加子节点
     * @param {Block} childBlock
     */
    addChild(childBlock)
    {
        childBlock.remove();
        this.child.push(childBlock);
        childBlock.parent = this;
    }

    getCopy()
    {
        var ret = new Block();
        ret.title = this.title;
        ret.text = this.text;
        return ret;
    }

    /**
     * 从块树中移除此块
     */
    remove()
    {
        if (this.parent)
        {
            this.parent.child.splice(this.parent.child.indexOf(this), 1);
            this.parent = null;
        }
    }

    /**
     * 添加左侧列表项
     * @param {ListElement} listElement
     */
    addLeftList(listElement)
    {
        listElement.remove();
        listElement.position = 0;
        this.leftList.push(listElement);
        listElement.parent = this;
    }

    /**
     * 添加右侧列表项
     * @param {ListElement} listElement
     */
    addRightList(listElement)
    {
        listElement.remove();
        listElement.position = 1;
        this.rightList.push(listElement);
        listElement.parent = this;
    }

    /**
     * 通过坐标获取参数列表项
     * 使用相对此块的坐标
     * 仅判定接线柱
     * @param {number} x
     * @param {number} y
     * @returns {ListElement}
     */
    getListElementByPosition(x, y)
    {
        var ret = null;
        forEach(this.leftList, o =>
        {
            var b = (o.xDis <= x && x < o.xDis + o.width && o.y <= y && y < o.y + o.height)
            if (b)
                ret = o;
            return b;
        });
        if (!ret)
            forEach(this.rightList, o =>
            {
                var b = (this.width - o.xDis - o.width <= x && x < this.width - o.xDis && o.y <= y && y < o.y + o.height)
                if (b)
                    ret = o;
                return b;
            });
        return ret;
    }
}