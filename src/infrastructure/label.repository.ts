import { Label } from "../domain/label";
import { ILabelRepository } from "../domain/label.repository";

export class LabelRepository implements ILabelRepository {
  private readonly labelApp = Gmail!.Users!.Labels!;
  private readonly customLabelRegex = /^Label_([0-9]+)$/;
  private cacheForGmail: Map<string, GoogleAppsScript.Gmail.Schema.Label> =
    new Map();

  fetchFromGmail(): Map<string, GoogleAppsScript.Gmail.Schema.Label> {
    return (this.labelApp.list("me").labels ?? [])
      .filter((label) => this.customLabelRegex.test(label.id ?? ""))
      .reduce((map, label) => {
        map.set(label.name ?? "", label);
        return map;
      }, new Map<string, GoogleAppsScript.Gmail.Schema.Label>());
  }

  findAllFromGmail(): Label[] {
    if (this.cacheForGmail.size === 0) {
      this.cacheForGmail = this.fetchFromGmail();
    }

    return Array.from(this.cacheForGmail.values()).map(
      (label) => new Label({ id: label.id, name: label.name ?? "" }),
    );
  }

  saveAllToGmail(labels: Label[]): void {
    const newLabels = labels.filter(
      (label) => !this.cacheForGmail.has(label.name),
    );

    newLabels.forEach((label) => {
      Logger.log(`create label: ${label.name}`);
      this.labelApp.create(
        {
          name: label.name,
          labelListVisibility: "labelShowIfUnread",
        },
        "me",
      );
    });

    this.cacheForGmail = this.fetchFromGmail(); // キャッシュ更新
  }

  removeAllFromGmail(labels: Label[]): void {
    const targetLabels = Array.from(this.cacheForGmail.values()).filter(
      (label) => labels.some((l) => l.name === label.name),
    );

    targetLabels.forEach((label) => {
      Logger.log(`remove label: ${label.name}, ${label.id}`);
      this.labelApp.remove("me", label.id ?? "");
    });

    this.cacheForGmail = this.fetchFromGmail(); // キャッシュ更新
  }
}
