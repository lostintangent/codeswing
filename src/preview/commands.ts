import * as vscode from "vscode";
import { openSwing } from ".";
import { synthesizeTemplateFiles } from "../ai";
import * as config from "../config";
import { EXTENSION_NAME } from "../constants";
import { store, SwingLibraryType } from "../store";
import { withProgress } from "../utils";
import { SwingLayout } from "./layoutManager";
import { addScriptModule, addSwingLibrary } from "./libraries";

export async function registerSwingCommands(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      `${EXTENSION_NAME}.addLibrary`,
      async () => {
        const items = [
          {
            label: "Script",
            description: "Adds a <script> reference, before your swing script",
            libraryType: SwingLibraryType.script,
          },
          {
            label: "Stylesheet",
            description:
              "Adds a <link rel='stylesheet' /> reference, before your swing styles",
            libraryType: SwingLibraryType.style,
          },
        ];

        if (store.activeSwing?.scriptEditor) {
          items.unshift({
            label: "Script module",
            description:
              "Adds a import statement to the top of your swing script",
            // @ts-ignore
            libraryType: "module",
          });
        }

        const response = await vscode.window.showQuickPick(items, {
          placeHolder: "Select the library type you'd like to add",
        });

        if (response) {
          if (
            response.libraryType === SwingLibraryType.script ||
            response.libraryType === SwingLibraryType.style
          ) {
            addSwingLibrary(response.libraryType);
          } else {
            addScriptModule();
          }
        }
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`${EXTENSION_NAME}.openConsole`, () =>
      store.activeSwing?.console.show()
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `${EXTENSION_NAME}.openDeveloperTools`,
      () => {
        vscode.commands.executeCommand(
          "workbench.action.webview.openDeveloperTools"
        );
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`${EXTENSION_NAME}.run`, async () => {
      store.activeSwing?.webView.rebuildWebview();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `${EXTENSION_NAME}.refineWithAI`,
      async () => {
        const prompt = await vscode.window.showInputBox({
          placeHolder: "Describe the change you'd like to make",
        });
        if (!prompt) return;

        await withProgress("Revising swing...", async () => {
          const files = await synthesizeTemplateFiles(prompt);
          for (const file of files) {
            await vscode.workspace.fs.writeFile(
              vscode.Uri.joinPath(store.activeSwing!.currentUri, file.filename),
              Buffer.from(file.content || "")
            );
          }
        });
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `${EXTENSION_NAME}.changeLayout`,
      async () => {
        const { capital } = require("case");
        const items = Object.keys(SwingLayout).map((layout) => {
          return { label: capital(layout), layout };
        });
        const result = await vscode.window.showQuickPick(items, {
          placeHolder: "Select the layout to use for swings",
        });

        if (result) {
          await config.set("layout", result.layout);
          openSwing(store.activeSwing!.rootUri);
        }
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`${EXTENSION_NAME}.openSwing`, async () => {
      const folder = await vscode.window.showOpenDialog({
        canSelectFolders: true,
        canSelectFiles: false,
        canSelectMany: false,
      });

      if (folder) {
        openSwing(folder[0]);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `${EXTENSION_NAME}.openSwingInNewWindow`,
      async () => {
        const folder = await vscode.window.showOpenDialog({
          canSelectFolders: true,
          canSelectFiles: false,
          canSelectMany: false,
        });

        if (folder) {
          vscode.commands.executeCommand("vscode.openFolder", folder[0], {
            forceNewWindow: true,
          });
        }
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `${EXTENSION_NAME}.openWorkspaceSwing`,
      () => {
        openSwing(vscode.workspace.workspaceFolders![0].uri);
      }
    )
  );
}
