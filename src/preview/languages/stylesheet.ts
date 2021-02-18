import axios from "axios";
import * as path from "path";
import { store } from "src/store";
import { TextDocument, Uri, workspace } from "vscode";
import { byteArrayToString } from "../../utils";

export const STYLESHEET_BASE_NAME = "style";

const StylesheetLanguage = {
  css: ".css",
  less: ".less",
  sass: ".sass",
  scss: ".scss",
};

export const STYLESHEET_EXTENSIONS = [
  StylesheetLanguage.css,
  StylesheetLanguage.less,
  StylesheetLanguage.sass,
  StylesheetLanguage.scss,
];

export async function getStylesheetContent(
  document: TextDocument
): Promise<string | null> {
  const content = document.getText();
  if (content.trim() === "") {
    return content;
  }

  const extension = path.extname(document.uri.path).toLocaleLowerCase();

  try {
    switch (extension) {
      case StylesheetLanguage.scss:
      case StylesheetLanguage.sass: {
        const sass = require("sass");
        return byteArrayToString(
          sass.renderSync({
            data: content,
            indentedSyntax: extension === StylesheetLanguage.sass,
            importer: async (url: string, previous: string, done: Function) => {
              if (url.startsWith("http")) {
                const { data } = await axios(url);
                done({ contents: data });
              } else {
                const uri = Uri.joinPath(store.activeSwing!.currentUri, url);
                const contents = await workspace.fs.readFile(uri);
                done({ contents: byteArrayToString(contents) });
              }
            },
          }).css
        );
      }
      case StylesheetLanguage.less: {
        const less = require("less").default;
        const output = await less.render(content);
        return output.css;
      }
      default:
        return content;
    }
  } catch {
    return null;
  }
}
