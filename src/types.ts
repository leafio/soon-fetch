export type SoonOptions = RequestInit & {
  query?:
    | Record<
        string,
        | string
        | number
        | boolean
        | null
        | undefined
        | (string | number | boolean | null | undefined)[]
      >
    | URLSearchParams;
  params?: Record<string, string | number>;
  timeout?: number;
};

export type GetUrlKey<Url> =
  Url extends `${string}/:${infer Key}/${infer Right}`
    ? `${Key}` | GetUrlKey<`/${Right}`>
    : Url extends `${string}/:${infer Key}`
    ? `${Key}`
    : never;

export type OptionParams<Args> = NonNullable<Args> extends never
  ? []
  : keyof NonNullable<Args> extends never
  ? []
  : Exclude<Args, NonNullable<Args>> extends never
  ? [params: Args]
  : [params?: Args];

export type OptionQuery<Args> = NonNullable<Args> extends never
  ? []
  : keyof NonNullable<Args> extends never
  ? []
  : Exclude<Args, NonNullable<Args>> extends never
  ? Partial<Args> extends Args
    ? [query?: Args]
    : [query: Args]
  : [query?: Args];

export type OptionBody<Args> = NonNullable<Args> extends never
  ? []
  : Exclude<Args, NonNullable<Args>> extends never
  ? [body: Args]
  : [body?: Args];

export type Tuple2Union<T> = T extends [infer T1, infer T2, ...infer R]
  ? T1 | T2 | Tuple2Union<R>
  : T extends [infer T_Only]?T_Only:never



//test
// type x = OptionBody<{ id: string }>;
// type x2 = OptionBody<{ id?: string }>;
// type x3 = OptionBody<{ id: string } | undefined>;

// type y = OptionBody<string>;
// type y1 = OptionBody<string | undefined>;

// type zz = OptionBody<undefined>;
// type zz2 = OptionBody<{}>;

// type yy = NonNullable<undefined>;


// function unknownFunction<T>(arg: T): T {
//   return arg;
// }
 
// type UnknownFunctionReturnType = ReturnType<typeof unknownFunction<string>>;
// 这将把UnknownFunctionReturnType设置为unknownFunction的返回类型，即类型T。