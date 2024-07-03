import { Filter } from "../domain/filter";
import { Label } from "../domain/label";
import { OpenAIClient } from "../infrastructure/chatgpt";
import { FilterRepository } from "../infrastructure/filter.repository";
import { SettingSheetRange } from "../infrastructure/spreadSheet";
import { UnlabeldeDomainRepository } from "../infrastructure/unlabeldeDomain.repository";
import { UniqueArray } from "../util/array";

export async function ReflectUnlabeled() {
  try {
    await reflectUnlabeled();
  } catch (error) {
    Logger.log(`Error: ${error}`);
    throw error;
  }
}

async function reflectUnlabeled() {
  if (SettingSheetRange.OPENAI_API_KEY.getValue() === "") {
    Logger.log(
      `API Key is not registered. Please register it in the setting sheet.`
    );
    return;
  }

  // get unlabelde domains from gmail
  const unlabeldeDomainRepository = new UnlabeldeDomainRepository();
  const unlabeldeDomains = unlabeldeDomainRepository.findUnlabeldeDomains();
  if (unlabeldeDomains.length === 0) {
    Logger.log(`unlabeldeDomains is empty.`);
    return;
  }
  Logger.log(`unlabeldeDomains: ${unlabeldeDomains.length} domains.`);

  // get registered labels from sheet
  const filterRepository = new FilterRepository();
  const filters = filterRepository.findAllFromSheet();
  const labels = UniqueArray(
    filters.flatMap((filter) => filter.label),
    (a, b) => a.name === b.name
  );
  const registeredDomains = UniqueArray(
    filters.map((filter) => filter.from),
    (a, b) => a === b
  );

  // get target domains by unlabeldeDomains - registeredDomains
  const targetDomains = unlabeldeDomains.filter(
    (domain) => !registeredDomains.includes(domain.domain)
  );
  if (targetDomains.length === 0) {
    Logger.log(`targetDomains is empty.`);
    return;
  }
  Logger.log(`targetDomains: ${targetDomains.length} domains.`);

  // determine label by OpenAI
  const openAIClient = new OpenAIClient(
    SettingSheetRange.OPENAI_API_KEY.getValue()
  );
  const response = await openAIClient.determineLabel(targetDomains, labels);
  response.list.forEach((item) =>
    Logger.log(
      `determined: ${item.domain} -> ${item.mainCategory}/${item.subCategory}/${item.serviceName}`
    )
  );

  // add to sheet
  filterRepository.appendToSheet(
    response.list.map(
      (item) =>
        new Filter({
          from: item.domain,
          label: new Label({
            name: `${item.mainCategory}/${item.subCategory}/${item.serviceName}`,
          }),
        })
    ),
    true
  );
}
