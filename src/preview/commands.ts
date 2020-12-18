import * as vscode from "vscode";
import { openSwing } from ".";
import * as config from "../config";
import { EXTENSION_NAME } from "../constants";
import { store, SwingLibraryType } from "../store";
import { SwingLayout } from "./layoutManager";
import { addSwingLibrary } from "./libraries";

export async function registerSwingCommands(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      `${EXTENSION_NAME}.addLibrary`,
      async () => {
        const response = await vscode.window.showQuickPick(
          [
            {
              label: "Script",
              description:
                "Adds a <script> reference, before your swing script",
              libraryType: SwingLibraryType.script,
            },
            {
              label: "Stylesheet",
              description:
                "Adds a <link rel='stylesheet' /> reference, before your swing styles",
              libraryType: SwingLibraryType.style,
            },
          ],
          {
            placeHolder: "Select the library type you'd like to add",
          }
        );

        if (response) {
          addSwingLibrary(response.libraryType);
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
    vscode.commands.registerCommand(`${EXTENSION_NAME}.run`, async () =>
      store.activeSwing?.webView.rebuildWebview()
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
}
