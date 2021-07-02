import * as vscode from "vscode";
import { api } from "./api";
import { registerCreationModule } from "./creation";
import { registerLiveShareModule } from "./liveShare";
import { registerPreviewModule } from "./preview";
import { store } from "./store";
import { registerTreeViewModule } from "./tree";
import { checkForSwingWorkspace } from "./utils";

export async function activate(context: vscode.ExtensionContext) {
  store.globalStorageUri = context.globalStorageUri;

  const syncKeys: string[] = [];

  registerCreationModule(context, api, syncKeys);
  registerPreviewModule(context, api, syncKeys);

  context.globalState.setKeysForSync(syncKeys);

  registerTreeViewModule(context);
  registerLiveShareModule();

  checkForSwingWorkspace();

  return api;
}
