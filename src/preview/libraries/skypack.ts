import axios from "axios";

export function getModuleUrl(moduleName: string) {
  return `https://cdn.skypack.dev/${moduleName}`;
}

export async function hasDefaultExport(moduleName: string) {
  const moduleUrl = getModuleUrl(moduleName);
  const { data } = await axios.get(`${moduleUrl}?meta`);
  return data.packageExports?.["."]?.hasDefaultExport || false;
}

const IMPORT_PATTERN = /(import\s.+\sfrom\s)(["'])(?!\.\/|http)(.+)\2/gi;
const IMPORT_SUBSTITION = `$1$2https://esm.sh/$3$2`;
export function processImports(code: string) {
  return code
    .replace(IMPORT_PATTERN, IMPORT_SUBSTITION)
    .replace(/\.\/(\S+)\.(svelte|vue|jsx|tsx|json|css)/g, "./$1.js?type=$2");
}
