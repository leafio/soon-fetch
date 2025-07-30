type SoonOptions = Omit<RequestInit, "body"> & {
    body?: RequestInit["body"] | object;
    query?: Record<string, string | number | boolean | null | undefined | (string | number | boolean | null | undefined)[]> | URLSearchParams;
    params?: Record<string, string | number>;
    timeout?: number;
    aborts?: AbortController[] | never[];
    share?: boolean;
    staleTime?: number;
};
type GetUrlKey<Url> = Url extends `${string}/:${infer Key}/${infer Right}` ? `${Key}` | GetUrlKey<`/${Right}`> : Url extends `${string}/:${infer Key}` ? `${Key}` : never;
type OptionParams<Args> = NonNullable<Args> extends never ? [] : keyof NonNullable<Args> extends never ? [] : Exclude<Args, NonNullable<Args>> extends never ? [params: Args] : [params?: Args];
type OptionQuery<Args> = NonNullable<Args> extends never ? [] : keyof NonNullable<Args> extends never ? [] : Exclude<Args, NonNullable<Args>> extends never ? Partial<Args> extends Args ? [query?: Args] : [query: Args] : [query?: Args];
type OptionBody<Args> = NonNullable<Args> extends never ? [] : Exclude<Args, NonNullable<Args>> extends never ? [body: Args] : [body?: Args];
type Tuple2Union<T> = T extends readonly [infer T1, infer T2, ...infer R] ? T1 | T2 | Tuple2Union<R> : T extends [infer T_Only] ? T_Only : never;

declare const mergeUrl: (url: string, config: {
    query?: Record<string, string | number | boolean | null | undefined | (string | number | boolean | null | undefined)[]> | URLSearchParams;
    params?: Record<string, string | number>;
    baseURL?: string;
}) => string;
declare const mergeHeaders: (...headersList: (HeadersInit | undefined)[]) => Headers;
declare function mergeSignals(signals?: (AbortSignal | null | undefined)[], timeout?: number): AbortSignal | undefined;
declare function isBodyJson(body: any): boolean;
declare function mergeOptions<Options extends SoonOptions>(...optionsList: (Options | undefined)[]): Options & {
    headers: Headers;
};
declare function parseWithBase<Options extends SoonOptions>(urlOptions: {
    url: string;
    options?: Options;
    baseURL?: string;
    baseOptions?: Options;
}): {
    url: string;
    options: Options & {
        headers: Headers;
        body?: RequestInit["body"];
    };
    is_body_json: boolean;
    abortController: AbortController;
};
declare function parseUrlOptions<Options extends SoonOptions>(urlOptions: {
    url: string;
    options?: Options;
    baseURL?: string;
    baseOptions?: Options;
}): [url: string, options: Options & {
    headers: Headers;
    body?: BodyInit | null;
}];
declare function createShortMethods<Methods extends readonly string[], Wrapper extends (method: string) => <T>(...args: any) => Promise<T>>(methods: Methods, wrapper: Wrapper): Record<Tuple2Union<Methods>, ReturnType<typeof wrapper>>;
declare function createShortApi<Wrapper extends <T>(url: string, method: string, params: Record<string, string | number> | undefined, query: Record<string, string | number | boolean | null | undefined | (string | number | boolean | null | undefined)[]> | URLSearchParams | undefined, body: RequestInit["body"] | object, options?: any, defineOptions?: any) => Promise<T>>(wrapper: Wrapper): {
    GET: <Url extends string>(url: Url) => {
        Send: <Res>(options?: Parameters<Wrapper>[5]) => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, options?: Parameters<Wrapper>[5] | undefined]) => Promise<Res>;
        Query: <Query>() => unknown extends Query ? never : {
            Send: <Res>(options?: Parameters<Wrapper>[5]) => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionQuery<Query>, options?: Parameters<Wrapper>[5] | undefined]) => Promise<Res>;
        };
    };
} & Record<"POST" | "PATCH" | "DELETE" | "PUT", <Url extends string>(url: Url) => {
    Send: <Res>(options?: Parameters<Wrapper>[5]) => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, options?: Parameters<Wrapper>[5] | undefined]) => Promise<Res>;
    Body: <Body>() => unknown extends Body ? never : {
        Send: <Res>(options?: Parameters<Wrapper>[5]) => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionBody<Body>, options?: Parameters<Wrapper>[5] | undefined]) => Promise<Res>;
    };
    Query: <Query>() => unknown extends Query ? never : {
        Send: <Res>(options?: Parameters<Wrapper>[5]) => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionQuery<Query>, options?: Parameters<Wrapper>[5] | undefined]) => Promise<Res>;
        Body: <Body>() => unknown extends Body ? never : {
            Send: <Res>(options?: Parameters<Wrapper>[5]) => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionQuery<Query>, ...OptionBody<Body>, options?: Parameters<Wrapper>[5] | undefined]) => Promise<Res>;
        };
    };
}>;
type NoData<T> = Omit<T, "method" | "body" | "params" | "query">;
declare function raceAbort(abortController: AbortController, controllers?: AbortController[]): void;
declare function deepSort(obj: unknown): unknown;
declare function genRequestKey(req: {
    url: string;
    options?: {
        method?: string;
        headers?: RequestInit["headers"];
        body?: RequestInit["body"] | object;
        query?: Record<string, string | number | boolean | null | undefined | (string | number | boolean | null | undefined)[]> | URLSearchParams;
        params?: Record<string, string | number>;
    };
}): string;
declare function createCache(): {
    get: (key: string) => unknown;
    set: (key: string, res: Response | unknown, expiredTime: number) => void;
    remove: (key: string) => void;
};
declare function createShare(): {
    get: (key: string) => Promise<any> | undefined;
    set: (key: string, value: Promise<any>) => void;
};
declare function createSilentRefresh(refresh_token_fn: () => Promise<void>): (success: () => void, fail: () => void) => void;
declare function createSoon<Options extends SoonOptions>(getConfig: (url: string, options?: Options) => {
    url?: string;
    options?: Options;
    baseURL?: string;
    baseOptions?: Options;
}, wrapper: (instance: {
    parsed: {
        url: string;
        options: Options & {
            headers: Headers;
            body?: RequestInit["body"];
        };
        is_body_json: boolean;
        abortController: AbortController;
        requestKey: string;
    };
}) => <T>(url: string, options?: Options) => Promise<T>): {
    options: <T>(url: string, options?: Options) => Promise<T>;
    get: <T>(url: string, options?: Options) => Promise<T>;
    post: <T>(url: string, options?: Options) => Promise<T>;
    put: <T>(url: string, options?: Options) => Promise<T>;
    delete: <T>(url: string, options?: Options) => Promise<T>;
    patch: <T>(url: string, options?: Options) => Promise<T>;
    head: <T>(url: string, options?: Options) => Promise<T>;
    GET: <Url extends string>(url: Url) => {
        Send: <Res>(options?: NoData<Options> | undefined) => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, options?: NoData<Options> | undefined]) => Promise<Res>;
        Query: <Query>() => unknown extends Query ? never : {
            Send: <Res>(options?: NoData<Options> | undefined) => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionQuery<Query>, options?: NoData<Options> | undefined]) => Promise<Res>;
        };
    };
    POST: <Url extends string>(url: Url) => {
        Send: <Res>(options?: NoData<Options> | undefined) => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, options?: NoData<Options> | undefined]) => Promise<Res>;
        Body: <Body>() => unknown extends Body ? never : {
            Send: <Res>(options?: NoData<Options> | undefined) => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionBody<Body>, options?: NoData<Options> | undefined]) => Promise<Res>;
        };
        Query: <Query>() => unknown extends Query ? never : {
            Send: <Res>(options?: NoData<Options> | undefined) => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionQuery<Query>, options?: NoData<Options> | undefined]) => Promise<Res>;
            Body: <Body>() => unknown extends Body ? never : {
                Send: <Res>(options?: NoData<Options> | undefined) => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionQuery<Query>, ...OptionBody<Body>, options?: NoData<Options> | undefined]) => Promise<Res>;
            };
        };
    };
    PATCH: <Url extends string>(url: Url) => {
        Send: <Res>(options?: NoData<Options> | undefined) => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, options?: NoData<Options> | undefined]) => Promise<Res>;
        Body: <Body>() => unknown extends Body ? never : {
            Send: <Res>(options?: NoData<Options> | undefined) => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionBody<Body>, options?: NoData<Options> | undefined]) => Promise<Res>;
        };
        Query: <Query>() => unknown extends Query ? never : {
            Send: <Res>(options?: NoData<Options> | undefined) => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionQuery<Query>, options?: NoData<Options> | undefined]) => Promise<Res>;
            Body: <Body>() => unknown extends Body ? never : {
                Send: <Res>(options?: NoData<Options> | undefined) => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionQuery<Query>, ...OptionBody<Body>, options?: NoData<Options> | undefined]) => Promise<Res>;
            };
        };
    };
    DELETE: <Url extends string>(url: Url) => {
        Send: <Res>(options?: NoData<Options> | undefined) => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, options?: NoData<Options> | undefined]) => Promise<Res>;
        Body: <Body>() => unknown extends Body ? never : {
            Send: <Res>(options?: NoData<Options> | undefined) => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionBody<Body>, options?: NoData<Options> | undefined]) => Promise<Res>;
        };
        Query: <Query>() => unknown extends Query ? never : {
            Send: <Res>(options?: NoData<Options> | undefined) => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionQuery<Query>, options?: NoData<Options> | undefined]) => Promise<Res>;
            Body: <Body>() => unknown extends Body ? never : {
                Send: <Res>(options?: NoData<Options> | undefined) => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionQuery<Query>, ...OptionBody<Body>, options?: NoData<Options> | undefined]) => Promise<Res>;
            };
        };
    };
    PUT: <Url extends string>(url: Url) => {
        Send: <Res>(options?: NoData<Options> | undefined) => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, options?: NoData<Options> | undefined]) => Promise<Res>;
        Body: <Body>() => unknown extends Body ? never : {
            Send: <Res>(options?: NoData<Options> | undefined) => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionBody<Body>, options?: NoData<Options> | undefined]) => Promise<Res>;
        };
        Query: <Query>() => unknown extends Query ? never : {
            Send: <Res>(options?: NoData<Options> | undefined) => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionQuery<Query>, options?: NoData<Options> | undefined]) => Promise<Res>;
            Body: <Body>() => unknown extends Body ? never : {
                Send: <Res>(options?: NoData<Options> | undefined) => (...arg: [...OptionParams<{ [key in GetUrlKey<Url>]: string | number; }>, ...OptionQuery<Query>, ...OptionBody<Body>, options?: NoData<Options> | undefined]) => Promise<Res>;
            };
        };
    };
    request: <T>(url: string, options?: Options) => Promise<T>;
};

export { type SoonOptions, createCache, createShare, createShortApi, createShortMethods, createSilentRefresh, createSoon, deepSort, genRequestKey, isBodyJson, mergeHeaders, mergeOptions, mergeSignals, mergeUrl, parseUrlOptions, parseWithBase, raceAbort };
