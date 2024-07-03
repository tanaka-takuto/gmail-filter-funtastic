import { Filter } from "../domain/filter";
import { IFilterRepository } from "../domain/filter.repository";
import { Label } from "../domain/label";
import { LabelRepository } from "./label.repository";
import { AppendFilter, GetFilters, RestyleFilterSheet } from "./spreadSheet";

export class FilterRepository implements IFilterRepository {
  private readonly labelRepository = new LabelRepository();
  private readonly filterApp = Gmail!.Users!.Settings!.Filters!;
  private readonly messageApp = Gmail!.Users!.Messages!;
  private cacheForGmail: Map<
    { from: string; label: string },
    GoogleAppsScript.Gmail.Schema.Filter
  > = new Map();

  fetchFromGmail(): Map<
    { from: string; label: string },
    GoogleAppsScript.Gmail.Schema.Filter
  > {
    return (this.filterApp.list("me")?.filter ?? []).reduce((map, filter) => {
      map.set(
        {
          from: filter.criteria?.from ?? "",
          label: filter.action?.addLabelIds?.[0] ?? "",
        },
        filter
      );
      return map;
    }, new Map<{ from: string; label: string }, GoogleAppsScript.Gmail.Schema.Filter>());
  }

  resetSheet(): void {
    RestyleFilterSheet();
    const filters = this.findAllFromGmail();
    filters.forEach((filter) => AppendFilter(filter));
  }

  appendToSheet(filters: Filter[], isSuggest: boolean = false): void {
    filters.forEach((filter) =>
      AppendFilter(filter, isSuggest ? new Date() : undefined)
    );
    RestyleFilterSheet();
  }

  findAllFromGmail(): Filter[] {
    if (this.cacheForGmail.size === 0) {
      this.cacheForGmail = this.fetchFromGmail();
    }

    const labels = this.labelRepository.findAllFromGmail();

    return Array.from(this.cacheForGmail.values()).map((filter) => {
      const label = labels.find(
        (label) => label.id === filter.action?.addLabelIds?.[0]
      );

      return new Filter({
        id: filter.id,
        from: filter.criteria?.from ?? "",
        label: label ?? new Label({ name: "" }),
      });
    });
  }

  findAllFromSheet(): Filter[] {
    return GetFilters();
  }

  saveAllToGmail(
    filters: Filter[],
    labelMap: Map<string, GoogleAppsScript.Gmail.Schema.Label>
  ): void {
    const newFilters = filters
      .filter(
        (filter) =>
          !this.cacheForGmail.has({
            from: filter.from,
            label: filter.label.name,
          })
      )
      .map(
        (filter) =>
          new Filter({
            from: filter.from,
            label: new Label({
              id: labelMap.get(filter.label.name)?.id ?? "",
              name: filter.label.name,
            }),
          })
      );

    newFilters.forEach((filter) => {
      Logger.log(`create filter: ${filter.from} -> ${filter.label.name}`);
      this.filterApp.create(
        {
          criteria: { from: filter.from },
          action: { addLabelIds: [filter.label.id ?? ""] },
        },
        "me"
      );

      const fetchMessage = (): GoogleAppsScript.Gmail.Schema.Message[] => {
        return (
          this.messageApp.list("me", {
            q: `from:${filter.from} -label:${filter.label.name}`,
            maxResults: 500,
          }).messages ?? []
        );
      };

      for (
        let messages = fetchMessage();
        messages.length > 0;
        messages = fetchMessage()
      ) {
        Logger.log(
          `batchModify: ${messages?.length} messages. (from: ${filter.from}, label: ${filter.label.name})`
        );
        this.messageApp.batchModify(
          {
            addLabelIds: [filter.label.id ?? ""],
            ids: messages?.map((message) => message.id ?? "") ?? [],
          },
          "me"
        );
      }
    });

    this.cacheForGmail = this.fetchFromGmail(); // キャッシュを更新
  }

  removeAllFromGmail(filters: Filter[]): void {
    filters.forEach((filter) => {
      Logger.log(`remove filter: ${filter.from} -> ${filter.label.name}`);
      this.filterApp.remove("me", filter?.id ?? "");
    });

    this.cacheForGmail = this.fetchFromGmail(); // キャッシュを更新
  }
}
