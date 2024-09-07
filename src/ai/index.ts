import {
  AzureKeyCredential,
  OpenAIClient,
  OpenAIKeyCredential,
} from "@azure/openai";
import { ExtensionContext, commands, window } from "vscode";
import * as config from "../config";
import { EXTENSION_NAME } from "../constants";
import { SwingFile, Version, store } from "../store";
import preamble from "./preamble.txt";
import { initializeStorage, storage } from "./storage";

const userPrompt = `REQUEST:
{{REQUEST}}

RESPONSE:
`;

export async function synthesizeTemplateFiles(
  prompt: string,
  options: { error?: string } = {}
): Promise<SwingFile[]> {
  let openai: OpenAIClient;

  const apiKey = await storage.getOpenAiApiKey();
  const endpointUrl = config.get("ai.endpointUrl");
  if (endpointUrl) {
    const credential = new AzureKeyCredential(apiKey!);
    openai = new OpenAIClient(endpointUrl, credential);
  } else {
    const credential = new OpenAIKeyCredential(apiKey!);
    openai = new OpenAIClient(credential);
  }

  const messages = [{ role: "user", content: preamble }];

  prompt = userPrompt.replace("{{REQUEST}}", prompt);

  let previousVersion: Version | undefined;
  if (store.history && store.history.length > 0) {
    previousVersion = store.history[store.history.length - 1];
    const content = previousVersion.files
      .map((e) => `<<—[${e.filename}]=\n${e.content}\n—>>`)
      .join("\n\n");

    messages.push(
      { role: "user", content: previousVersion.prompt },
      {
        role: "assistant",
        content,
      }
    );

    if (options.error) {
      const errorPrompt = `An error occured in the code you previously provided. Could you return an updated version of the code that fixes it? You don't need to apologize or return any prose. Simply look at the error message, and reply with the updated code that includes a fix.

ERROR:
${options.error}
    
RESPONSE:
`;

      messages.push({
        role: "user",
        content: errorPrompt,
      });
    } else {
      const editPrompt = `Here's an updated version of my previous request. Detect the edits I made, modify your previous response with the neccessary code changes, and then provide the full code again, with those modifications made. You only need to reply with files that have changed. But when changing a file, you should return the entire contents of that new file. However, you can ignore any files that haven't changed, and you don't need to apologize or return any prose, or code comments indicating that no changes were made. 
    
    ${prompt}`;

      messages.push({
        role: "user",
        content: editPrompt,
      });
    }
  } else {
    messages.push({
      role: "user",
      content: prompt,
    });
  }

  console.log("CS Request: %o", messages);

  const model = config.get("ai.model");
  const chatCompletion = await openai.getChatCompletions(
    model,
    // @ts-ignore
    messages
  );

  let response = chatCompletion.choices[0].message!.content!;

  // Despite asking it not to, the model will sometimes still add
  // prose to the beginning of the response. We need to remove it.
  const fileStart = response.indexOf("<<—[");
  if (fileStart !== 0) {
    response = response.slice(fileStart);
  }

  console.log("CS Response: %o", response);

  const files = response
    .split("—>>")
    .filter((e) => e !== "")
    .map((e) => {
      e = e.trim();
      const p = e.split("]=\n");
      return { filename: p[0].replace("<<—[", ""), content: p[1] };
    })!;

  // Merge the contents of files that have the same name.
  const mergedFiles: SwingFile[] = [];
  files.forEach((e) => {
    const existing = mergedFiles.find((f) => f.filename === e.filename);
    if (existing) {
      existing.content += "\n\n" + e.content;
    } else {
      mergedFiles.push(e);
    }
  });

  console.log("CS Files: %o", files);

  // If the model generated a component, then we need to remove any script
  // files that it might have also generated. Despite asking it not to!
  if (files.some((e) => e.filename.startsWith("App."))) {
    const scriptIndex = files.findIndex((e) =>
      e.filename.startsWith("script.")
    );
    if (scriptIndex !== -1) {
      files.splice(scriptIndex, 1);
    }
  }

  // Find any files in the previous files that aren't in the new files
  // and add them to the new files.
  if (previousVersion) {
    previousVersion.files.forEach((e) => {
      if (!files.some((f) => f.filename === e.filename)) {
        // @ts-ignore
        files.push(e);
      }
    });
  }

  store.history!.push({ prompt, files });

  return files;
}

export function registerAiModule(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand(`${EXTENSION_NAME}.setOpenAiApiKey`, async () => {
      const key = await window.showInputBox({
        prompt: "Enter your OpenAI API key",
        placeHolder: "",
      });
      if (!key) return;
      await storage.setOpenAiApiKey(key);
    })
  );

  context.subscriptions.push(
    commands.registerCommand(
      `${EXTENSION_NAME}.clearOpenAiApiKey`,
      async () => {
        await storage.deleteOpenAiApiKey();
      }
    )
  );

  initializeStorage(context);
}
