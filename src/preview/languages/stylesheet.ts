import * as path from "path";
import { TextDocument } from "vscode";
import { store } from "../../store";
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
        const { css } = sass.renderSync({
          data: content,
          indentedSyntax: extension === StylesheetLanguage.sass,
          includePaths: [store.activeSwing!.currentUri.path]
        });

        return byteArrayToString(css);
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
