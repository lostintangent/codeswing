export const README_BASE_NAME = "README";
export const README_EXTENSIONS = [".md", ".markdown"];

export function getReadmeContent(readme: string): string | null {
  if (readme.trim() === "") {
    return readme;
  }

  try {
    const markdown = require("markdown-it")();
    return markdown.render(readme);
  } catch {
    return null;
  }
}
