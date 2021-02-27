import { ExtensionContext } from "vscode";
import { registerInputFileSystemProvider } from "./inputFileSystem";
import { initializeStorage } from "./storage";

export async function registerTutorialModule(context: ExtensionContext, syncKeys: string[]) {
  registerInputFileSystemProvider();
  initializeStorage(context, syncKeys);
}
