import { UnlabeldeDomain } from "../domain/unlabeldeDomain";
import { IUnlabeldeDomainRepository } from "../domain/unlabeldeDomain.repository";
import { UniqueArray } from "../util/array";

export class UnlabeldeDomainRepository implements IUnlabeldeDomainRepository {
  private readonly messageApp = Gmail!.Users!.Messages!;

  findUnlabeldeDomains(): UnlabeldeDomain[] {
    const today = new Date();
    const before1month = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      today.getDate(),
    );
    const year = before1month.getFullYear();
    const month = before1month.getMonth() + 1;
    const day = before1month.getDate();
    const before1monthStr = `${year}/${month}/${day}`;

    const q = `has:nouserlabels after:${before1monthStr}`;
    const messages = this.messageApp.list("me", { q: q }).messages ?? [];

    const domains = messages.map((message) => {
      const messageDetail = GmailApp.getMessageById(message.id ?? "");
      const from = messageDetail.getFrom();
      const domain = (from.match(/(@[a-zA-Z0-9-.]+)/) ?? [""])[0];
      return domain;
    });

    return UniqueArray(domains, (a, b) => a === b).map(
      (domain) => new UnlabeldeDomain({ domain }),
    );
  }
}
