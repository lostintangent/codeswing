import * as sass from "sass";
import { Uri } from "vscode";

export async function compile(
  content: string,
  indentedSyntax: boolean,
  importUri: Uri
) {
  const { css } = sass.renderSync({
    data: content,
    indentedSyntax,
    includePaths: [importUri.path],
  });

  return css;
}
