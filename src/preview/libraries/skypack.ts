import axios from "axios";
import * as vscode from "vscode";
import { store } from "../../store";
import debounce = require("debounce");

interface SkypackPackage {
  name: string;
  description: string;
}

const SEARCH_URL = "https://api.skypack.dev/v1/autocomplete_package";

async function getModules(searchString: string) {
  const librariesResponse = await axios.get<{ results: SkypackPackage[] }>(
    `${SEARCH_URL}?q=${searchString}`
  );

  return librariesResponse.data.results;
}

async function hasDefaultExport(packageName: string) {
  const response = await axios.get(
    `https://cdn.skypack.dev/${packageName}?meta`
  );
  return response.data.packageExports?.["."]?.hasDefaultExport || false;
}

const DEFAULT_MODULES = [
  ["angular", "HTML enhanced for web apps"],
  ["react", "React is a JavaScript library for building user interfaces."],
  ["react-dom", "React package for working with the DOM."],
  ["vue", "Reactive, component-oriented view layer for modern web interfaces."],
];

async function addModuleImport(moduleName: string, moduleUrl: string) {
  const { camel } = require("case");
  const importName = camel(moduleName);

  const prefix = (await hasDefaultExport(moduleName)) ? "" : "* as ";
  const importContent = `import ${prefix}${importName} from "${moduleUrl}";\n`;
  store.activeSwing!.scriptEditor?.edit((edit) => {
    edit.insert(new vscode.Position(0, 0), importContent);
  });
}

export async function addSkypackModule() {
  const list = vscode.window.createQuickPick();
  list.placeholder = "Specify the module name you'd like to add";
  list.items = DEFAULT_MODULES.map(([label, description]) => ({
    label,
    description,
  }));

  list.onDidChangeValue(
    debounce(
      async (value) => {
        if (value === "") {
          list.items = DEFAULT_MODULES.map(([label, description]) => ({
            label,
            description,
          }));
        } else {
          list.busy = true;
          list.items = [{ label: `Searching modules for "${value}"...` }];
          const modules = await getModules(value);
          list.items = modules.map((module) => ({
            label: module.name,
            description: module.description,
          }));

          list.busy = false;
        }
      },
      100,
      true
    )
  );

  list.onDidAccept(async () => {
    list.hide();

    const moduleAnswer = list.selectedItems[0];
    if (!moduleAnswer) {
      return;
    }

    const moduleName = moduleAnswer.label;
    const moduleUrl = `https://cdn.skypack.dev/${moduleName}`;
    await addModuleImport(moduleName, moduleUrl);
  });

  list.show();
}
