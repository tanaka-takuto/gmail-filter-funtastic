import { Filter } from "../domain/filter";
import { Label } from "../domain/label";
import { FilterRepository } from "../infrastructure/filter.repository";
import { LabelRepository } from "../infrastructure/label.repository";
import { UniqueArray } from "../util/array";

export function Sync() {
  try {
    const response = collectSyncTargets();
    sync(response);
  } catch (error) {
    Logger.log(`Error: ${error}`);
    throw error;
  }
}

type collectSyncTargetsResponse = {
  addLabels: Label[];
  removeLabels: Label[];
  addFilters: Filter[];
  removeFilters: Filter[];
};

function collectSyncTargets(): collectSyncTargetsResponse {
  const labelRepository = new LabelRepository();
  const filterRepository = new FilterRepository();

  const sheetFilters = UniqueArray(
    filterRepository.findAllFromSheet().flatMap((filter) => {
      const labels = filter.label.relationRabels();
      return labels.map((label) => new Filter({ from: filter.from, label }));
    }),
    (a, b) => a.from === b.from && a.label.name === b.label.name
  );
  const sheetLabels = UniqueArray(
    Filter.allLabels(sheetFilters).flatMap((label) => label.relationRabels()),
    (a, b) => a.name === b.name
  );
  const gmailFilters = filterRepository.findAllFromGmail();
  const gmailLabels = labelRepository.findAllFromGmail();

  const addLabels = UniqueArray(
    sheetLabels.filter(
      (sheetLabel) =>
        !gmailLabels.find((gmailLabel) => gmailLabel.name === sheetLabel.name)
    ),
    (a, b) => a.name === b.name
  );
  if (addLabels.length > 0) {
    Logger.log(
      `create label: ${addLabels.length} labels. ${JSON.stringify(addLabels)}`
    );
  } else {
    Logger.log("no label to create");
  }

  const removeLabels = UniqueArray(
    gmailLabels.filter(
      (gmailLabel) =>
        !sheetLabels.find((sheetLabel) => sheetLabel.name === gmailLabel.name)
    ),
    (a, b) => a.name === b.name
  );
  if (removeLabels.length > 0) {
    Logger.log(
      `remove label: ${removeLabels.length} labels. ${JSON.stringify(removeLabels)}`
    );
  } else {
    Logger.log("no label to remove");
  }

  const addFilters = sheetFilters.filter(
    (sheetFilter) =>
      !gmailFilters.find(
        (gmailFilter) =>
          gmailFilter.from === sheetFilter.from &&
          gmailFilter.label.name === sheetFilter.label.name
      )
  );
  if (addFilters.length > 0) {
    Logger.log(
      `create filter: ${addFilters.length} filters. ${JSON.stringify(addFilters)}`
    );
  } else {
    Logger.log("no filter to create");
  }

  const removeFilters = gmailFilters.filter(
    (gmailFilter) =>
      !sheetFilters.find(
        (sheetFilter) =>
          gmailFilter.from === sheetFilter.from &&
          gmailFilter.label.name === sheetFilter.label.name
      )
  );
  if (removeFilters.length > 0) {
    Logger.log(
      `remove filter: ${removeFilters.length} filters. ${JSON.stringify(removeFilters)}`
    );
  } else {
    Logger.log("no filter to remove");
  }

  return {
    addLabels,
    removeLabels,
    addFilters,
    removeFilters,
  };
}

function sync(props: {
  addLabels: Label[];
  removeLabels: Label[];
  addFilters: Filter[];
  removeFilters: Filter[];
}): void {
  const labelRepository = new LabelRepository();
  const filterRepository = new FilterRepository();
  labelRepository.saveAllToGmail(props.addLabels);
  filterRepository.saveAllToGmail(
    props.addFilters,
    labelRepository.fetchFromGmail()
  );
  filterRepository.removeAllFromGmail(props.removeFilters);
  labelRepository.removeAllFromGmail(props.removeLabels);

  filterRepository.appendToSheet(props.addFilters);
}
