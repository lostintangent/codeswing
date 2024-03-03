import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import { getFileOfType } from ".";
import { EXTENSION_NAME, SWING_FILE, URI_PATTERN } from "../constants";
import { SwingFileType, store } from "../store";
import { getFileContents, getUriContents, stringToByteArray } from "../utils";
import { getCdnJsLibraries } from "./libraries/cdnjs";

function getExportMarkup(data: any) {
  const value = JSON.stringify(data)
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/&nbsp/g, "&amp;nbsp");

  return `<form action="https://codepen.io/pen/define" method="POST">
<input type="hidden" name="data" value="${value}" />
</form>

<script>

  window.onload = () => {
      document.querySelector("form").submit();
  };

</script>
`;
}

const SCRIPT_PATTERN = /<script src="(?<url>[^"]+)"><\/script>/gi;
const STYLE_PATTERN = /<link href="(?<url>[^"]+)" rel="stylesheet" \/>/gi;

interface PenDefinition {
  title: string;
  description: string;
  html?: string;
  html_pre_processor?: string;
  css?: string;
  css_pre_processor?: string;
  js?: string;
  js_pre_processor?: string;
  css_external?: string;
  js_external?: string;
  tags: string[];
}

function matchAllUrls(string: string, regex: RegExp): string[] {
  let match;
  let results = [];
  while ((match = regex.exec(string)) !== null) {
    if (match.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    results.push(match!.groups!.url);
  }
  return results;
}

function resolveLibraries(libraries: string[]) {
  return Promise.all(
    libraries.map(async (library: string) => {
      const isUrl = library.match(URI_PATTERN);
      if (isUrl) {
        return library;
      } else {
        const libraries = await getCdnJsLibraries();
        const libraryEntry = libraries.find((lib) => lib.name === library);

        if (!libraryEntry) {
          return "";
        }

        return libraryEntry.latest;
      }
    })
  );
}

export async function exportSwingToCodePen(uri: vscode.Uri) {
  await vscode.workspace.saveAll();

  const title = path.basename(uri.path);
  const files = (await vscode.workspace.fs.readDirectory(uri)).map(
    ([file, type]) => file
  );

  const data: PenDefinition = {
    title,
    description: title,
    tags: ["codeswing"],
  };

  const markupFile = getFileOfType(uri, files, SwingFileType.markup);
  const scriptFile = getFileOfType(uri, files, SwingFileType.script);
  const stylesheetFile = getFileOfType(uri, files, SwingFileType.stylesheet);

  if (markupFile) {
    data.html = await getUriContents(markupFile);
    data.html_pre_processor = markupFile.path.endsWith(".pug") ? "pug" : "none";
  }

  if (scriptFile) {
    data.js = await getUriContents(scriptFile);

    const extension = path.extname(scriptFile.path);
    switch (extension) {
      case ".babel":
      case ".jsx":
        data.js_pre_processor = "babel";
        break;
      case ".ts":
      case ".tsx":
        data.js_pre_processor = "typescript";
        break;
      default:
        data.js_pre_processor = "none";
    }
  }

  if (stylesheetFile) {
    data.css = await getUriContents(stylesheetFile);
    switch (path.extname(stylesheetFile.path)) {
      case ".scss":
        data.css_pre_processor = "scss";
        break;
      case ".sass":
        data.css_pre_processor = "sass";
        break;
      case ".less":
        data.css_pre_processor = "less";
        break;
      default:
        data.css_pre_processor = "none";
        break;
    }
  }

  let scripts: string[] = [];
  let styles: string[] = [];

  if (files.includes("scripts")) {
    const scriptsContent = await getFileContents(uri, "scripts");
    scripts = matchAllUrls(scriptsContent, SCRIPT_PATTERN);
  }

  if (files.includes("styles")) {
    const stylesContent = await getFileContents(uri, "styles");
    styles = matchAllUrls(stylesContent, STYLE_PATTERN);
  }

  if (files.includes(SWING_FILE)) {
    const manifestContent = await getFileContents(uri, SWING_FILE);
    if (manifestContent) {
      let manifest;
      try {
        manifest = JSON.parse(manifestContent);
      } catch (e) {
        throw new Error(
          "The swing's manifest file appears to be invalid. Please check it and try again."
        );
      }
      if (manifest.scripts && manifest.scripts.length > 0) {
        if (
          manifest.scripts.find((script: any) => script === "react") &&
          data.js_pre_processor === "none"
        ) {
          data.js_pre_processor = "babel";
        }

        scripts = scripts.concat(await resolveLibraries(manifest.scripts));
      }

      if (manifest.styles && manifest.styles.length > 0) {
        styles = styles.concat(await resolveLibraries(manifest.styles));
      }
    }
  }

  if (scripts.length > 0) {
    data.js_external = scripts.join(";");
  }

  if (styles.length > 0) {
    data.css_external = styles.join(";");
  }

  const exportMarkup = getExportMarkup(data);
  const exportUri = vscode.Uri.file(
    path.join(os.tmpdir(), "codepenexport.html")
  );

  await vscode.workspace.fs.writeFile(
    exportUri,
    stringToByteArray(exportMarkup)
  );
  await vscode.env.openExternal(exportUri);

  setTimeout(() => vscode.workspace.fs.delete(exportUri), 2000);
}

export function registerCodePenCommands(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(`${EXTENSION_NAME}.exportToCodePen`, () =>
      exportSwingToCodePen(store.activeSwing!.rootUri)
    )
  );
}
