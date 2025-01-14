type SoonOptions = RequestInit & {
    query?: Record<string, string | number | boolean | null | undefined | (string | number | boolean | null | undefined)[]> | URLSearchParams;
    params?: Record<string, string | number>;
    timeout?: number;
};
type GetUrlKey<Url> = Url extends `${string}/:${infer Key}/${infer Right}` ? `${Key}` | GetUrlKey<`/${Right}`> : Url extends `${string}/:${infer Key}` ? `${Key}` : never;
type OptionParams<Args> = NonNullable<Args> extends never ? [] : keyof NonNullable<Args> extends never ? [] : Exclude<Args, NonNullable<Args>> extends never ? [params: Args] : [params?: Args];
type OptionQuery<Args> = NonNullable<Args> extends never ? [] : keyof NonNullable<Args> extends never ? [] : Exclude<Args, NonNullable<Args>> extends never ? Partial<Args> extends Args ? [query?: Args] : [query: Args] : [query?: Args];
type OptionBody<Args> = NonNullable<Args> extends never ? [] : Exclude<Args, NonNullable<Args>> extends never ? [body: Args] : [body?: Args];
type Tuple2Union<T> = T extends [infer T1, infer T2, ...infer R] ? T1 | T2 | Tuple2Union<R> : T extends [infer T_Only] ? T_Only : never;

declare const mergeUrl: (url: string, config: {
    query?: Record<string, string | number | boolean | null | undefined | (string | number | boolean | null | undefined)[]> | URLSearchParams;
    params?: Record<string, string | number>;
    baseURL?: string;
}) => string;
declare const mergeHeaders: (...headersList: (HeadersInit | undefined)[]) => Headers;
declare function mergeSignals(signals?: (AbortSignal | null | undefined)[], timeout?: number): AbortSignal | undefined;
declare function isBodyJson(body: any): boolean;
declare function parseUrlOptions<Options extends SoonOptions>(urlOptions: {
    url: string;
    options?: Options;
    baseURL?: string;
    baseOptions?: Options;
}): readonly [string, Options & {
    headers: Headers;
}];
declare function createSoon<T extends (url: string, options?: SoonOptions) => Promise<any>>(requestFun: T): {
    options: T;
    get: T;
    post: T;
    put: T;
    delete: T;
    patch: T;
    head: T;
    request: T;
    API: <Url extends string>(url: Url, options?: Parameters<T>[1] | undefined) => Record<"GET", <Req = undefined, Res = Awaited<ReturnType<T>>>() => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionQuery<Req>]) => Promise<Res>> & Record<"POST" | "PATCH" | "DELETE" | "PUT", <Req = undefined, Res = Awaited<ReturnType<T>>>() => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionBody<Req>]) => Promise<Res>>;
};
declare function createShortMethods<Methods extends string[], RequestFun extends <T>(url: string, options?: {
    method?: string;
}) => Promise<any>>(methods: Methods, requestFun: RequestFun): Record<Tuple2Union<Methods>, typeof requestFun>;
declare function createShortAPI<requestFun extends <T>(url: string, options?: SoonOptions) => Promise<any>>(requestFun: requestFun): <Url extends string>(url: Url, options?: Parameters<requestFun>[1]) => Record<"GET", <Req = undefined, Res = Awaited<ReturnType<requestFun>>>() => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionQuery<Req>]) => Promise<Res>> & Record<"POST" | "PATCH" | "DELETE" | "PUT", <Req = undefined, Res = Awaited<ReturnType<requestFun>>>() => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionBody<Req>]) => Promise<Res>>;

export { type SoonOptions, createShortAPI, createShortMethods, createSoon, isBodyJson, mergeHeaders, mergeSignals, mergeUrl, parseUrlOptions };
