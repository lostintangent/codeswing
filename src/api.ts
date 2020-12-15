import * as path from "path";
import { PLAYGROUND_FILE } from "./constants";
import { getCandidateMarkupFilenames } from "./preview/languages/markup";

export const api = {
  isPlayground(files: string[]) {
    return (
      files.includes(".block") ||
      files.includes(PLAYGROUND_FILE) ||
      files.some((file) => getCandidateMarkupFilenames().includes(file)) ||
      files.includes("scripts") ||
      (files.includes("script.js") &&
        files.some((file) => path.extname(file) === ".markdown"))
    );
  },
};
