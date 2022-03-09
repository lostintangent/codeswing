import * as path from "path";
import { TextDocument } from "vscode";
import { getModuleUrl, processImports } from "../libraries/skypack";
import { compileCode, getExtensions } from "./languageProvider";
import { REACT_EXTENSIONS } from "./script";

const MARKUP_BASE_NAMES = ["index", "App", "main"];

const MarkupLanguage = {
  html: ".html",
  markdown: ".md",
  pug: ".pug",
  vue: ".vue",
  svelte: ".svelte",
  go: ".go",
};

const COMPONENT_EXTENSIONS = [
  MarkupLanguage.vue,
  MarkupLanguage.svelte,
  ...REACT_EXTENSIONS,
];

const MARKUP_EXTENSIONS = [
  MarkupLanguage.html,
  MarkupLanguage.markdown,
  MarkupLanguage.pug,
  MarkupLanguage.go,
  ...COMPONENT_EXTENSIONS,
];

function getMarkupExtensions() {
  const customExtensions = getExtensions("markup");
  return [...MARKUP_EXTENSIONS, ...customExtensions];
}

export function getCandidateMarkupFilenames() {
  return getMarkupExtensions().flatMap((extension) =>
    MARKUP_BASE_NAMES.map((baseName) => `${baseName}${extension}`)
  );
}

const COMPONENT_TYPE: { [extension: string]: string } = {
  ".jsx": "react",
  ".tsx": "react",
  ".vue": "vue",
  ".svelte": "svelte",
};

export async function getMarkupContent(
  document: TextDocument
): Promise<string | null> {
  const content = document.getText();
  if (content.trim() === "") {
    return content;
  }

  const extension = path.extname(document.uri.path).toLocaleLowerCase();
  try {
    if (COMPONENT_EXTENSIONS.includes(extension)) {
      const componentType = COMPONENT_TYPE[extension];
      const { compileComponent } = require(`./components/${componentType}`);
      const [component, appInit, imports] = await compileComponent(
        content,
        document
      );
      const code = processImports(component);
      return `<div id="app"></div>
<script type="module">
  ${imports &&
    imports.map(
      ([name, lib]: any) => `import ${name} from "${getModuleUrl(lib)}";\n`
    )}
  ${code}
  ${appInit}
</script>`;
    } else if (extension === MarkupLanguage.go) {
      const { compileGo } = require("./go");
      return await compileGo(content, document.uri);
    }

    switch (extension) {
      case MarkupLanguage.pug:
        const pug = require("pug");
        return pug.render(content);
      case MarkupLanguage.markdown:
        const markdown = require("markdown-it")();
        return markdown.render(content, { html: true });
      case MarkupLanguage.html:
        return content;
      default:
        return compileCode("markup", extension, content);
    }
  } catch {
    return null;
  }
}
