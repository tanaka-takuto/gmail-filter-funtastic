import { UniqueArray } from "../util/array";
import { Label } from "./label";

export class Filter {
  readonly id?: string;
  readonly from: string;
  readonly label: Label;

  constructor(props: { id?: string; from: string; label: Label }) {
    this.id = props.id;
    this.from = props.from;
    this.label = props.label;
  }

  static allLabels(filters: Filter[]): Label[] {
    return UniqueArray(
      filters.map((filter) => filter.label),
      (a, b) => a.name === b.name,
    );
  }
}
