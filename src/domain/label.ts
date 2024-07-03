export class Label {
  readonly id?: string;
  readonly name: string;

  constructor(props: { id?: string; name: string }) {
    this.id = props.id;
    this.name = props.name;
  }

  relationRabels(): Label[] {
    const names = this.name.split("/");
    const labels = names.map(
      (_, index) => new Label({ name: names.slice(0, index + 1).join("/") }),
    );

    return labels;
  }
}
