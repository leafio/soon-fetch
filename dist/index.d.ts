type SoonOptions = {
    query?: Record<string, string | number | boolean | string[] | number[] | null | undefined> | URLSearchParams;
    params?: Record<string, string | number>;
    timeout?: number;
    signal?: AbortSignal;
    method?: "get" | "GET" | "delete" | "DELETE" | "head" | "HEAD" | "options" | "OPTIONS" | "post" | "POST" | "put" | "PUT" | "patch" | "PATCH" | "purge" | "PURGE" | "link" | "LINK" | "unlink" | "UNLINK";
    mode?: "cors" | "no-cors" | "same-origin";
    cache?: "default" | "no-cache" | "reload" | "force-cache" | "only-if-cached";
    credentials?: "include" | "same-origin" | "omit";
    headers?: Headers;
    redirect?: "manual" | "follow" | "error";
    referrerPolicy?: "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url";
    body?: any;
    integrity?: string;
};
type SoonResult<Options> = {
    isTimeout?: boolean;
    request: Request;
    error?: any;
    response?: Response;
    options: Options;
};
type SoonInit<Options> = {
    baseURL?: string;
    defaultOptions?: () => Options;
    beforeRequest?: (options: Options & {
        headers: Headers;
    }) => void;
    afterResponse?: (result: SoonResult<Options>, resolve: (value: any) => void, reject: (reason?: any) => void) => Promise<void>;
};
declare function createSoon<Options extends SoonOptions = SoonOptions>(soonInit?: SoonInit<Options>): {
    request: <T = any>(url: string, options?: Options) => Promise<T>;
    get: <T = any>(url: string, options?: Options) => Promise<T>;
    post: <T = any>(url: string, options?: Options) => Promise<T>;
    put: <T = any>(url: string, options?: Options) => Promise<T>;
    patch: <T = any>(url: string, options?: Options) => Promise<T>;
    delete: <T = any>(url: string, options?: Options) => Promise<T>;
    head: <T = any>(url: string, options?: Options) => Promise<T>;
    options: <T = any>(url: string, options?: Options) => Promise<T>;
    API: <Url extends string>(url: Url, options?: Options) => {
        GET: <Req = undefined, Res = any>() => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionQuery<Req>]) => Promise<Res>;
        POST: <Req = undefined, Res = any>() => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionBody<Req>]) => Promise<Res>;
        PATCH: <Req = undefined, Res = any>() => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionBody<Req>]) => Promise<Res>;
        DELETE: <Req = undefined, Res = any>() => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionBody<Req>]) => Promise<Res>;
        PUT: <Req = undefined, Res = any>() => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionBody<Req>]) => Promise<Res>;
    };
};
type GetUrlKey<Url> = Url extends `${string}/:${infer Key}/${infer Right}` ? `${Key}` | GetUrlKey<`/${Right}`> : Url extends `${string}/:${infer Key}` ? `${Key}` : never;
type OptionParams<Args> = Args extends undefined ? [] : keyof Args extends never ? [] : Partial<Args> extends Args ? [params?: Args] : NonNullable<Args> | undefined extends Args ? [params?: Args] : [params: Args];
type OptionQuery<Args> = Args extends undefined ? [] : keyof Args extends never ? [] : Partial<Args> extends Args ? [query?: Args] : NonNullable<Args> | undefined extends Args ? [query?: Args] : [query: Args];
type OptionBody<Args> = Args extends undefined ? [] : keyof Args extends never ? [] : Partial<Args> extends Args ? [body?: Args] : NonNullable<Args> | undefined extends Args ? [body?: Args] : [body: Args];

export { SoonInit, SoonOptions, SoonResult, createSoon };
