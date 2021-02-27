import { ExtensionContext, Uri } from "vscode";
import { EXTENSION_NAME } from "../../constants";
import { store } from "../../store";

const TUTORIAL_KEY = `${EXTENSION_NAME}:tutorials`;

export interface IStorage {
  currentTutorialStep(uri?: Uri): number;
  setCurrentTutorialStep(tutorialStep: number): Promise<void>;
}

type TutorialStatus = [string, number];

export let storage: IStorage;
export async function initializeStorage(context: ExtensionContext, syncKeys: string[]) {
  storage = {
    currentTutorialStep(uri: Uri = store.activeSwing!.rootUri): number {
      const tutorials = context.globalState.get<TutorialStatus[]>(
        TUTORIAL_KEY,
        []
      );

      const tutorial = tutorials.find(([id, _]) => id === uri.toString());
      return tutorial ? tutorial[1] : 1;
    },
    async setCurrentTutorialStep(tutorialStep: number) {
      const tutorialId = store.activeSwing!.rootUri.toString();
      const tutorials = context.globalState.get<TutorialStatus[]>(
        TUTORIAL_KEY,
        []
      );

      const tutorial = tutorials.find(([id, _]) => id === tutorialId);
      if (tutorial) {
        tutorial[1] = tutorialStep;
      } else {
        tutorials.push([tutorialId, tutorialStep]);
      }

      return context.globalState.update(TUTORIAL_KEY, tutorials);
    },
  };

  syncKeys.push(TUTORIAL_KEY);
}
