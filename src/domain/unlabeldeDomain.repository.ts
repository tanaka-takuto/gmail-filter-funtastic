import { UnlabeldeDomain } from "./unlabeldeDomain";

export interface IUnlabeldeDomainRepository {
  findUnlabeldeDomains(): UnlabeldeDomain[];
}
