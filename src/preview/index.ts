import { debounce } from "debounce";
import * as path from "path";
import * as vscode from "vscode";
import { Uri } from "vscode";
import * as config from "../config";
import { EXTENSION_NAME, INPUT_SCHEME, PLAYGROUND_FILE } from "../constants";
import { TempFileSystemProvider } from "../creation/tempFileSystem";
import { PlaygroundFileType, PlaygroundManifest, store } from "../store";
/*import {
  endCurrentTour,
  isCodeTourInstalled,
  startTourFromFile,
} from "../tour";*/
import {
  byteArrayToString,
  getFileContents,
  stringToByteArray,
} from "../utils";
import { registerPlaygroundCommands } from "./commands";
import { discoverLanguageProviders } from "./languages/languageProvider";
import {
  getMarkupContent,
  getMarkupExtensions,
  MARKUP_BASE_NAME,
} from "./languages/markup";
import {
  getReadmeContent,
  README_BASE_NAME,
  README_EXTENSIONS,
} from "./languages/readme";
import {
  includesReactFiles,
  includesReactScripts,
  REACT_SCRIPTS,
  SCRIPT_BASE_NAME,
  SCRIPT_EXTENSIONS,
} from "./languages/script";
import {
  getStylesheetContent,
  STYLESHEET_BASE_NAME,
  STYLESHEET_EXTENSIONS,
} from "./languages/stylesheet";
import { createLayoutManager } from "./layoutManager";
import { getCDNJSLibraries } from "./libraries/cdnjs";
import { initializeStorage, storage, TUTORIAL_KEY } from "./tutorials/storage";
import { PlaygroundWebview } from "./webview";

const CONFIG_FILE = "config.json";
const CANVAS_FILE = "canvas.html";

export const DEFAULT_MANIFEST = {
  scripts: [] as string[],
  styles: [] as string[],
};

export function setActivePlaygroundHasTour() {
  if (store.activePlayground) {
    store.activePlayground.hasTour = true;
  }
}

export const getCanvasContent = async (uri: Uri, files: string[]) => {
  if (!files.includes(CANVAS_FILE)) {
    return "";
  }

  return await getFileContents(uri, CANVAS_FILE);
};

export async function getManifestContent(uri: Uri, files: string[]) {
  const manifest = await getFileContents(uri, PLAYGROUND_FILE);
  if (includesReactFiles(files)) {
    const parsedManifest = JSON.parse(manifest);
    if (!includesReactScripts(parsedManifest.scripts)) {
      parsedManifest.scripts.push(...REACT_SCRIPTS);
      parsedManifest.scripts = [...new Set(parsedManifest.scripts)];

      const content = JSON.stringify(parsedManifest, null, 2);

      const manifestUri = getFileOfType(
        uri,
        files,
        PlaygroundFileType.manifest
      );

      vscode.workspace.fs.writeFile(manifestUri!, stringToByteArray(content));
      return content;
    }
  }

  return manifest;
}

function isPlaygroundDocument(
  files: string[],
  document: vscode.TextDocument,
  fileType: PlaygroundFileType
) {
  if (
    store.activePlayground!.uri.scheme !== document.uri.scheme ||
    store.activePlayground!.uri.authority !== document.uri.authority ||
    store.activePlayground!.uri.query !== document.uri.query ||
    store.activePlayground!.uri.path !== path.dirname(document.uri.path) ||
    !files.includes(path.basename(document.uri.path))
  ) {
    return false;
  }

  let extensions: string[];
  let fileBaseName: string;
  switch (fileType) {
    case PlaygroundFileType.markup:
      extensions = getMarkupExtensions();
      fileBaseName = MARKUP_BASE_NAME;
      break;
    case PlaygroundFileType.script:
      extensions = SCRIPT_EXTENSIONS;
      fileBaseName = SCRIPT_BASE_NAME;
      break;
    case PlaygroundFileType.readme:
      extensions = README_EXTENSIONS;
      fileBaseName = README_BASE_NAME;
      break;
    case PlaygroundFileType.manifest:
      extensions = [""];
      fileBaseName = PLAYGROUND_FILE;
      break;
    case PlaygroundFileType.config:
      extensions = [""];
      fileBaseName = CONFIG_FILE;
      break;
    case PlaygroundFileType.stylesheet:
    default:
      extensions = STYLESHEET_EXTENSIONS;
      fileBaseName = STYLESHEET_BASE_NAME;
      break;
  }

  const fileCandidates = extensions.map(
    (extension) => new RegExp(`${fileBaseName}${extension}`)
  );

  return fileCandidates.find((candidate) => candidate.test(document.uri.path));
}

const TOUR_FILE = "main.tour";

export function getFileOfType(
  uri: Uri,
  files: string[],
  fileType: PlaygroundFileType
): Uri | undefined {
  let extensions: string[];
  let fileBaseName: string;
  switch (fileType) {
    case PlaygroundFileType.markup:
      extensions = getMarkupExtensions();
      fileBaseName = MARKUP_BASE_NAME;
      break;
    case PlaygroundFileType.script:
      extensions = SCRIPT_EXTENSIONS;
      fileBaseName = SCRIPT_BASE_NAME;
      break;
    case PlaygroundFileType.readme:
      extensions = README_EXTENSIONS;
      fileBaseName = README_BASE_NAME;
      break;
    case PlaygroundFileType.manifest:
      extensions = [""];
      fileBaseName = PLAYGROUND_FILE;
      break;
    case PlaygroundFileType.tour:
      extensions = [""];
      fileBaseName = TOUR_FILE;
      break;
    case PlaygroundFileType.config:
      extensions = [""];
      fileBaseName = CONFIG_FILE;
      break;
    case PlaygroundFileType.stylesheet:
    default:
      extensions = STYLESHEET_EXTENSIONS;
      fileBaseName = STYLESHEET_BASE_NAME;
      break;
  }

  const fileCandidates = extensions.map(
    (extension) => `${fileBaseName}${extension}`
  );

  const file = files.find((file) =>
    fileCandidates.find((candidate) => candidate === file)
  );

  if (file) {
    return Uri.joinPath(uri, file!);
  }
}

const TUTORIAL_STEP_PATTERN = /^#?(?<step>\d+)[^\/]*/;
export async function openPlayground(uri: Uri) {
  if (store.activePlayground) {
    store.activePlayground.webViewPanel.dispose();

    if (store.activePlayground?.uri.scheme === "playground") {
      await TempFileSystemProvider.clear();
    }
  }

  let files = (await vscode.workspace.fs.readDirectory(uri)).map(
    ([file, _]) => file
  );

  // TODO: Seperate root and current URIs

  let manifest: PlaygroundManifest = {};
  if (getFileOfType(uri, files, PlaygroundFileType.manifest)) {
    try {
      const manifestContent = await getManifestContent(uri, files);
      manifest = JSON.parse(manifestContent);
    } catch {}
  }

  let currentTutorialStep: number | undefined;
  let totalTutorialSteps: number | undefined;

  if (manifest.tutorial) {
    currentTutorialStep = storage.currentTutorialStep(uri);
    const tutoralSteps = files.filter(([file, _]) =>
      file.match(TUTORIAL_STEP_PATTERN)
    );

    totalTutorialSteps = tutoralSteps.reduce((maxStep, [fileName, _]) => {
      const step = Number(TUTORIAL_STEP_PATTERN.exec(fileName)!.groups!.step);

      if (step > maxStep) {
        return step;
      } else {
        return maxStep;
      }
    }, 0);

    const stepDirectory = files.find((file) =>
      file.match(new RegExp(`^#?${currentTutorialStep}`))
    );

    uri = Uri.joinPath(uri, stepDirectory!, "/");

    files = (await vscode.workspace.fs.readDirectory(uri)).map(
      ([file, _]) => file
    );

    const stepManifestFile = getFileOfType(
      uri,
      files,
      PlaygroundFileType.manifest
    );

    if (stepManifestFile) {
      const stepManifest = byteArrayToString(
        await vscode.workspace.fs.readFile(stepManifestFile)
      );
      manifest = {
        ...manifest,
        ...JSON.parse(stepManifest),
      };
    }
  }

  const markupFile = getFileOfType(uri, files, PlaygroundFileType.markup);
  const stylesheetFile = getFileOfType(
    uri,
    files,
    PlaygroundFileType.stylesheet
  );

  const scriptFile = getFileOfType(uri, files, PlaygroundFileType.script);
  const readmeFile = getFileOfType(uri, files, PlaygroundFileType.readme);
  const configFile = getFileOfType(uri, files, PlaygroundFileType.config);

  const inputFile =
    manifest.input && manifest.input.fileName
      ? `${INPUT_SCHEME}:///${manifest.input.fileName}`
      : "";

  const includedFiles = [
    !!markupFile,
    !!stylesheetFile,
    !!scriptFile,
    !!inputFile,
  ].filter((file) => file).length;

  const layoutManager = await createLayoutManager(
    includedFiles,
    manifest.layout
  );

  const [htmlDocument, cssDocument, jsDocument] = await Promise.all(
    [markupFile, stylesheetFile, scriptFile].map(
      async (file) => file && vscode.workspace.openTextDocument(file)
    )
  );

  [htmlDocument, cssDocument, jsDocument].forEach(
    (document) => document && layoutManager.showDocument(document)
  );

  let inputDocument: vscode.TextDocument;
  if (inputFile) {
    // Clear any previous content from the input file.
    await vscode.workspace.fs.writeFile(
      vscode.Uri.parse(inputFile),
      stringToByteArray("")
    );

    inputDocument = await vscode.workspace.openTextDocument(
      vscode.Uri.parse(inputFile)
    );

    const editor = await layoutManager.showDocument(inputDocument, false);

    const prompt = manifest.input!.prompt;
    if (prompt) {
      const decoration = vscode.window.createTextEditorDecorationType({
        after: {
          contentText: prompt,
          margin: "0 0 0 30px",
          fontStyle: "italic",
          color: new vscode.ThemeColor("editorLineNumber.foreground"),
        },
        isWholeLine: true,
      });

      editor?.setDecorations(decoration, [new vscode.Range(0, 0, 0, 1000)]);
    }

    // Continuously save this file so that it doesn't ask
    // the user to save it upon closing
    const interval = setInterval(() => {
      if (inputDocument) {
        inputDocument.save();
      } else {
        clearInterval(interval);
      }
    }, 100);
  }

  const webViewPanel = vscode.window.createWebviewPanel(
    "playground.preview",
    "Preview",
    { viewColumn: layoutManager.previewViewColumn, preserveFocus: true },
    { enableScripts: true }
  );

  const output = vscode.window.createOutputChannel("Playground");

  // In order to provide CodePen interop,
  // we'll look for an optional "scripts"
  // file, which includes the list of external
  // scripts that were added to the pen.
  let scripts: string | undefined;
  if (files.includes("scripts")) {
    scripts = await getFileContents(uri, "scripts");
  }
  let styles: string | undefined;
  if (files.includes("styles")) {
    styles = await getFileContents(uri, "styles");
  }

  const htmlView = new PlaygroundWebview(
    webViewPanel.webview,
    output,
    uri,
    scripts,
    styles,
    totalTutorialSteps,
    manifest.tutorial
  );

  if (config.get("showConsole") || manifest.showConsole) {
    output.show(false);
  }

  store.activePlayground = {
    uri,
    webView: htmlView,
    webViewPanel,
    console: output,
    hasTour: false,
  };

  const autoRun = config.get("autoRun");
  const runOnEdit = autoRun === "onEdit";

  function processReadme(rawContent: string, runOnEdit: boolean = false) {
    // @ts-ignore
    if (manifest.readmeBehavior === "inputComment" && inputDocument) {
      if (store.activePlayground!.commentController) {
        store.activePlayground!.commentController.dispose();
      }

      store.activePlayground!.commentController = vscode.comments.createCommentController(
        EXTENSION_NAME,
        EXTENSION_NAME
      );

      const thread = store.activePlayground!.commentController.createCommentThread(
        inputDocument.uri,
        new vscode.Range(0, 0, 0, 0),
        [
          {
            author: {
              name: "Playground",
              iconPath: vscode.Uri.parse(
                "https://cdn.jsdelivr.net/gh/vsls-contrib/gistpad/images/icon.png"
              ),
            },
            body: rawContent,
            mode: vscode.CommentMode.Preview,
          },
        ]
      );

      // @ts-ignore
      thread.canReply = false;
      thread.collapsibleState = vscode.CommentThreadCollapsibleState.Expanded;
    } else {
      const htmlContent = getReadmeContent(rawContent);
      htmlView.updateReadme(htmlContent || "", runOnEdit);
    }
  }

  const documentChangeDisposable = vscode.workspace.onDidChangeTextDocument(
    debounce(async ({ document }) => {
      if (isPlaygroundDocument(files, document, PlaygroundFileType.markup)) {
        const content = await getMarkupContent(document);

        if (content !== null) {
          htmlView.updateHTML(content, runOnEdit);
        }
      } else if (
        isPlaygroundDocument(files, document, PlaygroundFileType.script)
      ) {
        // If the user renamed the script file (e.g. from *.js to *.jsx)
        // than we need to update the manifest in case new scripts
        // need to be injected into the webview (e.g. "react").
        if (
          jsDocument &&
          jsDocument.uri.toString() !== document.uri.toString()
        ) {
          // TODO: Clean up this logic
          const fileName = path.basename(document.uri.toString());
          files.push(fileName);
          files = files.filter(
            (file) => file !== path.basename(jsDocument.uri.toString())
          );

          htmlView.updateManifest(
            await getManifestContent(uri, files),
            runOnEdit
          );
        }

        htmlView.updateJavaScript(document, runOnEdit);
      } else if (
        isPlaygroundDocument(files, document, PlaygroundFileType.manifest)
      ) {
        htmlView.updateManifest(document.getText(), runOnEdit);

        if (jsDocument) {
          manifest = JSON.parse(document.getText());

          // TODO: Only update the JS if the manifest change
          // actually impacts it (e.g. adding/removing react)
          htmlView.updateJavaScript(jsDocument, runOnEdit);
        }
      } else if (
        isPlaygroundDocument(files, document, PlaygroundFileType.stylesheet)
      ) {
        const content = await getStylesheetContent(document);
        if (content !== null) {
          htmlView.updateCSS(content, runOnEdit);
        }
      } else if (
        isPlaygroundDocument(files, document, PlaygroundFileType.readme)
      ) {
        const rawContent = document.getText();
        processReadme(rawContent, runOnEdit);
      } else if (
        isPlaygroundDocument(files, document, PlaygroundFileType.config)
      ) {
        htmlView.updateConfig(document.getText(), runOnEdit);
      } else if (document.uri.scheme === INPUT_SCHEME) {
        htmlView.updateInput(document.getText(), runOnEdit);
      }
    }, 100)
  );

  let documentSaveDisposeable: vscode.Disposable;
  if (!runOnEdit && autoRun === "onSave") {
    documentSaveDisposeable = vscode.workspace.onDidSaveTextDocument(
      async (document) => {
        if (
          document.uri.scheme === store.activePlayground!.uri.scheme &&
          document.uri.authority === store.activePlayground?.uri.authority &&
          document.uri.query === store.activePlayground?.uri.query &&
          path.dirname(document.uri.path) ===
            path.dirname(store.activePlayground.uri.path)
        ) {
          await htmlView.rebuildWebview();
        }
      }
    );
  }

  htmlView.updateManifest(manifest ? JSON.stringify(manifest) : "");

  htmlView.updateHTML(
    !!markupFile
      ? (await getMarkupContent(htmlDocument!)) || ""
      : await getCanvasContent(uri, files)
  );
  htmlView.updateCSS(
    !!stylesheetFile ? (await getStylesheetContent(cssDocument!)) || "" : ""
  );

  if (jsDocument) {
    htmlView.updateJavaScript(jsDocument!);
  }

  if (readmeFile) {
    const rawContent = byteArrayToString(
      await vscode.workspace.fs.readFile(readmeFile)
    );

    processReadme(rawContent);
  }

  if (configFile) {
    const content = byteArrayToString(
      await vscode.workspace.fs.readFile(configFile)
    );

    htmlView.updateConfig(content || "");
  }

  await htmlView.rebuildWebview();

  await vscode.commands.executeCommand(
    "setContext",
    "playground:inPlayground",
    true
  );

  const autoSave = vscode.workspace
    .getConfiguration("files")
    .get<string>("autoSave");
  let autoSaveInterval: any;

  const canEdit = true;
  if (
    autoSave !== "afterDelay" && // Don't enable autoSave if the end-user has already configured it
    config.get("autoSave") &&
    canEdit // You can't edit gists you don't own, so it doesn't make sense to attempt to auto-save these files
  ) {
    autoSaveInterval = setInterval(async () => {
      vscode.commands.executeCommand("workbench.action.files.saveAll");
    }, 30000);
  }

  webViewPanel.onDidDispose(() => {
    vscode.commands.executeCommand("workbench.action.closeAllEditors");
    vscode.commands.executeCommand("workbench.action.closePanel");

    output.dispose();

    documentChangeDisposable.dispose();
    documentSaveDisposeable?.dispose();

    if (store.activePlayground?.hasTour) {
      //
      //TODO: endCurrentTour();
      vscode.commands.executeCommand(
        "setContext",
        "playground:allowCodeTourRecording",
        false
      );
    }

    store.activePlayground?.commentController?.dispose();
    store.activePlayground = undefined;

    if (autoSaveInterval) {
      clearInterval(autoSaveInterval);
    }

    vscode.commands.executeCommand(
      "setContext",
      "playground:inPlayground",
      false
    );
  });

  // TODO
  /*if (await isCodeTourInstalled()) {
    const tourFileName = getGistFileOfType(uri, files, PlaygroundFileType.tour);

    if (tourFileName) {
      store.activePlayground!.hasTour = true;
      startTourFromFile(tourFileName, uri, false, playground.canEdit);
    }

    if (playground.canEdit) {
      await vscode.commands.executeCommand(
        "setContext",
        "playground:allowCodeTourRecording",
        true
      );
    }
  }*/
}

export function registerPreviewModule(
  context: vscode.ExtensionContext,
  api: any
) {
  registerPlaygroundCommands(context);

  getCDNJSLibraries();
  discoverLanguageProviders();

  // @ts-ignore
  context.globalState.setKeysForSync([TUTORIAL_KEY]);

  api.openPlayground = openPlayground;

  initializeStorage(context);
}
