import { FilterRepository } from "../infrastructure/filter.repository";
import { InitSettingSheet } from "../infrastructure/spreadSheet";

export function Init() {
  try {
    new FilterRepository().resetSheet();
    InitSettingSheet();
  } catch (error) {
    Logger.log(`Error: ${error}`);
    throw error;
  }
}
