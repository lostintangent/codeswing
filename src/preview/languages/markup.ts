import * as path from "path";
import { TextDocument } from "vscode";
import { compileCode, getExtensions } from "./languageProvider";
import { getScriptContent } from "./script";

export const MARKUP_BASE_NAME = "index";

const MarkupLanguage = {
  html: ".html",
  markdown: ".md",
  pug: ".pug",
  jsx: ".jsx",
  tsx: ".tsx"
};

const REACT_EXTENSIONS = [
  MarkupLanguage.html,
  MarkupLanguage.jsx,
  MarkupLanguage.tsx,
];

const MARKUP_EXTENSIONS = [
  MarkupLanguage.html,
  MarkupLanguage.markdown,
  MarkupLanguage.pug,
  ...REACT_EXTENSIONS
];

export function getCandidateMarkupFilenames() {
  return getMarkupExtensions().map(
    (extension) => `${MARKUP_BASE_NAME}${extension}`
  );
}

export function getMarkupExtensions() {
  const customExtensions = getExtensions("markup");
  return [...MARKUP_EXTENSIONS, ...customExtensions];
}

export async function getMarkupContent(
  document: TextDocument
): Promise<string | null> {
  const content = document.getText();
  if (content.trim() === "") {
    return content;
  }

  const extension = path.extname(document.uri.path).toLocaleLowerCase();
  try {
    if (extension === MarkupLanguage.pug) {
      const pug = require("pug");
      return pug.render(content);
    } else if (extension === MarkupLanguage.markdown) {
      const markdown = require("markdown-it")();
      return markdown.render(content);
    } else if (extension === MarkupLanguage.html) {
      return content;
    } else if (extension === MarkupLanguage.jsx || extension === MarkupLanguage.tsx) {
      const [scriptCode] = (await getScriptContent(document, undefined))!
      const component = scriptCode!.match(/export\sdefault\s(?:(?:class|function)\s)?(\w+)/)![1];
  
      return `<div id="app"></div>
<script type="module">
        import React from "https://cdn.skypack.dev/react";
        import ReactDOM from "https://cdn.skypack.dev/react-dom";

        ${scriptCode}
        
        ReactDOM.render(<${component} />, document.queryElementById("app"));
</script>`
    } else {
      return await compileCode("markup", extension, content);
    }
  } catch {
    return null;
  }
}
