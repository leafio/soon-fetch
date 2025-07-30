export type SoonOptions = Omit<RequestInit, "body"> & {
  body?: RequestInit["body"] | object
  query?:
    | Record<string, string | number | boolean | null | undefined | (string | number | boolean | null | undefined)[]>
    | URLSearchParams
  params?: Record<string, string | number>
  timeout?: number

  aborts?: AbortController[] | never[]
  share?: boolean
  staleTime?: number
}

export type GetUrlKey<Url> = Url extends `${string}/:${infer Key}/${infer Right}`
  ? `${Key}` | GetUrlKey<`/${Right}`>
  : Url extends `${string}/:${infer Key}`
    ? `${Key}`
    : never

export type OptionParams<Args> =
  NonNullable<Args> extends never
    ? []
    : keyof NonNullable<Args> extends never
      ? []
      : Exclude<Args, NonNullable<Args>> extends never
        ? [params: Args]
        : [params?: Args]

export type OptionQuery<Args> =
  NonNullable<Args> extends never
    ? []
    : keyof NonNullable<Args> extends never
      ? []
      : Exclude<Args, NonNullable<Args>> extends never
        ? Partial<Args> extends Args
          ? [query?: Args]
          : [query: Args]
        : [query?: Args]

export type OptionBody<Args> =
  NonNullable<Args> extends never ? [] : Exclude<Args, NonNullable<Args>> extends never ? [body: Args] : [body?: Args]

export type Tuple2Union<T> = T extends readonly [infer T1, infer T2, ...infer R]
  ? T1 | T2 | Tuple2Union<R>
  : T extends [infer T_Only]
    ? T_Only
    : never
