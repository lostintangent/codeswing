import { ExtensionContext } from "vscode";
import { registerTreeProvider } from "./activeSwing";
import { registerTreeViewCommands } from "./commands";

export function registerTreeViewModule(context: ExtensionContext) {
  registerTreeViewCommands(context);
  registerTreeProvider();
}
