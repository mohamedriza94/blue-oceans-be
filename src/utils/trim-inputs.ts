type TrimmedInput<T> = T extends string
  ? string
  : T extends Array<infer U>
  ? Array<TrimmedInput<U>>
  : T extends object
  ? { [K in keyof T]: TrimmedInput<T[K]> }
  : T;

export const trimInputs = <T>(input: T): any => {
  if (typeof input === "string") {
    return input.trim() as TrimmedInput<T>;
  }

  if (Array.isArray(input)) {
    return input.map(trimInputs) as TrimmedInput<T>;
  }

  if (typeof input === "object" && input !== null) {
    return Object.entries(input).reduce((acc, [key, value]) => {
      (acc as any)[key] = trimInputs(value);
      return acc;
    }, {} as T) as TrimmedInput<T>;
  }

  return input;
};
