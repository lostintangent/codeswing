import { Uri } from "vscode";
import * as vsls from "vsls";
import { EXTENSION_NAME } from "../constants";
import { openSwing } from "../preview";
import initializeBaseService from "./service";

export async function initializeService(vslsApi: vsls.LiveShare) {
  const service = await vslsApi.getSharedService(EXTENSION_NAME);
  if (!service) return;

  const response = await service.request("getActiveSwing", []);
  if (response) {
    const uri = Uri.parse(response.uri);
    openSwing(uri);
  }

  initializeBaseService(vslsApi, vslsApi.session.peerNumber, service);
}
