import * as path from "path";
import { ThemeIcon, TreeItem, TreeItemCollapsibleState, Uri } from "vscode";

export class CodeSwingFileNode extends TreeItem {
  constructor(public swingUri: Uri, public file: string) {
    super(path.basename(file), TreeItemCollapsibleState.None);

    this.iconPath = ThemeIcon.File;
    this.resourceUri = Uri.joinPath(swingUri, file);
    this.contextValue = "swing.file";

    this.command = {
      command: "vscode.open",
      title: "Open File",
      arguments: [this.resourceUri],
    };
  }
}

export class CodeSwingDirectoryNode extends TreeItem {
  constructor(public swingUri: Uri, public directory: string) {
    super(path.basename(directory), TreeItemCollapsibleState.Collapsed);

    this.iconPath = ThemeIcon.Folder;
    this.resourceUri = Uri.joinPath(swingUri, directory);
    this.contextValue = "swing.directory";
  }
}
