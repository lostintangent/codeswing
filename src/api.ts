import * as path from "path";
import { SWING_FILE } from "./constants";
import { getCandidateMarkupFilenames } from "./preview/languages/markup";

export const api = {
  isSwing(files: string[]) {
    return (
      files.includes(".block") ||
      files.includes(SWING_FILE) ||
      files.some((file) => getCandidateMarkupFilenames().includes(file)) ||
      files.includes("scripts") ||
      (files.includes("script.js") &&
        files.some((file) => path.extname(file) === ".markdown"))
    );
  },
};
