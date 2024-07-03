export function UniqueArray<T>(
  array: T[],
  equal: (v1: T, v2: T) => boolean
): T[] {
  return array.reduce((arr, cur) => {
    if (!arr.find((v) => equal(v, cur))) {
      arr.push(cur);
    }
    return arr;
  }, [] as T[]);
}
