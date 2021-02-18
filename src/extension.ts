import * as vscode from "vscode";
import { api } from "./api";
import { registerCreationModule } from "./creation";
import { registerLiveShareModule } from "./liveShare";
import { registerPreviewModule } from "./preview";
import { registerTreeViewModule } from "./tree";
import { checkForSwingWorkspace } from "./utils";

export async function activate(context: vscode.ExtensionContext) {
  registerCreationModule(context, api);
  registerPreviewModule(context, api);
  registerTreeViewModule(context);
  registerLiveShareModule();

  checkForSwingWorkspace();
  return api;
}
