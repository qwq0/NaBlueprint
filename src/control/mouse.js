import { body } from "../ui/body.js";
import { showCopyBox, showInfoBox, showInputBox, showMultilineInputBox } from "../ui/infobox.js";
import { showMenu } from "../ui/menu.js";
import { isAmong } from "../util/forEach.js";
import { getNElement, mouseBind, NEvent, NList, NStyle } from "../../lib/qwqframe.js";
import { canvas } from "../print/draw.js";
import { blockTree } from "../print/BlockTree.js";
import { Block } from "../print/Block.js";
import { ListElement } from "../print/ListElement.js";
import { blockTreeStorage } from "../print/storage.js";


export const current = Object.seal({
    /**
     * 当前拖拽的块
     * @type {Block}
     */
    block: null,
    /**
     * 当前拖拽的列表项(接线柱)
     * @type {ListElement}
     */
    listElement: null,
    lineX: 0,
    lineY: 0
});





mouseBind(canvas, e => // 拖拽绑定
{
    if (e.pressing) // 开始拖拽
    {
        let currentInfo = blockTree.getObjByPosition(e.x, e.y);
        current.block = currentInfo.block;
        current.listElement = currentInfo.listElement;
    }


    if (current.block)
    {
        if (current.listElement) // 拖拽接线柱
        {
            current.lineX = e.x;
            current.lineY = e.y;
        }
        else // 拖拽块
        {
            current.block.x += e.vx;
            current.block.y += e.vy;
        }
    }
    else // 拖拽空白处
    {
        blockTree.viewX -= e.vx;
        blockTree.viewY -= e.vy;
    }


    if (!e.hold) // 结束拖拽
    {
        let endInfo = blockTree.getObjByPosition(e.x, e.y);
        let endListElement = endInfo.listElement;
        if (endListElement && endListElement != current.listElement)
        {
            current.listElement.linkTo.push(endListElement);
        }

        current.block = null;
        current.listElement = null;
    }
});

/**
 * 参数选择器
 * 用于创建参数列表项
 * @async
 * @param {number} x 
 * @param {number} y 
 * @returns {Promise<ListElement>}
 */
function parameterSelector(x, y)
{
    return new Promise(resolve =>
    {
        var ret = new ListElement();
        showMenu(([
            {
                text: "信号",
                type: "signal"
            },
            {
                text: "数值",
                type: "number"
            },
            {
                text: "字符串",
                type: "string"
            },
            {
                text: "布尔值",
                type: "boolean"
            },
            {
                text: "标志(symbol)",
                type: "symbol"
            },
            {
                text: "对象",
                type: "object"
            },
            {
                text: "数组",
                type: "array"
            },
            {
                text: "类",
                type: "class"
            }
        ]).map(o => NList.getElement([
            o.text,
            new NEvent("click", e =>
            {
                showMenu([
                    NList.getElement([
                        "自定义",
                        new NEvent("click", async () =>
                        {
                            var name = await showInputBox("自定义参数", "请输入参数名", true);
                            if (name != undefined)
                            {
                                ret.title = name;
                                resolve(ret);
                            }
                            else
                                resolve(null);
                        })
                    ])
                ], e.clientX, e.clientY);
            }),
        ])), x, y);
    })
}

canvas.addEventListener("contextmenu", e =>
{
    e.preventDefault();

    var currentInfo = blockTree.getObjByPosition(e.clientX, e.clientY);
    var currentBlock = currentInfo.block;
    var currentListElement = currentInfo.listElement;

    if (currentListElement) // 右键接线柱
    {
        showMenu([
            NList.getElement([
                "清除所有连接",
                new NStyle("display", (currentListElement.position == 0 ? "none" : "block")),
                new NEvent("click", () =>
                {
                    currentListElement.clearLinks();
                })
            ])
        ], e.x, e.y);
    }
    else if (currentBlock) // 右键块
    {
        showMenu([
            NList.getElement([
                "切换块类型",
                new NStyle("display", "none"),
                new NEvent("click", async e =>
                {
                })
            ]),
            NList.getElement([
                "添加传入",
                new NEvent("click", async (e) =>
                {
                    var listElement = await parameterSelector(e.clientX, e.clientY);
                    if (listElement)
                    {
                        currentBlock.addLeftList(listElement);
                        currentBlock.refreshImageBitmap();
                    }
                })
            ]),
            NList.getElement([
                "添加传出",
                new NEvent("click", async (e) =>
                {
                    var listElement = await parameterSelector(e.clientX, e.clientY);
                    if (listElement)
                    {
                        currentBlock.addRightList(listElement);
                        currentBlock.refreshImageBitmap();
                    }
                })
            ]),
            NList.getElement([
                "编辑注释",
                new NEvent("click", async () =>
                {
                    var newAnnotation = await showMultilineInputBox("编辑注释", "请输入注释", true, currentBlock.annotation);
                    if (newAnnotation != undefined)
                    {
                        currentBlock.annotation = newAnnotation;
                        currentBlock.refreshImageBitmap();
                    }
                })
            ]),
            NList.getElement([
                "复制",
                new NEvent("click", () =>
                {
                })
            ]),
            NList.getElement([
                "组合",
                new NStyle("display", "none"),
                new NEvent("click", async () =>
                {
                    if (await showInfoBox("提示", "确认组合此块?\n单机另一个块以设置为父节点", true))
                    { }
                })
            ]),
            NList.getElement([
                "属性(调试)",
                new NEvent("click", () =>
                {
                    showCopyBox("属性(调试)", "此属性仅用于调试 不可用于序列化块信息", JSON.stringify(currentBlock, (key, value) =>
                    {
                        if (isAmong(key, "parent", "imageBitmap"))
                            return undefined;
                        else
                            return value;
                    }, 4));
                })
            ]),
            NList.getElement([
                "删除",
                new NEvent("click", async () =>
                {
                    if (await showInfoBox("提示", "确认删除此块?", true))
                        current.block.remove();
                })
            ])
        ], e.x, e.y);
    }
    else // 右键空白处
    {
        showMenu([
            NList.getElement([
                "新模块",
                new NEvent("click", e =>
                {
                    showMenu([
                        NList.getElement([
                            "空块",
                            new NEvent("click", () =>
                            {
                                var block = new Block(blockTree.viewX + e.x, blockTree.viewY + e.y);
                                block.refreshImageBitmap();
                                blockTree.addChild(block);
                            })
                        ]),
                        NList.getElement([
                            "实现",
                            new NEvent("click", () =>
                            {
                                var block = new Block(blockTree.viewX + e.x, blockTree.viewY + e.y);
                                block.title = "实现";
                                block.refreshImageBitmap();
                                blockTree.addChild(block);
                            })
                        ])
                    ], e.clientX, e.clientY);
                })
            ]),
            NList.getElement([
                "切换文件",
                new NEvent("click", e =>
                {
                    showMenu([
                    ], e.clientX, e.clientY);
                })
            ]),
            NList.getElement([
                "序列化当前图",
                new NEvent("click", () =>
                {
                    showCopyBox("序列化", "包含当前块树的信息", blockTreeStorage.serialize(blockTree.root));
                })
            ]),
        ], e.clientX, e.clientY);
    }
});

body.addEventListener("contextmenu", e =>
{
    e.preventDefault();
});