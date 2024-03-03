import { observable } from "mobx";
import * as vscode from "vscode";
import { SwingWebView } from "./preview/webview";

export type ScriptType = "text/javascript" | "module";
export type ReadmeBehavior =
  | "none"
  | "inputComment"
  | "previewHeader"
  | "previewFooter";

export interface SwingInput {
  fileName?: string;
  prompt?: string;
  completionMessage?: string;
}

export interface SwingManifest {
  scripts?: string[];
  styles?: string[];
  layout?: string;
  showConsole?: boolean;
  template?: boolean;
  scriptType?: ScriptType;
  readmeBehavior?: ReadmeBehavior;
  tutorial?: string;
  input?: SwingInput;
  themePreview?: boolean;
}

export enum SwingLibraryType {
  script = "scripts",
  style = "styles",
}

export enum SwingFileType {
  config,
  markup,
  script,
  stylesheet,
  manifest,
  readme,
  tour,
}

export interface SwingFile {
  filename: string;
  content?: string;
}

export interface Version {
  prompt: string;
  files: SwingFile[];
}

interface ActiveSwing {
  rootUri: vscode.Uri;
  currentUri: vscode.Uri;

  hasTour: boolean;

  webView: SwingWebView;
  webViewPanel: vscode.WebviewPanel;
  console: vscode.OutputChannel;
  commentController?: vscode.CommentController;

  scriptEditor?: vscode.TextEditor;
}

export interface Store {
  globalStorageUri?: vscode.Uri;
  activeSwing?: ActiveSwing;
  history?: Version[];
}

export const store: Store = observable({});
