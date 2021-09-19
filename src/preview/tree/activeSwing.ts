import { reaction } from "mobx";
import {
  Disposable,
  Event,
  EventEmitter,
  FileType,
  ProviderResult,
  TreeDataProvider,
  TreeItem,
  Uri,
  window,
  workspace,
} from "vscode";
import { EXTENSION_NAME } from "../../constants";
import { store } from "../../store";
import { CodeSwingDirectoryNode, CodeSwingFileNode } from "./nodes";

async function getSwingFiles(subDirectory?: string) {
  const swingUri = store.activeSwing!.rootUri;
  const directory = subDirectory ? `${subDirectory}/` : "";
  const files = await workspace.fs.readDirectory(
    Uri.joinPath(swingUri, directory)
  );

  return files
    .sort(([_, typeA], [__, typeB]) => typeB - typeA)
    .map(([file, fileType]) => {
      const filePath = `${directory}${file}`;
      return fileType === FileType.Directory
        ? new CodeSwingDirectoryNode(swingUri, filePath)
        : new CodeSwingFileNode(swingUri, filePath);
    });
}

class ActiveSwingTreeProvider
  implements TreeDataProvider<TreeItem>, Disposable {
  private _disposables: Disposable[] = [];

  private _onDidChangeTreeData = new EventEmitter<void>();
  public readonly onDidChangeTreeData: Event<void> = this._onDidChangeTreeData
    .event;

  constructor() {
    reaction(() => [store.activeSwing], this.refreshTree.bind(this));
  }

  getTreeItem = (node: TreeItem) => node;

  getChildren(element?: TreeItem): ProviderResult<TreeItem[]> {
    if (!element) {
      if (!store.activeSwing) {
        return undefined;
      }

      return getSwingFiles();
    } else if (element instanceof CodeSwingDirectoryNode) {
      return getSwingFiles(element.directory);
    }
  }

  dispose() {
    this._disposables.forEach((disposable) => disposable.dispose());
  }

  refreshTree() {
    this._onDidChangeTreeData.fire();
  }
}

let treeDataProvider: ActiveSwingTreeProvider;
export function refreshTreeView() {
  treeDataProvider.refreshTree();
}

export function registerTreeProvider() {
  treeDataProvider = new ActiveSwingTreeProvider();
  window.createTreeView(`${EXTENSION_NAME}.activeSwing`, {
    showCollapseAll: true,
    treeDataProvider,
    canSelectMany: true,
  });
}
