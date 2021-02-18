import { EXTENSION_NAME } from "src/constants";
import { store } from "src/store";
import { commands, ExtensionContext, Uri, window, workspace } from "vscode";
import { refreshTreeView } from "./activeSwing";
import { CodeSwingDirectoryNode, CodeSwingFileNode } from "./nodes";

export function registerTreeViewCommands(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand(
      `${EXTENSION_NAME}.addSwingFile`,
      async (node?: CodeSwingDirectoryNode) => {
        const file = await window.showInputBox({
          placeHolder: "Enter the name of the file you'd like to add",
        });

        if (!file) {
          return;
        }

        const filePath = node ? `${node.directory}/${file}` : file;
        const uri = Uri.joinPath(store.activeSwing!.rootUri, filePath);

        await workspace.fs.writeFile(uri, new Uint8Array());
        window.showTextDocument(uri);
        refreshTreeView();
      }
    )
  );

  context.subscriptions.push(
    commands.registerCommand(
      `${EXTENSION_NAME}.renameSwingFile`,
      async (node: CodeSwingFileNode) => {
        const file = await window.showInputBox({
          placeHolder: "Enter the name you'd like to rename this file to",
          value: node.file,
        });

        if (!file) {
          return;
        }

        const uri = Uri.joinPath(node.resourceUri!, file);
        await workspace.fs.rename(uri, uri);
        refreshTreeView();
      }
    )
  );

  context.subscriptions.push(
    commands.registerCommand(
      `${EXTENSION_NAME}.deleteSwingFile`,
      async (node: CodeSwingFileNode) => {
        const message = `Are you sure you want to delete the "${node.file}" file?`;
        if (await window.showInformationMessage(message, "Delete")) {
          await workspace.fs.delete(node.resourceUri!);
          refreshTreeView();
        }
      }
    )
  );
}
