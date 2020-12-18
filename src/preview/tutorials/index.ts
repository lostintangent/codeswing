import { ExtensionContext } from "vscode";
import { registerInputFileSystemProvider } from "./inputFileSystem";
import { initializeStorage } from "./storage";

export async function registerTutorialModule(context: ExtensionContext) {
  registerInputFileSystemProvider();
  initializeStorage(context);
}
