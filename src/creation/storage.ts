import { commands, ExtensionContext } from "vscode";
import { EXTENSION_NAME } from "../constants";

const MRU_SIZE = 3;

const MRU_CONTEXT_KEY = `${EXTENSION_NAME}:hasTemplateMRU`;
const MRU_STORAGE_KEY = `${EXTENSION_NAME}:templateMRU`;

export interface IStorage {
  getTemplateMRU(): string[];
  addTemplateToMRU(template: string): Promise<void>;
}

export let storage: IStorage;
export async function initializeStorage(
  context: ExtensionContext,
  syncKeys: string[]
) {
  storage = {
    getTemplateMRU(): string[] {
      const mru = context.globalState.get<string[]>(MRU_STORAGE_KEY) || [];
      return mru.filter((template) => template !== null);
    },
    async addTemplateToMRU(template: string) {
      const mru = this.getTemplateMRU();
      if (mru.includes(template)) {
        const oldIndex = mru.findIndex((item) => item === template);
        mru.splice(oldIndex, 1);
      }

      mru.unshift(template);

      while (mru.length > MRU_SIZE) {
        mru.pop();
      }

      await context.globalState.update(MRU_STORAGE_KEY, mru);
      await commands.executeCommand("setContext", MRU_CONTEXT_KEY, true);
    },
  };

  if (storage.getTemplateMRU().length > 0) {
    await commands.executeCommand("setContext", MRU_CONTEXT_KEY, true);
  }

  syncKeys.push(MRU_STORAGE_KEY);
}
