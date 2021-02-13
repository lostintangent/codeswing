import * as path from "path";
import { TextDocument } from "vscode";
import { compileCode, getExtensions } from "./languageProvider";
import { getScriptContent, REACT_EXTENSIONS } from "./script";

export const MARKUP_BASE_NAME = "index";

const MarkupLanguage = {
  html: ".html",
  markdown: ".md",
  pug: ".pug",
  vue: ".vue",
  svelte: ".svelte"
};

const MARKUP_EXTENSIONS = [
  MarkupLanguage.html,
  MarkupLanguage.markdown,
  MarkupLanguage.pug,
  MarkupLanguage.vue,
  MarkupLanguage.svelte,
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
    } else if (REACT_EXTENSIONS.includes(extension)) {
      const [scriptCode] = (await getScriptContent(document, undefined))!
      const [, component] = scriptCode.match(/export\sdefault\s(?:(?:class|function)\s)?(\w+)?/)!;

      return `<div id="app"></div>
<script type="module">
  
  ${scriptCode}
        
  ReactDOM.render(React.createElement(${component}), document.getElementById("app"));
  
</script>`;
    } else if (extension === MarkupLanguage.vue) {
      const { assemble, createDefaultCompiler } = require("@vue/component-compiler")

      const compiler = createDefaultCompiler();
       const descriptor = compiler.compileToDescriptor("index.vue", content);
       const { code } = assemble(compiler, "index.vue", descriptor, {});
       
       return `<div id="app"></div>
<script type="module">

  import Vue from 'https://cdn.skypack.dev/vue';

  ${code}

  new Vue({
    el: "#app",
    render: h => h(__vue_component__)
  });
  
</script>`;
    } else if (extension === MarkupLanguage.svelte) {
      const svelte = require("svelte/compiler")
      const { js: { code } } = svelte.compile(content, { sveltePath: "https://cdn.skypack.dev/svelte" });
      return `<div id="app"></div>
<script type="module">
 
  ${code}

  new Component({
    target: document.getElementById("app")
  });

</script>`
    }
     else {
      return await compileCode("markup", extension, content);
    }
  } catch {
    return null;
  }
}
