import * as vscode from "vscode";

const CONFIG_SECTION = "playground";

export function get(key: "autoRun"): "onEdit" | "onSave" | "never";
export function get(key: "autoSave"): boolean;
export function get(
  key: "layout"
): "grid" | "splitLeft" | "splitRight" | "splitTop";
export function get(key: "includeMarkup"): boolean;
export function get(key: "includeScript"): boolean;
export function get(key: "includeStylesheet"): boolean;
export function get(key: "markupLanguage"): "html" | "pug";
export function get(
  key: "readmeBehavior"
): "none" | "previewFooter" | "previewHeader";
export function get(
  key: "scriptLanguage"
): "javascript" | "javascriptreact" | "typescript" | "typescriptreact";
export function get(
  key: "stylesheetLanguage"
): "css" | "less" | "sass" | "scss";
export function get(key: "showConsole"): boolean;
export function get(key: "templateGalleries"): string[];
export function get(key: any) {
  const extensionConfig = vscode.workspace.getConfiguration(CONFIG_SECTION);
  return extensionConfig.get(key);
}

export async function set(key: string, value: any) {
  const extensionConfig = vscode.workspace.getConfiguration(CONFIG_SECTION);
  return extensionConfig.update(key, value, true);
}
