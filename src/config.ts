import { workspace } from "vscode";
import { EXTENSION_NAME } from "./constants";

export function get(key: "autoRun"): "onEdit" | "onSave" | "never";
export function get(key: "autoSave"): boolean;
export function get(key: "clearConsoleOnRun"): boolean;
export function get(
  key: "layout"
): "grid" | "splitLeft" | "splitRight" | "splitTop";
export function get(key: "launchBehavior"): "newSwing" | "none" | "openSwing";
export function get(
  key: "readmeBehavior"
): "none" | "previewFooter" | "previewHeader";
export function get(key: "rootDirectory"): string;
export function get(key: "showConsole"): boolean;
export function get(key: "templateGalleries"): string[];
export function get(key: "themePreview"): boolean;
export function get(key: "ai.endpointUrl"): string;
export function get(key: "ai.model"): string;
export function get(key: any) {
  const extensionConfig = workspace.getConfiguration(EXTENSION_NAME);
  return extensionConfig.get(key);
}

export async function set(key: string, value: any) {
  const extensionConfig = workspace.getConfiguration(EXTENSION_NAME);
  return extensionConfig.update(key, value, true);
}
