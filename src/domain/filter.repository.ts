import { Filter } from "./filter";

export interface IFilterRepository {
  resetSheet(): void;
  appendToSheet(filters: Filter[]): void;
  findAllFromGmail(): Filter[];
  findAllFromSheet(): Filter[];
  saveAllToGmail(
    filters: Filter[],
    labelMap: Map<string, GoogleAppsScript.Gmail.Schema.Label>,
  ): void;
  removeAllFromGmail(filters: Filter[]): void;
}
