import { TextDocument } from "vscode";
import { getScriptContent } from "../script";

function getComponentName(code: string) {
    const [, component] = code.match(/export\sdefault\s(?:(?:class|function)\s)?(\w+)?/)!;
    return component;
}

export async function compileComponent(content: string, document: TextDocument) {
    const [code] = (await getScriptContent(document, undefined))!
    const componentName = getComponentName(code);

    const init = `ReactDOM.render(React.createElement(${componentName}), document.getElementById("app"));`
    return [code, init];
}
