import * as vscode from "vscode";
import { Event, Uri } from "vscode";
import { EXTENSION_NAME } from "../constants";
import { store } from "../store";
import { byteArrayToString, stringToByteArray, withProgress } from "../utils";

export const TOUR_FILE = "main.tour";

interface CodeTourApi {
  startTour(
    tour: any,
    stepNumber: number,
    workspaceRoot: Uri,
    startInEditMode: boolean
  ): void;

  endCurrentTour(): void;
  exportTour(tour: any): string;
  recordTour(workspaceRoot: Uri): void;

  promptForTour(workspaceRoot: Uri, tours: any[]): Promise<boolean>;
  selectTour(tours: any[], workspaceRoot: Uri): Promise<boolean>;

  onDidEndTour: Event<any>;
}

let codeTourApi: CodeTourApi;
async function ensureApi() {
  if (!codeTourApi) {
    const codeTour = vscode.extensions.getExtension("vsls-contrib.codetour");
    if (!codeTour) {
      return;
    }
    if (!codeTour.isActive) {
      await codeTour.activate();
    }

    codeTourApi = codeTour.exports;
  }
}

export async function isCodeTourInstalled() {
  await ensureApi();
  return !!codeTourApi;
}

export async function startTour(
  tour: any,
  workspaceRoot: Uri,
  startInEditMode: boolean = false
) {
  tour.id = Uri.joinPath(workspaceRoot, TOUR_FILE).toString();
  codeTourApi.startTour(tour, 0, workspaceRoot, startInEditMode);
}

export async function startTourFromUri(tourUri: Uri, workspaceRoot: Uri) {
  try {
    const contents = await vscode.workspace.fs.readFile(tourUri);
    const tour = JSON.parse(byteArrayToString(contents));
    startTour(tour, workspaceRoot);
  } catch {}
}

export async function endCurrentTour() {
  codeTourApi.endCurrentTour();
}

export async function registerTourCommands(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      `${EXTENSION_NAME}.recordCodeTour`,
      async () =>
        withProgress("Starting tour recorder...", async () => {
          const { rootUri: uri } = store.activeSwing!;

          const tour = {
            title: "CodeSwing",
            steps: [],
          };

          const tourUri = vscode.Uri.joinPath(uri, TOUR_FILE);
          const tourContent = JSON.stringify(tour, null, 2);
          await vscode.workspace.fs.writeFile(
            tourUri,
            stringToByteArray(tourContent)
          );

          startTour(tour, uri, true);
          store.activeSwing!.hasTour = true;
        })
    )
  );
}
