import axios from "axios";

const LIBRARIES_URL = "https://api.cdnjs.com/libraries";

export interface CdnJsLibrary {
  name: string;
  description: string;
  latest: string;
}

export interface CdnJsLibraryVersion {
  version: string;
  files: string[];
}

let libraries: CdnJsLibrary[] | undefined;
async function getLibrariesInternal(): Promise<CdnJsLibrary[]> {
  try {
    const response = await axios.get<{ results: CdnJsLibrary[] }>(
      `${LIBRARIES_URL}?fields=description`
    );

    libraries = response.data.results;
    return libraries;
  } catch {
    throw new Error("Cannot get the libraries.");
  }
}

let currentGetLibrariesPromise: Promise<CdnJsLibrary[]> | undefined;
export async function getCdnJsLibraries() {
  if (libraries) {
    return libraries;
  }

  if (currentGetLibrariesPromise) {
    return await currentGetLibrariesPromise;
  }

  currentGetLibrariesPromise = getLibrariesInternal();
  return await currentGetLibrariesPromise;
}

export async function getLibraryVersions(
  libraryName: string
): Promise<CdnJsLibraryVersion[]> {
  try {
    const {
      data: { assets },
    } = await axios.get(`${LIBRARIES_URL}/${libraryName}?fields=assets`);

    // The CDNJS API returns the versions
    // in ascending order, so we want to reverse it.
    return assets.reverse();
  } catch {
    return [];
  }
}

export async function searchPackages(searchString: string) {
  const librariesResponse = await axios.get<{ results: CdnJsLibrary[] }>(
    `${LIBRARIES_URL}?search=${searchString}`
  );

  return librariesResponse.data.results;
}
