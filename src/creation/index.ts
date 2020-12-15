import * as vscode from "vscode";
import * as config from "../config";
import { EXTENSION_NAME, PLAYGROUND_FILE } from "../constants";
import { DEFAULT_MANIFEST, openPlayground } from "../preview";
import { getNewMarkupFilename } from "../preview/languages/markup";
import {
  getNewScriptFileName,
  isReactFile,
  REACT_SCRIPTS,
} from "../preview/languages/script";
import { getNewStylesheetFilename } from "../preview/languages/stylesheet";
import { byteArrayToString, stringToByteArray, withProgress } from "../utils";
import { enableGalleries, loadGalleries } from "./galleryProvider";
import { TempFileSystemProvider } from "./tempFileSystem";

// TODO: Enable user-provided playground templates

interface PlaygroundFile {
  filename: string;
  content?: string;
}

async function generateNewPlaygroundFiles(): Promise<PlaygroundFile[]> {
  const manifest = {
    ...DEFAULT_MANIFEST,
  };

  const files = [];

  if (await config.get("includeScript")) {
    const scriptFileName = await getNewScriptFileName();

    files.push({
      filename: scriptFileName,
    });

    if (isReactFile(scriptFileName)) {
      manifest.scripts.push(...REACT_SCRIPTS);
    }
  }

  if (config.get("includeStylesheet")) {
    const stylesheetFileName = await getNewStylesheetFilename();

    files.push({
      filename: stylesheetFileName,
    });
  }

  if (config.get("includeMarkup")) {
    const markupFileName = await getNewMarkupFilename();

    files.push({
      filename: markupFileName,
    });
  }

  files.push({
    filename: PLAYGROUND_FILE,
    content: JSON.stringify(manifest, null, 2),
  });

  return files;
}

let PLAYGROUND_ID = 0;
export async function newPlayground(
  uri:
    | vscode.Uri
    | ((files: PlaygroundFile[]) => Promise<vscode.Uri>) = vscode.Uri.parse(
    `${EXTENSION_NAME}://${++PLAYGROUND_ID}/`
  ),
  title: string = "Create new playground"
) {
  const quickPick = vscode.window.createQuickPick();
  quickPick.title = title;
  quickPick.placeholder = "Select the playground template to use";
  quickPick.matchOnDescription = true;

  const galleries = await loadGalleries();

  const templates = galleries
    .filter((gallery) => gallery.enabled)
    .flatMap((gallery) => gallery.templates);

  if (templates.length === 0) {
    return newPlaygroundFromSettings(uri);
  }

  quickPick.items = [
    ...templates.sort((a, b) => a.label.localeCompare(b.label)),
    {
      label: "$(arrow-right) Continue without a template",
      alwaysShow: true,
      description: "Create a playground based on your configured settings",
    },
  ];

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

    const template = quickPick.selectedItems[0];
    const gistId = (template as any).gist;

    const playgroundUri = await withProgress(
      "Creating playground...",
      async () => {
        if (gistId) {
          const templateUri = vscode.Uri.parse(`gist://${gistId}/`);
          return newPlaygroundFromTemplate(templateUri, uri);
        } else {
          return newPlaygroundFromSettings(uri);
        }
      }
    );

    openPlayground(playgroundUri);
  });

  quickPick.show();
}

async function newPlaygroundFromSettings(
  uri: vscode.Uri | ((files: PlaygroundFile[]) => Promise<vscode.Uri>)
): Promise<vscode.Uri> {
  const files = await generateNewPlaygroundFiles();
  if (uri instanceof Function) {
    return uri(files);
  } else {
    await Promise.all(
      files.map(async (file) => {
        const targetFileUri = vscode.Uri.joinPath(uri, file.filename);
        const content = stringToByteArray(file.content || "");
        return vscode.workspace.fs.writeFile(targetFileUri, content);
      })
    );
    return uri;
  }
}

async function newPlaygroundFromTemplate(
  templateUri: vscode.Uri,
  uri: vscode.Uri | ((files: PlaygroundFile[]) => Promise<vscode.Uri>)
): Promise<vscode.Uri> {
  const files = await vscode.workspace.fs.readDirectory(templateUri);

  const fileContents = await Promise.all(
    files.map(async ([filename, _]) => {
      const sourceFileUri = vscode.Uri.joinPath(templateUri, filename);
      const content = await vscode.workspace.fs.readFile(sourceFileUri);

      return { filename, content };
    })
  );

  if (uri instanceof Function) {
    return uri(
      fileContents.map(({ filename, content }) => ({
        filename,
        content: content ? byteArrayToString(content) : "",
      }))
    );
  } else {
    await Promise.all(
      fileContents.map(({ filename, content }) => {
        const targetFileUri = vscode.Uri.joinPath(uri, filename);
        return vscode.workspace.fs.writeFile(targetFileUri, content);
      })
    );
    return uri;
  }
}

async function promptForGalleryConfiguration(
  uri: vscode.Uri | ((files: PlaygroundFile[]) => Promise<vscode.Uri>),
  title: string
) {
  const quickPick = vscode.window.createQuickPick();
  quickPick.title = "Configure template galleries";
  quickPick.placeholder =
    "Select the galleries you'd like to display templates from";
  quickPick.canSelectMany = true;

  const galleries = (await loadGalleries()).sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  quickPick.items = galleries;
  quickPick.selectedItems = galleries.filter((gallery) => gallery.enabled);

  quickPick.buttons = [vscode.QuickInputButtons.Back];
  quickPick.onDidTriggerButton((e) => {
    if (e === vscode.QuickInputButtons.Back) {
      return newPlayground(uri, title);
    }
  });

  quickPick.onDidAccept(async () => {
    const galleries = quickPick.selectedItems.map((item) => (item as any).id);

    quickPick.busy = true;
    await enableGalleries(galleries);
    quickPick.busy = false;

    quickPick.hide();

    return newPlayground(uri, title);
  });

  quickPick.show();
}

export async function registerCreationModule(
  context: vscode.ExtensionContext,
  api: any
) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      `${EXTENSION_NAME}.newTemporaryPlayground`,
      newPlayground
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `${EXTENSION_NAME}.newPlayground`,
      async () => {
        const folder = await vscode.window.showOpenDialog({
          canSelectFolders: true,
          canSelectFiles: false,
          canSelectMany: false,
          defaultUri: vscode.workspace.workspaceFolders?.[0].uri,
        });

        if (folder) {
          newPlayground(folder[0]);
        }
      }
    )
  );

  vscode.workspace.registerFileSystemProvider(
    EXTENSION_NAME,
    new TempFileSystemProvider()
  );

  api.newPlayground = newPlayground;
}
