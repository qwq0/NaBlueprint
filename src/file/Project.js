import { forEach } from "../util/forEach.js";
import { File } from "./File.js";

/**
 * 项目
 * @typedef {{ [x: string]: File | fileTree }} fileTree
 */
export class Project
{
    /**
     * 文件树
     * @type {fileTree}
     */
    root = Object.create(null);

    /**
     * 通过路径获取文件
     * @param {Array<string>} path
     * @returns {File}
     */
    getFile(path)
    {
        /**
         * @type {fileTree | File}
         */
        var now = this.root;
        forEach(path, o =>
        {
            if (now[o])
            {
                now = now[o];
                return false;
            }
            else
                return true;
        });
        return (now instanceof File ? now : null);
    }
}

export const project = new Project();