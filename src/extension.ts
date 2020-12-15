import * as vscode from "vscode";
import { api } from "./api";
import { registerCreationModule } from "./creation";
import { registerPreviewModule } from "./preview";
import { checkForPlaygroundWorkspace } from "./utils";

export async function activate(context: vscode.ExtensionContext) {
  registerCreationModule(context, api);
  registerPreviewModule(context, api);

  checkForPlaygroundWorkspace();

  return api;
}
