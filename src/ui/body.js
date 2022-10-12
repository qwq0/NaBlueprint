import { cssG, getNElement } from "../../lib/qwqframe.js";

/**
 * document.body的NElement封装
 */
export var body = getNElement(document.body);
body.setStyles({
    position: "fixed",
    height: "100%",
    width: "100%",
    margin: 0,
    overflow: "hidden hidden",
    backgroundColor: cssG.rgb(15, 15, 15)
});

/**
 * 全局样式
 */
var style = getNElement(document.createElement("style"));
style.element.textContent = `
    input, textarea
    {
        outline: none;
    }
`;
body.addChild(style);