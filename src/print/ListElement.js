import { Block } from "./Block.js";
import { scCt } from "./draw.js";
import { screenPosition } from "./ScreenPosition.js";

export class ListElement
{
    /**
     * 此项在父节点所在的位置
     *  + 0 左侧
     *  + 1 右侧
     * @type {0 | 1}
     */
    position = 0;
    /**
     * 此项的标题
     * @type {string}
     */
    title = "";
    /**
     * 此项的描述
     * 鼠标悬浮显示的内容
     * @type {string}
     */
    text = "";
    /**
     * 连接到的位置
     * 仅传出参数设置
     * @type {Array<ListElement>}
     */
    linkTo = [];
    /**
     * 接线柱类型
     * @type {string}
     */
    type = "";
    /**
     * 接线柱上的额外数据
     * 此数据将被序列化
     * @type {Object}
     */
    data = null;
    /**
     * 此项在所在的块
     * @type {Block}
     */
    parent = null;
    /**
     * 接线块在x轴上相对所在块的所在边界的距离
     * @type {number}
     */
    xDis = 2;
    /**
     * 接线块的y坐标(相对所在块)
     * @type {number}
     */
    y = 0;
    /**
     * 接线块的宽度
     * @type {number}
     */
    width = 16;
    /**
     * 接线块的高度
     * @type {number}
     */
    height = 16;

    /**
     * 将此列表项绘制到块上
     * 绘制到指定画布上下文
     * 不包括连接线
     * @param {CanvasRenderingContext2D} ct
     */
    drawToCt(ct)
    {
        ct.fillStyle = "rgb(240, 240, 240)"
        ct.font = `${18}px SimHei,"Microsoft JhengHei",Arial,Helvetica,sans-serif`;
        ct.textBaseline = "middle";
        var textDis = this.xDis + this.width + 3;
        if (this.position == 0)
        {
            ct.fillRect(this.xDis, this.y,
                this.width, this.height); // 接线柱
            ct.textAlign = "left";
            ct.fillText(this.title,
                textDis, this.y + Math.round(this.height / 2)); // 标题
        }
        else
        {
            ct.fillRect(this.parent.width - this.xDis - this.width, this.y,
                this.width, this.height); // 接线柱
            ct.textAlign = "right";
            ct.fillText(this.title,
                this.parent.width - textDis, this.y + Math.round(this.height / 2)); // 标题
        }
    }

    /**
     * 更新屏幕空间坐标
     * 使用接线柱左上角的坐标
     * @param {number} parentX
     * @param {number} parentY
     */
    refreshScreenPosition(parentX, parentY)
    {
        screenPosition.set(this,
            parentX + (this.position == 0 ? this.xDis : this.parent.width - this.xDis - this.width), parentY + this.y);
    }

    /**
     * 绘制连接线到屏幕
     * @param {number} parentX 
     * @param {number} parentY 
     */
    drawLineToScreen(parentX, parentY)
    {
        if (this.position == 1)
        {
            scCt.strokeStyle = "rgb(240, 240, 240, 0.6)";
            this.linkTo.forEach(o =>
            {
                var startPos = screenPosition.get(this);
                var endPos = screenPosition.get(o);
                var currentStartX = startPos.x + this.width / 2;
                var currentStartY = startPos.y + this.height / 2;
                var currentEndX = endPos.x + o.width / 2;
                var currentEndY = endPos.y + o.height / 2;

                scCt.beginPath();
                scCt.moveTo(currentStartX, currentStartY);
                scCt.bezierCurveTo(
                    currentStartX + (currentEndX - currentStartX) * 0.3, currentStartY,
                    currentEndX - (currentEndX - currentStartX) * 0.3, currentEndY,
                    currentEndX, currentEndY
                );
                scCt.lineWidth = 5;
                scCt.stroke();
            });
        }
        else
            throw "Error: The left list element line cannot be drawn";
    }

    /**
     * 获取此项占用的宽度
     * @param {CanvasRenderingContext2D} ct
     */
    getWidth(ct)
    {
        ct.font = `${18}px SimHei,"Microsoft JhengHei",Arial,Helvetica,sans-serif`;
        return this.xDis + this.width + 3 + ct.measureText(this.title).width;
    }

    /**
     * 从所在块列表中移除此项
     */
    remove()
    {
        if (this.parent)
        {
            if (this.position == 0)
                this.parent.leftList.splice(this.parent.leftList.indexOf(this), 1);
            else
                this.parent.rightList.splice(this.parent.rightList.indexOf(this), 1);
            this.parent = null;
        }
    }

    /**
     * 添加连接线
     * @param {ListElement} target
     */
    addLink(target)
    {
        if (this.position == 0)
            target.addLink(this);
        else if (this.linkTo.indexOf(target) == -1)
            this.linkTo.push(target);
    }

    /**
     * 清除所有连接线
     */
    clearLinks()
    {
        if (this.position == 0)
            throw "Error: The left list element line cannot be clear";
        else
            this.linkTo = [];
    }
}