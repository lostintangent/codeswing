import * as vscode from "vscode";
import { PlaygroundWebview } from "./preview/webview";

export type ScriptType = "text/javascript" | "module";
export type ReadmeBehavior =
  | "none"
  | "inputComment"
  | "previewHeader"
  | "previewFooter";

export interface PlaygroundInput {
  fileName?: string;
  prompt?: string;
  completionMessage?: string;
}

export interface PlaygroundManifest {
  scripts?: string[];
  styles?: string[];
  layout?: string;
  showConsole?: boolean;
  template?: boolean;
  scriptType?: ScriptType;
  readmeBehavior?: ReadmeBehavior;
  tutorial?: string;
  input?: PlaygroundInput;
}

export enum PlaygroundLibraryType {
  script = "scripts",
  style = "styles",
}

export enum PlaygroundFileType {
  config,
  markup,
  script,
  stylesheet,
  manifest,
  readme,
  tour,
}

interface ActivePlayground {
  uri: vscode.Uri;
  hasTour: boolean;

  webView: PlaygroundWebview;
  webViewPanel: vscode.WebviewPanel;
  console: vscode.OutputChannel;
  commentController?: vscode.CommentController;
}

export interface Store {
  activePlayground?: ActivePlayground;
}

export const store: Store = {};
