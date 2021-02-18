import * as vscode from "vscode";

const FS_SCHEME = "codeswing-proxy";
export class ProxyFileSystemProvider implements vscode.FileSystemProvider {
  private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
  readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this
    ._emitter.event;

  stat(uri: vscode.Uri): vscode.FileStat {
    return {
      type: vscode.FileType.File,
      ctime: 0,
      mtime: 0,
      size: 100000,
    };
  }

  async readFile(uri: vscode.Uri): Promise<Uint8Array> {
    const proxyUri = vscode.Uri.parse(decodeURIComponent(uri.path.substr(1)));
    const file = await vscode.workspace.fs.readFile(proxyUri);
    return Buffer.from(file.buffer);
  }

  public static getProxyUri(uri: vscode.Uri) {
    return vscode.Uri.parse(
      `${FS_SCHEME}:/${encodeURIComponent(uri.toString())}`
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
    FS_SCHEME,
    new ProxyFileSystemProvider()
  );
}
