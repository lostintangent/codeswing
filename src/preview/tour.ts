import { store } from "src/store";
import * as vscode from "vscode";
import { EXTENSION_NAME } from "../constants";
import { startTour, TOUR_FILE } from "../tour";
import { stringToByteArray, withProgress } from "../utils";

export async function registerTourCommands(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      `${EXTENSION_NAME}.recordCodeTour`,
      async () =>
        withProgress("Starting recorder...", async () => {
          const { uri } = store.activePlayground!;

          const tour = {
            title: "Playground",
            steps: [],
          };

          const tourUri = vscode.Uri.joinPath(uri, TOUR_FILE);
          const tourContent = JSON.stringify(tour, null, 2);
          await vscode.workspace.fs.writeFile(
            tourUri,
            stringToByteArray(tourContent)
          );

          startTour(tour, uri, true);
          store.activePlayground!.hasTour = true;
        })
    )
  );
}
