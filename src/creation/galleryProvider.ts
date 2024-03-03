import axios from "axios";
import * as vscode from "vscode";
import * as config from "../config";
import { EXTENSION_NAME } from "../constants";
import { SwingFile } from "../store";

interface Gallery {
  id: string;
  url: string;
  enabled: boolean;
  templates: GalleryTemplate[];
  title: string;
  description?: string;
}

interface GalleryTemplate {
  title: string;
  description?: string;
  files: SwingFile[];
}

const CONTRIBUTION_NAME = `${EXTENSION_NAME}.templateGalleries`;

let loadGalleriesRunning = false;
let loadGalleriesPromise: Promise<Gallery[]> = Promise.resolve([]);

export async function loadGalleries() {
  if (loadGalleriesRunning) {
    return loadGalleriesPromise;
  }

  loadGalleriesPromise = new Promise(async (resolve) => {
    loadGalleriesRunning = true;

    const registrations = vscode.extensions.all
      .flatMap((e) => {
        return e.packageJSON.contributes &&
          e.packageJSON.contributes[CONTRIBUTION_NAME]
          ? e.packageJSON.contributes[CONTRIBUTION_NAME]
          : [];
      })
      .concat(
        Array.from(templateProviders.entries()).map(
          ([name, [provider, options]]) => {
            return {
              id: name,
              title: options.title || name,
              description: options.description,
              provider,
              enabled: true,
            };
          }
        )
      );

    const settingContributions = await config.get("templateGalleries");

    for (const gallery of settingContributions) {
      const registration = registrations.find(
        (registration) => registration.id === gallery
      );
      if (registration) {
        registration.enabled = true;
      } else if (gallery.startsWith("https://")) {
        registrations.push({
          id: gallery,
          url: gallery,
          enabled: true,
          description: "",
        });
      }
    }

    for (const registration of registrations) {
      if (!settingContributions.includes(registration.id)) {
        registration.enabled = false;
      }
    }

    const galleries = await Promise.all(
      registrations.map(async (gallery) => {
        if (gallery.url) {
          const { data } = await axios.get(gallery.url);

          gallery.title = data.title;
          gallery.description = data.description;
          gallery.templates = data.templates.map(
            (template: GalleryTemplate) => ({
              ...template,
              title: `${data.title}: ${template.title}`,
            })
          );
        } else if (gallery.provider) {
          const templates = await gallery.provider.provideTemplates();
          gallery.templates = templates.map((template: GalleryTemplate) => ({
            ...template,
            title: `${gallery.title}: ${template.title}`,
          }));
        }

        return gallery;
      })
    );

    loadGalleriesRunning = false;
    resolve(galleries);
  });

  return loadGalleriesPromise;
}

export async function enableGalleries(galleryIds: string[]) {
  await config.set("templateGalleries", galleryIds);
  return loadGalleries();
}

interface CodeSwingTemplateProvider {
  provideTemplates(): Promise<GalleryTemplate>;
  onDidChangeTemplates(listener: () => void): vscode.Disposable;
}

interface CodeSwingTemplateProviderOptions {
  title?: string;
  description?: string;
}

const templateProviders = new Map<
  string,
  [CodeSwingTemplateProvider, CodeSwingTemplateProviderOptions]
>();
export function registerTemplateProvider(
  providerName: string,
  provider: CodeSwingTemplateProvider,
  options: CodeSwingTemplateProviderOptions
) {
  templateProviders.set(providerName, [provider, options]);
  provider.onDidChangeTemplates(loadGalleries);

  loadGalleries();
}

vscode.extensions.onDidChange(loadGalleries);
vscode.workspace.onDidChangeConfiguration((e) => {
  if (e.affectsConfiguration(CONTRIBUTION_NAME)) {
    loadGalleries();
  }
});

loadGalleries();
