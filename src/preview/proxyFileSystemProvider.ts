import * as path from "path";
import * as vscode from "vscode";
import { byteArrayToString, stringToByteArray } from "../utils";
import { compileComponent } from "./languages/components/svelte";
import { compileScriptContent } from "./languages/script";
import { processImports } from "./libraries/skypack";

export class ProxyFileSystemProvider implements vscode.FileSystemProvider {
  private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
  readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this
    ._emitter.event;

  static SCHEME = "codeswing-proxy";

  stat(uri: vscode.Uri): vscode.FileStat {
    return {
      type: vscode.FileType.File,
      ctime: Date.now(),
      mtime: Date.now(),
      size: 0,
    };
  }

  async readFile(uri: vscode.Uri): Promise<Uint8Array> {
    let proxyUri = vscode.Uri.parse(decodeURIComponent(uri.path.substr(1)));

    const extension = path.extname(uri.path);
    if (extension === ".js") {
      let type;
      if (uri.query) {
        const query = new URLSearchParams(uri.query);
        type = query.get("type");
        proxyUri = proxyUri.with({
          path: proxyUri.path.replace(".js", `.${type}`),
          query: "",
        });
      }

      let contents = byteArrayToString(
        await vscode.workspace.fs.readFile(proxyUri)
      );
      if (type === "svelte") {
        [contents] = await compileComponent(contents);
      } else if (type === "jsx" || type === "tsx") {
        const compiledContent = await compileScriptContent(
          contents,
          `.${type}`
        );
        if (compiledContent) {
          contents = compiledContent;
        }
      } else if (type === "json") {
        contents = `export default ${contents}`;
      } else if (type === "css") {
        contents = `const styleElement = document.createElement("style");
styleElement.textContent = \`${contents}\`;
document.head.appendChild(styleElement);`;
      }

      return stringToByteArray(processImports(contents));
    } else {
      return vscode.workspace.fs.readFile(proxyUri);
    }
  }

  public static getProxyUri(uri: vscode.Uri) {
    return vscode.Uri.parse(
      `${ProxyFileSystemProvider.SCHEME}:/${encodeURIComponent(uri.toString())}`
    );
  }

  writeFile(
    uri: vscode.Uri,
    content: Uint8Array,
    options: { create: boolean; overwrite: boolean }
  ): void {
    throw vscode.FileSystemError.NoPermissions("Not supported");
  }

  delete(uri: vscode.Uri): void {
    throw vscode.FileSystemError.NoPermissions("Not supported");
  }

  readDirectory(uri: vscode.Uri): [string, vscode.FileType][] {
    throw vscode.FileSystemError.NoPermissions("Not supported");
  }

  rename(
    oldUri: vscode.Uri,
    newUri: vscode.Uri,
    options: { overwrite: boolean }
  ): void {
    throw vscode.FileSystemError.NoPermissions("Not supported");
  }

  createDirectory(uri: vscode.Uri): void {
    throw vscode.FileSystemError.NoPermissions("Not supported");
  }

  watch(_resource: vscode.Uri): vscode.Disposable {
    throw vscode.FileSystemError.NoPermissions("Not supported");
  }
}

export function registerProxyFileSystemProvider() {
  vscode.workspace.registerFileSystemProvider(
    ProxyFileSystemProvider.SCHEME,
    new ProxyFileSystemProvider(),
    {
      isReadonly: true,
    }
  );
}
