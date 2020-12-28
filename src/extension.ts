import * as vscode from "vscode";
import { api } from "./api";
import { registerCreationModule } from "./creation";
import { registerLiveShareModule } from "./liveShare";
import { registerPreviewModule } from "./preview";
import { checkForSwingWorkspace } from "./utils";

export async function activate(context: vscode.ExtensionContext) {
  registerCreationModule(context, api);
  registerPreviewModule(context, api);
  registerLiveShareModule();

  // TODO: Check how to make this work
  // for non-file system workspaces
  checkForSwingWorkspace();

  return api;
}
