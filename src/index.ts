export type SoonOptions = {
    query?:
    | Record<
        string,
        string | number | boolean | string[] | number[] | null | undefined
    >
    | URLSearchParams;
    params?: Record<string, string | number>;
    timeout?: number;
    signal?: AbortSignal;
    method?:
    | "get"
    | "GET"
    | "delete"
    | "DELETE"
    | "head"
    | "HEAD"
    | "options"
    | "OPTIONS"
    | "post"
    | "POST"
    | "put"
    | "PUT"
    | "patch"
    | "PATCH"
    | "purge"
    | "PURGE"
    | "link"
    | "LINK"
    | "unlink"
    | "UNLINK";

    mode?: "cors" | "no-cors" | "same-origin"; // no-cors, *cors, same-origin
    cache?: "default" | "no-cache" | "reload" | "force-cache" | "only-if-cached"; // *default, no-cache, reload, force-cache, only-if-cached
    credentials?: "include" | "same-origin" | "omit"; // include, *same-origin, omit
    headers?: Headers;
    redirect?: "manual" | "follow" | "error"; // manual, *follow, error
    referrerPolicy?:
    | "no-referrer"
    | "no-referrer-when-downgrade"
    | "origin"
    | "origin-when-cross-origin"
    | "same-origin"
    | "strict-origin"
    | "strict-origin-when-cross-origin"
    | "unsafe-url"; // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body?: any; // body data type must match "Content-Type" header
    integrity?: string;
};

export type SoonResult<Options> = {
    isTimeout?: boolean;
    request: Request;
    error?: any;
    response?: Response;
    options: Options;
};

const parseUrlPathParams = (url: string) => {
    const urlKeys: string[] = [];
    url.match(/\:([^:\/\d]+)\/?/g)?.forEach((str) => {
        urlKeys.push(str.replace(/\//g, "").replace(/:/g, ""));
    });
    return urlKeys;
};
const combineUrl = (
    url: string,
    config: {
        query?:
        | Record<
            string,
            string | number | boolean | string[] | number[] | null | undefined
        >
        | URLSearchParams;
        params?: Record<string, string | number>;
        baseURL?: string;
    }
) => {
    const { query, params, baseURL } = config;
    //和 url
    let _url = url.trim();

    //处理path params解析类似:id参数
    const urlKeys = parseUrlPathParams(url);
    urlKeys.forEach((key) => {
        if (params) {
            _url = _url.replace(":" + key, "" + params[key]);
        }
    });

    let urlObj;
    let isFakeBase;
    let _url_arr = [_url];
    const STR_HTTP = "http"
    if (_url.indexOf(STR_HTTP) !== 0) {
        if (baseURL?.indexOf(STR_HTTP) !== 0) {
            isFakeBase = true;
            let _temp_url = baseURL;
            if (baseURL?.endsWith("/")) _temp_url = _temp_url?.slice(0, -1);
            _temp_url = _temp_url + (_url.startsWith("/") ? _url : "/" + _url);
            _url_arr = [_temp_url];
        }
        let _base_url = isFakeBase ? `${STR_HTTP}://t.c` : baseURL;
        if (_base_url) _url_arr.push(_base_url);
    }
    //@ts-ignore
    urlObj = new URL(..._url_arr);
    //处理queryString
    let querystring;
    const queryData: string[][] = [];
    if (query) {
        Object.keys(query).forEach((queryKey) => {
            const queryVal = (query as any)[queryKey];
            (Array.isArray(queryVal) ? queryVal : [queryVal]).forEach((val) => {
                queryData.push([queryKey, val ?? ""]);
            });
        });
    }
    querystring = new URLSearchParams([
        ...Array.from(urlObj.searchParams.entries()),
        ...queryData,
    ]);

    let result = (isFakeBase ? "" : urlObj.origin) + urlObj.pathname;
    if (querystring) result = result + "?" + querystring;
    return result;
};
const combineHeaders = (...headersList: (Headers | undefined)[]) => {
    const c = new Headers();
    headersList.forEach((h) => {
        if (h)
            h.forEach((val, key) => {
                c.set(key, val);
            });
    });
    return c;
};
function soonFetch<T, Options>(
    url: string,
    options?: Options,
    soonInit?: SoonInit<Options>
) {
    const CONTENT_TYPE = "Content-Type";
    //初始化 _options
    const initOptions = soonInit?.defaultOptions;
    const _default_options = initOptions
        ? (initOptions() as SoonOptions)
        : undefined;
    //hearders
    let headers = combineHeaders(
        _default_options?.headers,
        (options as SoonOptions)?.headers
    );
    let _options = Object.assign({}, _default_options, options, {
        headers,
    });

    const { beforeRequest, afterResponse } = soonInit || {};
    if (beforeRequest) {
        beforeRequest(_options);
    }

    //abort
    let timeout = _options.timeout;
    const signals = [];
    if (timeout) {
        signals.push(AbortSignal.timeout(timeout));
    }
    const outSignal = _options.signal;
    if (outSignal) {
        signals.push(outSignal);
    }

    _options.signal = AbortSignal.any(signals);

    const handleResponse = async (
        result: SoonResult<Options>,
        resolve: (value: T | PromiseLike<T>) => void,
        reject: (reason?: any) => void
    ) => {
        if (afterResponse) {
            await afterResponse(result, resolve, reject);
        }
        const res = result.response;
        if (res) {
            resolve(res as any);
        }
        reject(result);

    };
    return new Promise<T>(async (resolve, reject) => {
        let _url = combineUrl(url, { ..._options, baseURL: soonInit?.baseURL });
        //处理body
        let is_body_Json = false;
        const _body = _options.body;
        if (_body) {
            if (
                !(
                    _body instanceof Blob ||
                    _body instanceof ArrayBuffer ||
                    _body instanceof FormData ||
                    typeof _body === "string"
                )
            ) {
                is_body_Json = true;
                _options.body = JSON.stringify(_body);
            }
        }

        //处理请求头
        // //处理json数据
        if (is_body_Json) {
            _options.headers.set(CONTENT_TYPE, "application/json");
        }

        const request = new Request(_url, _options);
        let parsed_response: SoonResult<Options> = {
            request,
            options: _options as Options,
        };
        //*********************开始Fetch */
        try {
            const response = await fetch(request);
            parsed_response.response = response;
            handleResponse(parsed_response, resolve, reject);
        } catch (error: any) {
            if (error?.name === "TimeoutError") {
                parsed_response.isTimeout = true;
            }

            handleResponse({ ...parsed_response, error }, resolve, reject);
        }
    });
}

export type SoonInit<Options> = {
    baseURL?: string;
    defaultOptions?: () => Options;
    beforeRequest?: (options: Options & { headers: Headers }) => void;
    afterResponse?: (
        result: SoonResult<Options>,
        resolve: (value: any) => void,
        reject: (reason?: any) => void

    ) => Promise<void>;
};

export function createSoon<Options extends SoonOptions = SoonOptions>(
    soonInit: SoonInit<Options> = {}
) {
    const _soon: any = {};
    _soon.baseInit = soonInit;
    const request = <T>(url: string, options?: Options) => {
        return soonFetch<T, Options>(url, options, _soon.baseInit);
    };
    const methods = [
        "get",
        "post",
        "put",
        "delete",
        "patch",
    ] as const;
    [...methods, "head", "options",].forEach((method) => {
        _soon[method] = <T>(url: string, options?: Options) => {
            return request<T>(url, {
                method,
                ...options,
            } as Options);
        };
    });
    _soon.request = request;

    _soon.API = <Url extends string>(url: Url, options?: Options) => {
        // console.log('url', url)
        const _API = {} as any;
        const hasParams = !!parseUrlPathParams(url).length;
        methods.forEach((method) => {
            const _method = method.toUpperCase();
            _API[_method] =
                () =>
                    (...args: any) => {
                        let [arg1, arg2] = args;
                        const dataKey =
                            method === 'get' ? "query" : "body";
                        return request(url, {
                            method,
                            ...options,
                            params: hasParams ? arg1 : undefined,
                            [dataKey]: hasParams ? arg2 : arg1,
                        } as Options);
                    };
        });
        return _API;
    };

    return _soon as {
        request: <T = any>(url: string, options?: Options) => Promise<T>;
        get: <T = any>(url: string, options?: Options) => Promise<T>;
        post: <T = any>(url: string, options?: Options) => Promise<T>;
        put: <T = any>(url: string, options?: Options) => Promise<T>;
        patch: <T = any>(url: string, options?: Options) => Promise<T>;
        delete: <T = any>(url: string, options?: Options) => Promise<T>;
        head: <T = any>(url: string, options?: Options) => Promise<T>;
        options: <T = any>(url: string, options?: Options) => Promise<T>;
        API: <Url extends string>(
            url: Url,
            options?: Options
        ) => {
            GET: <Req = undefined, Res = any>() => (
                ...arg: [
                    ...OptionParams<{
                        [key in GetUrlKey<Url>]: string | number;
                    }>,
                    ...OptionQuery<Req>
                ]
            ) => Promise<Res>;
            POST: <Req = undefined, Res = any>() => (
                ...arg: [
                    ...OptionParams<{
                        [key in GetUrlKey<Url>]: string | number;
                    }>,

                    ...OptionBody<Req>
                ]
            ) => Promise<Res>;
            PATCH: <Req = undefined, Res = any>() => (
                ...arg: [
                    ...OptionParams<{
                        [key in GetUrlKey<Url>]: string | number;
                    }>,

                    ...OptionBody<Req>
                ]
            ) => Promise<Res>;
            DELETE: <Req = undefined, Res = any>() => (
                ...arg: [
                    ...OptionParams<{
                        [key in GetUrlKey<Url>]: string | number;
                    }>,

                    ...OptionBody<Req>
                ]
            ) => Promise<Res>;
            PUT: <Req = undefined, Res = any>() => (
                ...arg: [
                    ...OptionParams<{
                        [key in GetUrlKey<Url>]: string | number;
                    }>,

                    ...OptionBody<Req>
                ]
            ) => Promise<Res>;
        };
    };
}

type GetUrlKey<Url> = Url extends `${string}/:${infer Key}/${infer Right}`
    ? `${Key}` | GetUrlKey<`/${Right}`>
    : Url extends `${string}/:${infer Key}`
    ? `${Key}`
    : never;
type OptionParams<Args> = Args extends undefined
    ? []
    : keyof Args extends never
    ? []
    : Partial<Args> extends Args
    ? [params?: Args]
    : NonNullable<Args> | undefined extends Args
    ? [params?: Args]
    : [params: Args];

type OptionQuery<Args> = Args extends undefined
    ? []
    : keyof Args extends never
    ? []
    : Partial<Args> extends Args
    ? [query?: Args]
    : NonNullable<Args> | undefined extends Args
    ? [query?: Args]
    : [query: Args];
type OptionBody<Args> = Args extends undefined
    ? []
    : keyof Args extends never
    ? []
    : Partial<Args> extends Args
    ? [body?: Args]
    : NonNullable<Args> | undefined extends Args
    ? [body?: Args]
    : [body: Args];
