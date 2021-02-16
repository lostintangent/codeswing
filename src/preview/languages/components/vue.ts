import { assemble, createDefaultCompiler } from "@vue/component-compiler";

const APP_INIT = `new Vue({
    el: "#app",
    render: h => h(__vue_component__)
});`

const COMPONENT_NAME = "index.vue";
const compiler = createDefaultCompiler();

export function compileComponent(content: string): [string, string, [string, string][]] {
    const descriptor = compiler.compileToDescriptor(COMPONENT_NAME, content);
    const { code } = assemble(compiler, COMPONENT_NAME, descriptor, {});

    return [code, APP_INIT, [["Vue", "vue"]]];
}
