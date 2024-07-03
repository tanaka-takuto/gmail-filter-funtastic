import { Init } from "./usecase/init";
import { ReflectUnlabeled } from "./usecase/reflectUnlabeled";
import { Sync } from "./usecase/sync";

export function init() {
  Init();
}

export function sync() {
  Sync();
}

export function reflectUnlabeled() {
  ReflectUnlabeled();
}
