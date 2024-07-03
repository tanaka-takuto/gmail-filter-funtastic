import { Label } from "./label";

export interface ILabelRepository {
  findAllFromGmail(): Label[];
  saveAllToGmail(labels: Label[]): void;
  removeAllFromGmail(labels: Label[]): void;
}
