import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import * as config from "../config";
import { EXTENSION_NAME, SWING_FILE } from "../constants";
import { DEFAULT_MANIFEST, openSwing } from "../preview";
import { stringToByteArray, withProgress } from "../utils";
import {
  enableGalleries,
  loadGalleries,
  registerTemplateProvider
} from "./galleryProvider";

export interface SwingFile {
  filename: string;
  content?: string;
}

interface CodeSwingTemplateItem extends vscode.QuickPickItem {
  files?: SwingFile[];
}

export async function newSwing(
  uri: vscode.Uri | ((files: SwingFile[]) => Promise<vscode.Uri>),
  title: string = "Create new swing"
) {
  const quickPick = vscode.window.createQuickPick();
  quickPick.title = title;
  quickPick.placeholder = "Select the swing template to use";
  quickPick.matchOnDescription = true;

  const galleries = await loadGalleries();

  const templates: CodeSwingTemplateItem[] = galleries
    .filter((gallery) => gallery.enabled)
    .flatMap((gallery) => gallery.templates)
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((t) => ({ ...t, label: t.title }));

  if (templates.length === 0) {
    templates.push({
      label:
        "No templates available. Configure your template galleries and try again.",
    });
  }

  quickPick.items = templates;
  quickPick.buttons = [
    {
      iconPath: new vscode.ThemeIcon("settings"),
      tooltip: "Configure Template Galleries",
    },
  ];

  quickPick.onDidTriggerButton((e) =>
    promptForGalleryConfiguration(uri, title)
  );

  quickPick.onDidAccept(async () => {
    quickPick.hide();

    const template = quickPick.selectedItems[0] as CodeSwingTemplateItem;
    if (template.files) {
      const swingUri = await withProgress("Creating swing...", async () =>
        newSwingFromTemplate(template.files!, uri)
      );

      openSwing(swingUri);
    }
  });

  quickPick.show();
}

async function newSwingFromTemplate(
  files: SwingFile[],
  uri: vscode.Uri | ((files: SwingFile[]) => Promise<vscode.Uri>)
): Promise<vscode.Uri> {
  const manifest = files.find((file) => file.filename === SWING_FILE)
  if (!manifest) {
    const content = JSON.stringify(DEFAULT_MANIFEST, null, 2);
    files.push({ filename: SWING_FILE, content });
  } else if (manifest.content) {
    try {
      const content = JSON.parse(manifest.content);
      delete content.template;
      manifest.content = JSON.stringify(content, null, 2);
    } catch {
      // If the template included an invalid
      // manifest file, then there's nothing
      // we can really do about it.
    }
  }

  if (uri instanceof Function) {
    return uri(
      files.map(({ filename, content }) => ({
        filename,
        content: content ? content : "",
      }))
    );
  } else {
    await Promise.all(
      files.map(({ filename, content = "" }) => {
        const targetFileUri = vscode.Uri.joinPath(uri, filename);
        return vscode.workspace.fs.writeFile(
          targetFileUri,
          stringToByteArray(content)
        );
      })
    );
    return uri;
  }
}

async function promptForGalleryConfiguration(
  uri: vscode.Uri | ((files: SwingFile[]) => Promise<vscode.Uri>),
  title: string
) {
  const quickPick = vscode.window.createQuickPick();
  quickPick.title = "Configure template galleries";
  quickPick.placeholder =
    "Select the galleries you'd like to display templates from";
  quickPick.canSelectMany = true;

  const galleries = (await loadGalleries())
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((gallery) => ({ ...gallery, label: gallery.title }));

  quickPick.items = galleries;
  quickPick.selectedItems = galleries.filter((gallery) => gallery.enabled);

  quickPick.buttons = [vscode.QuickInputButtons.Back];
  quickPick.onDidTriggerButton((e) => {
    if (e === vscode.QuickInputButtons.Back) {
      return newSwing(uri, title);
    }
  });

  quickPick.onDidAccept(async () => {
    const galleries = quickPick.selectedItems.map((item) => (item as any).id);

    quickPick.busy = true;
    await enableGalleries(galleries);
    quickPick.busy = false;

    quickPick.hide();

    return newSwing(uri, title);
  });

  quickPick.show();
}

export async function registerCreationModule(
  context: vscode.ExtensionContext,
  api: any
) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      `${EXTENSION_NAME}.newScratchSwing`,
      async () => {
        const scratchDirectory =
          config.get("scratchDirectory") ||
          path.join(os.tmpdir(), EXTENSION_NAME);

        const dayjs = require("dayjs");
        const timestamp = dayjs().format("YYYY-MM-DD (hh-mm-ss A)");
        const swingDirectory = path.join(scratchDirectory, timestamp);

        const uri = vscode.Uri.file(swingDirectory);
        await vscode.workspace.fs.createDirectory(uri);

        newSwing(uri);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`${EXTENSION_NAME}.newSwing`, async () => {
      const folder = await vscode.window.showOpenDialog({
        canSelectFolders: true,
        canSelectFiles: false,
        canSelectMany: false,
        defaultUri: vscode.workspace.workspaceFolders?.[0].uri,
      });

      if (folder) {
        newSwing(folder[0]);
      }
    })
  );

  api.newSwing = newSwing;
  api.registerTemplateProvider = registerTemplateProvider;
}
