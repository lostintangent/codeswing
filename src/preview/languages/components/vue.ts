import { parse, compileTemplate, compileScript } from "@vue/compiler-sfc";
import { transform } from "@babel/standalone";

const APP_INIT = `new Vue({
    el: "#app",
    render: h => h(__vue_component__)
});`

const COMPONENT_NAME = "index.vue";

export function compileComponent(content: string): [string, string, [string, string][]] {
    const { descriptor } = parse(content, { filename: COMPONENT_NAME });
    const { code: templateCode } = compileTemplate({ source: descriptor.template.content, filename: COMPONENT_NAME });
    const { content: scriptContent, lang } = descriptor.scriptSetup || descriptor.script || { content: "", lang: "js" };
    const { code: scriptCode } = compileScript(descriptor, { id: COMPONENT_NAME });
    const script = lang === "js" ? scriptCode : transform(scriptCode, { filename: COMPONENT_NAME, presets: [lang] }).code;
    const styleVars = descriptor.styles.some(style => style.attrs.vars) ? "vue-style-vars" : "";
    return [templateCode + "\n" + script, APP_INIT, [["Vue", "vue"], [styleVars, styleVars]]];
}
