import { Block } from "./Block.js";
import { ListElement } from "./ListElement.js";

/**
 * 块树
 */
export class BlockTree
{
    /**
     * 树根
     * @type {Block}
     */
    root = new Block(0, 0, 0, 0);
    /**
     * 视点左上角的x坐标
     * @type {number}
     */
    viewX = 0;
    /**
     * 视点左上角的y坐标
     * @type {number}
     */
    viewY = 0;

    /**
     * 遍历树并绘制到屏幕
     */
    traverseDrawToScreen()
    {
        this.root.traverseDrawToScreen(-this.viewX, -this.viewY);
    }

    /**
     * 遍历树并更新屏幕空间坐标
     */
    traverseRefreshScreenPosition()
    {
        this.root.traverseRefreshScreenPosition(-this.viewX, -this.viewY);
    }

    /**
     * 通过坐标获取块
     * 将遍历子节点
     * @param {number} x
     * @param {number} y
     * @returns {{ block: Block, listElement: ListElement }}
     */
    getObjByPosition(x, y)
    {
        var ret = this.root.getObjByPosition(x, y, -this.viewX, -this.viewY);
        return (ret.block != this.root ? ret : { block: null, listElement: null });
    }

    /**
     * 添加子节点
     * @param {Block} childBlock
     */
    addChild(childBlock)
    {
        this.root.addChild(childBlock);
    }

    /**
     * 获取指定块或列表项的全局坐标
     * 若为列表项则使用接线柱左上角的坐标
     * @param {Block | ListElement} obj
     * @returns {{ x: number, y: number }}
     */
    getPosition(obj)
    {
        var now = obj;
        var retX = ((now instanceof Block) ?
            now.x :
            (now.position == 0 ? now.xDis : now.parent.width - now.xDis - now.width));
        var retY = now.y;
        while (now.parent && now != this.root)
        {
            let parent = now.parent;
            retX += parent.x;
            retY += parent.y;
            now = parent;
        }
        return { x: retX, y: retY };
    }
}

export const blockTree = new BlockTree();