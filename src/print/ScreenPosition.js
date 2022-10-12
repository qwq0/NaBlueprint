import { Block } from "./Block.js";
import { ListElement } from "./ListElement.js";

/**
 * 屏幕空间坐标缓存
 */
class ScreenPosition
{
    /**
     * @type {WeakMap<Block | ListElement, { x: number, y: number }>}
     */
    map = new WeakMap();

    /**
     * 设置屏幕空间坐标
     * @param {Block | ListElement} obj 
     * @param {number} x 
     * @param {number} y 
     */
    set(obj, x, y)
    {
        this.map.set(obj, { x: x, y: y });
    }

    /**
     * 获取屏幕空间坐标
     * @param {Block | ListElement} obj 
     * @returns {{ x: number, y:number }}
     */
    get(obj)
    {
        var ret = this.map.get(obj);
        return (ret ? ret : { x: 0, y: 0 });
    }
}

export const screenPosition = new ScreenPosition();