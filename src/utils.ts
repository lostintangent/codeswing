import { ProgressLocation, Uri, window, workspace } from "vscode";
import { PLAYGROUND_FILE } from "./constants";
import { openPlayground } from "./preview";

export function byteArrayToString(value: Uint8Array) {
  return new TextDecoder().decode(value);
}

export function stringToByteArray(value: string) {
  return new TextEncoder().encode(value);
}

export async function checkForPlaygroundWorkspace() {
  if (workspace.workspaceFolders) {
    const files = await workspace.findFiles(PLAYGROUND_FILE);
    if (files.length > 0) {
      openPlayground(workspace.workspaceFolders[0].uri);
    }
  }
}

export async function getFileContents(playgroundUri: Uri, file: string) {
  const uri = Uri.joinPath(playgroundUri, file);
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
