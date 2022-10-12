import { cssG, NElement, NEvent, NList, NStyle } from "../../lib/qwqframe.js";
import { body } from "./body.js";
import { buttonAsse } from "./button.js";


/**
 * @type {function(): void}
 */
var closeMenuCallback = null;
/**
 * @async
 * @param {Array<NElement>} menuList
 * @param {number} x
 * @param {number} y
 * @returns {Promise<NElement>}
 */
export function showMenu(menuList, x, y)
{
    return new Promise(resolve =>
    {
        var parentMenuCloseMenuCallback = closeMenuCallback;
        /**
         * @type {NElement}
         */
        var menu = null;
        /**
         * @type {NElement}
         */
        var currentItem = null;
        var menuHolder = NList.getElement([ // 背景
            new NStyle("width", "100%"),
            new NStyle("height", "100%"),
            new NStyle("position", "absolute"),
            new NStyle("userSelect", "none"),
            new NStyle("backgroundColor", cssG.rgb(0, 0, 0, 0.35)),
            new NStyle("zIndex", "100"),
            menu = NList.getElement([ // 菜单
                new NStyle("position", "absolute"),
                new NStyle("backgroundColor", cssG.rgb(251, 251, 251, 0.95)),
                new NStyle("left", `${x}px`),
                new NStyle("top", `${y}px`),
                new NStyle("minWidth", "100px"),
                new NStyle("border", `1px solid ${cssG.rgb(0, 0, 0)}`),
                new NStyle("padding", "5px"),
                new NStyle("lineHeight", "1.6em"),
                new NStyle("borderRadius", "3px"),
                new NEvent("click", e => { e.stopPropagation(); }),
                ...menuList
            ]),
            new NEvent("click", () =>
            {
                currentItem = null;
                closeMenu();
            }),
            new NEvent("contextmenu", () =>
            {
                currentItem = null;
                closeMenu();
            })
        ]);

        menuList.forEach(o =>
        {
            o.asse(buttonAsse);
            o.addEventListener("click", () =>
            {
                currentItem = o;
                if (closeMenuCallback == closeMenu)
                {
                    while (closeMenuCallback)
                        closeMenuCallback();
                }
            });
        });

        var closed = false;
        function closeMenu()
        {
            if(closed)
                return;
            closed = true;
            closeMenuCallback = parentMenuCloseMenuCallback;

            menu.setStyle("pointerEvents", "none");
            menu.animate([
                {
                },
                {
                    transform: "scale(0.9)"
                }
            ], {
                duration: 120,
                fill: "forwards"
            });
            menuHolder.animate([
                {
                    opacity: 1
                },
                {
                    opacity: 0.1
                }
            ], {
                duration: 120,
                fill: "forwards"
            });
            setTimeout(() =>
            {
                menuHolder.remove();
            }, 120);
            resolve(currentItem);
        }
        body.addChild(menuHolder);
        closeMenuCallback = closeMenu;
    });
}