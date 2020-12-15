import axios from "axios";

const LIBRARIES_URL = "https://api.cdnjs.com/libraries";

export interface ICDNJSLibrary {
  name: string;
  description: string;
  latest: string;
}

export interface ICDNJSLibraryVersion {
  version: string;
  files: string[];
}

export interface ICDNJSLibraryManifest {
  name: string;
  description: string;
  filename: string;
  assets: ICDNJSLibraryVersion[];
}

let libraries: ICDNJSLibrary[] | undefined;

async function getLibrariesInternal(): Promise<ICDNJSLibrary[]> {
  try {
    const librariesResponse = await axios.get<{ results: ICDNJSLibrary[] }>(
      `${LIBRARIES_URL}?fields=description`,
      {
        responseType: "json",
      }
    );

    libraries = librariesResponse.data.results;

    return libraries;
  } catch (e) {
    throw new Error("Cannot get the libraries.");
  }
}

let currentGetLibrariesPromise: Promise<ICDNJSLibrary[]> | undefined;
export async function getCDNJSLibraries() {
  if (libraries) {
    return libraries;
  }

  if (currentGetLibrariesPromise) {
    return await currentGetLibrariesPromise;
  }

  currentGetLibrariesPromise = getLibrariesInternal();
  return await currentGetLibrariesPromise;
}

export async function getLibraryVersions(libraryName: string) {
  try {
    const libraries = await axios.get<ICDNJSLibraryManifest>(
      `${LIBRARIES_URL}/${libraryName}`,
      {
        responseType: "json",
      }
    );

    const packageManifest = libraries.data;
    return [
      {
        version: "latest",
        files: [packageManifest.filename],
      },
      ...packageManifest.assets,
    ];
  } catch {
    return [];
  }
}
