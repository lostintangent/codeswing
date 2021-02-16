import * as svelte from "svelte/compiler";
import { getModuleUrl } from "../../../preview/libraries/skypack";
import { byteArrayToString } from "../../../utils";

const COMPONENT_NAME = `CodeSwingComponent`;
const INIT_CODE = `new ${COMPONENT_NAME}({ target: document.getElementById("app") });`
const SVELTE_PATH = getModuleUrl("svelte");

export async function compileComponent(content: string) {
    const { code } = await svelte.preprocess(content, {
        script: async ({ content, attributes }) => {
            if (attributes.lang !== "ts") {
                return { code: content };
            };
            
            const typescript = require("typescript");
            const compiledContent: string = typescript.transpile(content, { target: "ES2018" })

            return {
                code: compiledContent
            };
        },
        style: async ({ content, attributes }) => {
            if (attributes.lang !== "scss" && attributes.lang !== "sass") {
                return { code: content };
            };

            const sass = require("sass");
            const compiledContent = byteArrayToString(
                sass.renderSync({
                  data: content,
                  indentedSyntax: attributes.lang === "sass",
                }).css
              );

            return {
                code: compiledContent
            };
        }
    });
    
    const { js } = svelte.compile(code, {
        name: COMPONENT_NAME,
        sveltePath: SVELTE_PATH
    });
    
    return [js.code, INIT_CODE];
}