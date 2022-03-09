import axios from "axios";
import * as vscode from "vscode";

const COMPILE_URL = "https://go.dev/_/compile";

const ERROR_PATTERN = /^\.\/prog.go:(?<line>\d+):(?<column>\d+):\s*(?<message>.+)$/gim;
let diagnosticCollection: vscode.DiagnosticCollection | undefined;
export async function compileGo(code: string, documentUri: vscode.Uri) {
  try {
    if (diagnosticCollection) {
      diagnosticCollection.dispose();
      diagnosticCollection = undefined;
    }

    const data = new URLSearchParams({
      body: code,
      version: "2",
      withVet: "true",
    });

    const response = await axios.post(COMPILE_URL, data, {
      // The service returns "text/plain" as the
      // content type, so we need to override it
      responseType: "json",
    });

    let { Errors, Events } = response.data;
    if (Errors) {
      diagnosticCollection = vscode.languages.createDiagnosticCollection(
        "CodeSwing"
      );

      let match,
        diagnostics: vscode.Diagnostic[] = [];

      while ((match = ERROR_PATTERN.exec(Errors)) !== null) {
        const { line, column, message } = match.groups!;
        const lineNumber = parseInt(line) - 1;
        const columnNumber = parseInt(column) - 1;

        new vscode.Diagnostic(
          new vscode.Range(lineNumber, columnNumber, lineNumber, columnNumber),
          message,
          vscode.DiagnosticSeverity.Error
        );
      }

      console.log("Diagnostics: ", diagnostics);
      diagnosticCollection.set(documentUri, diagnostics);

      Errors = Errors.replace(/\.\/prog.go/g, "main.go");
    }

    return `<pre id="events"></pre>
<script>
  
  (async function loadEvents() {
    const errors = ${JSON.stringify(Errors)};
    const events = ${JSON.stringify(Events)};
    const container = document.getElementById("events");

    if (errors) {
      container.innerHTML += errors.replace(/\\n/g, "<br />")
      return;
    }

    for (let { Message, Kind, Delay } of events) {
      console.log(Delay);
      if (Delay > 0) {
        // The service returns delays in nanoseconds,
        // and so we need to convert it to milliseconds
        const timeout = Delay / 1000000;
        await new Promise((resolve) => setTimeout(resolve, timeout));
      }

      const message = Message.replace(/(?:\\r\\n|\\r|\\n)/g, "<br />");
      if (message.startsWith("\f")) {
        container.innerHTML = message.substring(1);
      } else if (message.startsWith("IMAGE:")) {
        const imageContents = message.substring(6);
        container.innerHTML = \`<img src="data:image/png;base64,\${imageContents}" />\`;
      } else {
        container.innerHTML += message;
      } 
    }
  })();

</script>`;
  } catch (e) {
    console.log("Error: ", e);
  }
}
