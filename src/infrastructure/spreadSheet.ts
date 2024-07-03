import { Filter } from "../domain/filter";
import { Label } from "../domain/label";

const SpreadSheet = SpreadsheetApp.getActiveSpreadsheet();

const FilterSheetName = "Filter";
export const FilterSheet =
  SpreadSheet.getSheetByName(FilterSheetName) ||
  SpreadSheet.insertSheet(FilterSheetName);

export enum FilterColumns {
  From = 1,
  Label = 2,
  SuggestedAt = 3,
}

const MinFilterColumns = Math.min(
  FilterColumns.From,
  FilterColumns.Label,
  FilterColumns.SuggestedAt,
);

const MaxFilterColumns = Math.max(
  FilterColumns.From,
  FilterColumns.Label,
  FilterColumns.SuggestedAt,
);

export function GetFilters(): Filter[] {
  const data = FilterSheet.getDataRange()
    .getValues()
    .slice(1 /* skip header */) as (string | undefined)[][];

  return data
    .filter(
      (row) =>
        (row[FilterColumns.From - 1] ?? "") != "" ||
        (row[FilterColumns.Label - 1] ?? "") != "",
    )
    .map(
      (row) =>
        new Filter({
          from: row[FilterColumns.From - 1] ?? "",
          label: new Label({ name: row[FilterColumns.Label - 1] ?? "" }),
        }),
    );
}

export function AppendFilter(filter: Filter, SuggestedAt?: Date) {
  const row = Array(MaxFilterColumns);
  row[FilterColumns.From - 1] = filter.from;
  row[FilterColumns.Label - 1] = filter.label.name;
  row[FilterColumns.SuggestedAt - 1] = SuggestedAt ?? "";
  FilterSheet.appendRow(row);
}

export function RestyleFilterSheet() {
  const headerRange = FilterSheet.getRange(
    1,
    MinFilterColumns,
    1,
    MaxFilterColumns,
  );
  headerRange.setValues([["From", "Label", "SuggestedAt"]]);
  headerRange.setBackgroundRGB(0xdd, 0xee, 0xdd);
  headerRange.getFilter()?.remove();
  headerRange.createFilter();

  const dataRange = FilterSheet.getRange(
    2,
    MinFilterColumns,
    FilterSheet.getLastRow(),
    MaxFilterColumns,
  );
  dataRange.sort(FilterColumns.SuggestedAt);
  dataRange.sort(FilterColumns.Label);
  dataRange.sort(FilterColumns.From);

  FilterSheet.autoResizeColumns(MinFilterColumns, MaxFilterColumns);
}

const SettingSheetName = "Setting";
export const SettingSheet =
  SpreadSheet.getSheetByName(SettingSheetName) ||
  SpreadSheet.insertSheet(SettingSheetName);

export const SettingSheetRange = {
  OPENAI_API_KEY: SettingSheet.getRange("B3"),
};

export function InitSettingSheet() {
  SettingSheet.getRange("B2:B3").setBorder(true, true, true, true, true, true);

  const OPENAI_API_KEY_HEADER = SettingSheet.getRange("B2");
  OPENAI_API_KEY_HEADER.setBackgroundRGB(0xdd, 0xee, 0xdd);
  OPENAI_API_KEY_HEADER.setValue("OpenAI API Key");

  SettingSheet.setColumnWidths(1, SettingSheet.getMaxColumns(), 25);
  SettingSheet.autoResizeColumns(1, SettingSheet.getMaxColumns());
}

// const LogSheetName = "Log";
// export const LogSheet =
//   SpreadSheet.getSheetByName(LogSheetName) ||
//   SpreadSheet.insertSheet(LogSheetName);

// export function Log(message: string) {
//   LogSheet.appendRow([new Date(), message]);
// }
