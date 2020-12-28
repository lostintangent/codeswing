import * as vscode from "vscode";
import * as vsls from "vsls";
import { EXTENSION_NAME } from "../constants";
import { store } from "../store";
import initializeBaseService from "./service";

// TODO: Replace this with a fixed version of the Live Share API
function convertUri(uri: vscode.Uri): vscode.Uri {
  let workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
  const relativePath =
    workspaceFolder?.uri.toString() === uri.toString()
      ? ""
      : vscode.workspace.asRelativePath(uri, false);

  let rootPrefix = "";
  if (workspaceFolder && workspaceFolder.index > 0) {
    rootPrefix = `~${workspaceFolder.index}/`;
  }

  return vscode.Uri.parse(`vsls:/${rootPrefix}${relativePath}`);
}

export async function initializeService(vslsApi: vsls.LiveShare) {
  const service = await vslsApi.shareService(EXTENSION_NAME);
  if (!service) return;

  service.onRequest("getActiveSwing", () => {
    if (!store.activeSwing) {
      return null;
    }

    const uri = convertUri(store.activeSwing.rootUri);
    return {
      uri: uri.toString(),
    };
  });

  initializeBaseService(vslsApi, vslsApi.session.peerNumber, service, true);
}
