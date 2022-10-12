import { Block } from "./Block.js";
import { ListElement } from "./ListElement.js";

class BlockTreeStorage
{
    /**
     * 序列化块树
     * @param {Block} block
     */
    serialize(block)
    {
        var leSNCount = 0;
        var snMap = new Map();

        /**
         * 遍历设置唯一标识
         * @param {Block} now
         */
        function traverseSetSN(now)
        {
            now.leftList.forEach(o => { snMap.set(o, leSNCount++); });
            now.rightList.forEach(o => { snMap.set(o, leSNCount++); });
            now.child.forEach(traverseSetSN);
        }
        traverseSetSN(block);

        /**
         * 获取列表项的信息数组
         * @param {ListElement} listElement
         */
        function ctListElement(listElement)
        {
            return [
                listElement.title, // 0
                listElement.text, // 1
                listElement.type, // 2

                listElement.linkTo.map(o => // 3
                {
                    var ret = snMap.get(o);
                    if (ret == undefined)
                        throw "BlockTree Serialization Error";
                    return ret;
                }),

                listElement.data // 4
            ];
        }

        /**
         * 遍历
         * 返回块的信息数组
         * @param {Block} now
         * @returns {Object}
         */
        function traverse(now)
        {
            var leftListInfo = now.leftList.map(ctListElement);
            var rightListInfo = now.rightList.map(ctListElement);
            return [
                now.x, // 0
                now.y, // 1

                now.title, // 2
                now.annotation, // 3
                now.text, // 4

                now.type, // 5

                now.child.map(traverse), // 6

                leftListInfo, // 7
                rightListInfo, // 8

                now.data // 9
            ];
        }
        return JSON.stringify(traverse(block));
    }

    /**
     * 反序列化块树
     * @param {string} str
     * @returns {Block}
     */
    deserialize(str)
    {
        var obj = JSON.parse(str);
        /**
         * @type {Array<ListElement>}
         */
        var leList = [];
        /**
         * @param {Array} data
         * @returns {Block}
         */
        function traverse(data)
        {
            var now = new Block();

            now.x = data[0];
            now.y = data[1];

            now.title = data[2];
            now.annotation = data[3];
            now.text = data[4];

            now.type = data[5];

            /**
             * @type {Array<ListElement>}
             */
            var leftList = data[7].map(() => new ListElement());
            /**
             * @type {Array<ListElement>}
             */
            var rightList = data[8].map(() => new ListElement());
            leftList.forEach(o => { leList.push(o); });
            rightList.forEach(o => { leList.push(o); });
            leftList.forEach(o => { now.addLeftList(o); });
            rightList.forEach(o => { now.addRightList(o); });

            data[6].map(traverse).forEach((/** @type {Block} */ o) =>
            {
                now.addChild(o);
            });

            now.data = data[9];

            return now;
        }
        var ret = traverse(obj);

        var leSNCount = 0;
        /**
         * 通过信息数组设置列表项
         * @param {Array} data
         */
        function ctListElement(data)
        {
            var listElement = leList[leSNCount++];
            listElement.title = data[0];
            listElement.text = data[1];
            listElement.type = data[2];
            data[3].forEach((/** @type {number} */ o) =>
            {
                listElement.addLink(leList[o]);
            });
            listElement.data = data[4];
        }
        /**
         * 遍历设置列表项
         * @param {Block} data
         */
        function traverseSetListElement(data)
        {
            data[7].forEach(ctListElement);
            data[8].forEach(ctListElement);

            data[6].forEach(traverseSetListElement);
        }
        traverseSetListElement(obj);

        ret.width = 0;
        ret.height = 0;
        ret.display = false;
        ret.traverseRefreshImageBitmap();
        return ret;
    }
}

export const blockTreeStorage = new BlockTreeStorage();