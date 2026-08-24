//first function *converts* a property into a networked format
//second function *reverts* a networked format into a property

export const int = [
  (val: number): number => val | 0,
  (val: number): number => val,
] as const;

export const bool = [
  (val: boolean): number => (val ? 1 : 0),
  (val: number): boolean => !!+val,
] as const;

export const sfloat = [
  (val: number): number => (val * 10) | 0,
  (val: number): number => val / 10,
] as const;

export const string = [
  (val: string): string => val.toString(),
  (val: string): string => val,
] as const;

export function any<T = any>() {
  return [(val: T): T => val, (val: T): T => val] as const;
}

export const enumerated = <const V extends readonly unknown[]>(
  allowedValues: V
): [(value: V[number]) => number, (index: number) => V[number]] => {
  return [
    (value: V[number]): number => {
      const index = allowedValues.indexOf(value);
      return index;
    },
    (index: number): V[number] => {
      return allowedValues[index];
    },
  ] as const;
};

export const array = <
  T extends readonly [(arg: any) => any, (arg: any) => any]
>(
  type: T
): [
  (val: Array<Parameters<T[0]>[0]>) => Array<ReturnType<T[0]>>,
  (val: Array<Parameters<T[1]>[0]>) => Array<ReturnType<T[1]>>
] => {
  return [
    (val) => {
      const r = [];

      for (let i = 0, n = val.length; i < n; ++i) {
        r.push(type[0](val[i]));
      }

      return r;
    },
    (val) => {
      const r = [];

      for (let i = 0, n = val.length; i < n; ++i) {
        r.push(type[1](val[i]));
      }

      return r;
    },
  ];
};

//dont ask me wtf is this (author - deepseek)

type Networkable<T = any> = readonly [(arg: T) => any, (arg: any) => T];

export function tuple<
  T extends Networkable[],
  R extends Networkable | undefined = undefined
>(
  types: [...T],
  rest?: R
): [
  (
    val: [
      ...{ [K in keyof T]: Parameters<T[K][0]>[0] },
      ...(R extends Networkable ? Parameters<R[0]>[0][] : [])
    ]
  ) => [
    ...{ [K in keyof T]: ReturnType<T[K][0]> },
    ...(R extends Networkable ? ReturnType<R[0]>[] : [])
  ],
  (
    val: [
      ...{ [K in keyof T]: Parameters<T[K][1]>[0] },
      ...(R extends Networkable ? Parameters<R[1]>[0][] : [])
    ]
  ) => [
    ...{ [K in keyof T]: ReturnType<T[K][1]> },
    ...(R extends Networkable ? ReturnType<R[1]>[] : [])
  ]
] {
  return [
    (val) =>
      [
        ...val.slice(0, types.length).map((v, i) => types[i][0](v)),
        ...(rest ? val.slice(types.length).map((v) => rest[0](v)) : []),
      ] as any,
    (val) =>
      [
        ...val.slice(0, types.length).map((v, i) => types[i][1](v)),
        ...(rest ? val.slice(types.length).map((v) => rest[1](v)) : []),
      ] as any,
  ];
}
