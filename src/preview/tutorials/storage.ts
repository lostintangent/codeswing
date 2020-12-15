import { ExtensionContext, Uri } from "vscode";
import { store } from "../../store";

export const TUTORIAL_KEY = "playground:tutorials";

export interface IStorage {
  currentTutorialStep(uri?: Uri): number;
  setCurrentTutorialStep(tutorialStep: number): void;
}

type TutorialStatus = [string, number];

export let storage: IStorage;
export async function initializeStorage(context: ExtensionContext) {
  storage = {
    currentTutorialStep(uri: Uri = store.activePlayground!.uri): number {
      const tutorials = context.globalState.get<TutorialStatus[]>(
        TUTORIAL_KEY,
        []
      );

      
      const tutorial = tutorials.find(([id, _]) => id === uri.toString());
      return tutorial ? tutorial[1] : 1;
    },
    setCurrentTutorialStep(tutorialStep: number) {
      const tutorialId = store.activePlayground!.uri.toString();
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

      context.globalState.update(TUTORIAL_KEY, tutorials);
    },
  };
}
