import {
  Disposable,
  Event,
  EventEmitter,
  FileChangeEvent,
  FileChangeType,
  FileStat,
  FileSystemError,
  FileSystemProvider,
  FileType,
  Uri,
  workspace,
} from "vscode";
import { EXTENSION_NAME } from "../constants";

let fileId = 0;
const playgroundFiles = new Map<string, Map<string, Uint8Array>>();

export class TempFileSystemProvider implements FileSystemProvider {
  private _onDidChangeFile = new EventEmitter<FileChangeEvent[]>();
  public readonly onDidChangeFile: Event<FileChangeEvent[]> = this
    ._onDidChangeFile.event;

  static async clear() {
    return Promise.all(
      Array.from(playgroundFiles.keys()).map((file) =>
        workspace.fs.delete(Uri.parse(`${EXTENSION_NAME}:/${file}`))
      )
    );
  }

  async copy?(
    source: Uri,
    destination: Uri,
    options: { overwrite: boolean }
  ): Promise<void> {}

  createDirectory(uri: Uri): void {}

  async delete(uri: Uri, options: { recursive: boolean }): Promise<void> {
    if (!playgroundFiles.has(uri.authority)) {
      throw FileSystemError.FileNotFound(uri);
    }

    playgroundFiles.get(uri.authority)!.delete(uri.path);
    this._onDidChangeFile.fire([{ type: FileChangeType.Deleted, uri }]);
  }

  async readFile(uri: Uri): Promise<Uint8Array> {
    if (!playgroundFiles.has(uri.authority)) {
      throw FileSystemError.FileNotFound(uri);
    }

    return playgroundFiles.get(uri.authority)!.get(uri.path)!;
  }

  async readDirectory(uri: Uri): Promise<[string, FileType][]> {
    if (!playgroundFiles.has(uri.authority)) {
      throw FileSystemError.FileNotFound(uri);
    }

    return Array.from(
      playgroundFiles.get(uri.authority)!.keys()
    ).map((file) => [file, FileType.File]);
  }

  async rename(
    oldUri: Uri,
    newUri: Uri,
    options: { overwrite: boolean }
  ): Promise<void> {
    const content = playgroundFiles.get(oldUri.path)!;
    playgroundFiles.set(newUri.path, content);
    playgroundFiles.delete(oldUri.path);

    this._onDidChangeFile.fire([
      { type: FileChangeType.Deleted, uri: oldUri },
      { type: FileChangeType.Created, uri: newUri },
    ]);
  }

  async stat(uri: Uri): Promise<FileStat> {
    if (uri.path === "/") {
      return {
        type: FileType.Directory,
        ctime: 0,
        mtime: 0,
        size: 100,
      };
    }

    if (
      !playgroundFiles.get(uri.authority) ||
      !playgroundFiles.get(uri.authority)!.has(uri.path)
    ) {
      throw FileSystemError.FileNotFound(uri);
    }

    const content = playgroundFiles.get(uri.authority)!.get(uri.path);
    return {
      type: FileType.File,
      ctime: ++fileId,
      mtime: ++fileId,
      size: content!.byteLength,
    };
  }

  async writeFile(
    uri: Uri,
    content: Uint8Array,
    options: { create: boolean; overwrite: boolean }
  ): Promise<void> {
    if (!playgroundFiles.has(uri.authority)) {
      playgroundFiles.set(uri.authority, new Map());
    }

    const isNew = playgroundFiles.get(uri.authority)!.has(uri.path);
    playgroundFiles.get(uri.authority)!.set(uri.path, content);

    const type = isNew ? FileChangeType.Created : FileChangeType.Changed;
    this._onDidChangeFile.fire([{ type, uri }]);
  }

  watch(
    uri: Uri,
    options: { recursive: boolean; excludes: string[] }
  ): Disposable {
    return new Disposable(() => {});
  }
}
