import { commands, ExtensionContext } from "vscode";
import { EXTENSION_NAME } from "../constants";

const OPENAI_CONTEXT_KEY = `${EXTENSION_NAME}:hasOpenAiApiKey`;
const OPENAI_STORAGE_KEY = `${EXTENSION_NAME}:openAiApiKey`;

export interface IAiStorage {
  deleteOpenAiApiKey(): Promise<void>;
  getOpenAiApiKey(): Promise<string | undefined>;
  setOpenAiApiKey(apiKey: string): Promise<void>;
}

export let storage: IAiStorage;
export async function initializeStorage(context: ExtensionContext) {
  storage = {
    async deleteOpenAiApiKey(): Promise<void> {
      await context.secrets.delete(OPENAI_STORAGE_KEY);
      await commands.executeCommand("setContext", OPENAI_CONTEXT_KEY, false);
    },
    async getOpenAiApiKey(): Promise<string | undefined> {
      return context.secrets.get(OPENAI_STORAGE_KEY);
    },
    async setOpenAiApiKey(key: string): Promise<void> {
      await context.secrets.store(OPENAI_STORAGE_KEY, key);
      await commands.executeCommand("setContext", OPENAI_CONTEXT_KEY, true);
    },
  };

  if (storage.getOpenAiApiKey() !== undefined) {
    await commands.executeCommand("setContext", OPENAI_CONTEXT_KEY, true);
  }
}
