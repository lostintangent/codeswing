import { ProgressLocation, Uri, window, workspace } from "vscode";
import { SWING_FILE } from "./constants";
import { openSwing } from "./preview";

export function byteArrayToString(value: Uint8Array) {
  return new TextDecoder().decode(value);
}

export function stringToByteArray(value: string) {
  return new TextEncoder().encode(value);
}

export async function checkForSwingWorkspace() {
  if (workspace.workspaceFolders) {
    const files = await workspace.findFiles(SWING_FILE);
    if (files.length > 0) {
      openSwing(workspace.workspaceFolders[0].uri);
    }
  }
}

export async function getFileContents(swingUri: Uri, file: string) {
  const uri = Uri.joinPath(swingUri, file);
  return getUriContents(uri);
}

export async function getUriContents(uri: Uri) {
  const contents = await workspace.fs.readFile(uri);
  return byteArrayToString(contents);
}

export function withProgress<T>(title: string, action: () => Promise<T>) {
  return window.withProgress(
    {
      location: ProgressLocation.Notification,
      title,
    },
    action
  );
}
