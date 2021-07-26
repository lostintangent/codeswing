import * as vscode from "vscode";
import { Uri } from "vscode";
import { DEFAULT_MANIFEST } from "..";
import { SWING_FILE, URI_PATTERN } from "../../constants";
import { store, SwingLibraryType, SwingManifest } from "../../store";
import { byteArrayToString, stringToByteArray } from "../../utils";
import {
  CdnJsLibraryVersion,
  getCdnJsLibraries,
  getLibraryVersions,
} from "./cdnjs";

async function libraryToVersionsPickList(libraryName: string) {
  const versions = await getLibraryVersions(libraryName);
  return versions.map((version) => ({
    label: version.version,
    version,
  }));
}

function libraryFilesToPickList(files: string[]) {
  return files.map((file) => ({
    label: file,
  }));
}

function createLibraryUrl(
  libraryName: string,
  libraryVersion: string,
  libraryFile: string
) {
  return `https://cdnjs.cloudflare.com/ajax/libs/${libraryName}/${libraryVersion}/${libraryFile}`;
}

function getSwingManifest(text: string): SwingManifest {
  try {
    const json = JSON.parse(text) as SwingManifest;

    return {
      ...DEFAULT_MANIFEST,
      ...json,
    };
  } catch {
    return DEFAULT_MANIFEST;
  }
}

async function addDependencyLink(
  libraryType: SwingLibraryType,
  libraryUrl: string
) {
  const uri = Uri.joinPath(store.activeSwing!.rootUri, SWING_FILE);

  let manifest;
  try {
    const content = byteArrayToString(await vscode.workspace.fs.readFile(uri));
    manifest = getSwingManifest(content);
  } catch (e) {
    manifest = DEFAULT_MANIFEST;
  }

  manifest[libraryType]!.push(libraryUrl);
  manifest[libraryType] = [...new Set(manifest[libraryType])];

  const updatedContent = JSON.stringify(manifest, null, 2);
  vscode.workspace.fs.writeFile(uri, stringToByteArray(updatedContent));

  store.activeSwing!.webView.updateManifest(updatedContent, true);
}

const EXCLUDED_LABELS = ["cjs", "esm", ".min.", ".prod."];
const EXCLUDED_FILES = [".mjs", ".map"];

function filterVersionFiles({ files }: CdnJsLibraryVersion) {
  return files.filter(
    (file) =>
      EXCLUDED_LABELS.every((label) => !file.includes(label)) &&
      EXCLUDED_FILES.every((excludedFile) => !file.endsWith(excludedFile))
  );
}

export async function addSwingLibrary(libraryType: SwingLibraryType) {
  const libraries = await getCdnJsLibraries();
  const libraryPickListItems = libraries.map((library) => {
    return {
      label: library.name,
      description: library.description,
      library,
    };
  });

  const list = vscode.window.createQuickPick();
  list.placeholder = "Select the library you'd like to add to the swing";
  list.items = libraryPickListItems;

  list.onDidChangeValue((value) => {
    list.items =
      value && value.match(URI_PATTERN)
        ? [{ label: value }, ...libraryPickListItems]
        : libraryPickListItems;
  });

  const clipboardValue = await vscode.env.clipboard.readText();
  if (clipboardValue && clipboardValue.match(URI_PATTERN)) {
    list.value = clipboardValue;
    list.items = [{ label: clipboardValue }, ...libraryPickListItems];
  }

  list.onDidAccept(async () => {
    const libraryAnswer = list.selectedItems[0] || list.value;

    list.hide();

    if (libraryAnswer.label.match(URI_PATTERN)) {
      return await addDependencyLink(libraryType, libraryAnswer.label);
    }

    const libraryVersionAnswer = await vscode.window.showQuickPick(
      await libraryToVersionsPickList(libraryAnswer.label),
      {
        placeHolder: "Select the library version you'd like to use",
      }
    );

    if (!libraryVersionAnswer) {
      return;
    }

    const libraryFiles = filterVersionFiles(libraryVersionAnswer.version);

    const fileAnswer =
      libraryFiles.length > 1
        ? await vscode.window.showQuickPick(
            await libraryFilesToPickList(libraryFiles),
            {
              placeHolder: "Select file version",
            }
          )
        : { label: libraryFiles[0] };

    if (!fileAnswer) {
      return;
    }

    const libraryUrl = createLibraryUrl(
      (<any>libraryAnswer).library.name,
      libraryVersionAnswer.label,
      fileAnswer.label
    );

    await addDependencyLink(libraryType, libraryUrl);
  });

  list.show();
}
