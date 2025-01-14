import {
  OptionParams,
  GetUrlKey,
  OptionQuery,
  OptionBody,
  SoonOptions,
  Tuple2Union,
} from "./types";

const parseUrlPathParams = (url: string) => {
  const urlKeys: string[] = [];
  const result = url.match(/:([^:/\d]+)\/?/g);
  if (result) {
    result.forEach((str) => {
      urlKeys.push(str.replace(/\//g, "").replace(/:/g, ""));
    });
  }

  return urlKeys;
};
const trimEndSlash = (str: string = "") => {
  if (str.endsWith("/")) return str.slice(0, -1);
  return str;
};

const toStartWithSlash = (str: string = "") => {
  let _str = str;
  if (str) {
    _str = trimEndSlash(_str);
    if (!str.startsWith("/")) {
      _str = "/" + _str;
    }
  }
  return _str;
};
const isStartOfHttp = (str: string = "") => {
  return str.startsWith("http");
};
const toStartWithSlashOrHttp = (str: string = "") => {
  if (!isStartOfHttp(str)) return toStartWithSlash(str);
  return str;
};
const parseWithBaseUrl = (url: string, baseUrl?: string) => {
  let result = toStartWithSlashOrHttp(url);
  if (!isStartOfHttp(result)) {
    result = toStartWithSlashOrHttp(baseUrl) + result;
  }
  return result;
};

const parseQueryString = (
  query?:
    | string
    | string[][]
    | Record<
        string,
        | string
        | number
        | boolean
        | null
        | undefined
        | (string | number | boolean | null | undefined)[]
      >
    | URLSearchParams
) => {
  if (!query) return [];
  if (
    query instanceof URLSearchParams ||
    typeof query === "string" ||
    Array.isArray(query)
  )
    return Array.from(new URLSearchParams(query).entries());
  const queryData: string[][] = [];

  Object.keys(query).forEach((queryKey) => {
    const queryVal = (query as any)[queryKey];
    (Array.isArray(queryVal) ? queryVal : [queryVal]).forEach((val) => {
      queryData.push([queryKey, val ?? ""]);
    });
  });
  return queryData;
};
const mergeUrl = (
  url: string,
  config: {
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

  const [_base_url, _path_query] = _url.split("?");

  //处理queryString
  const querystring = new URLSearchParams([
    ...parseQueryString(_path_query),
    ...parseQueryString(query),
  ]);

  let result = parseWithBaseUrl(_base_url, baseURL);

  if (querystring.size) result = result + "?" + querystring;
  return result;
};
const mergeHeaders = (...headersList: (HeadersInit | undefined)[]) => {
  const c = new Headers();
  headersList.forEach((h) => {
    if (h)
      new Headers(h).forEach((val, key) => {
        c.set(key, val);
      });
  });
  return c;
};

function mergeSignals(
  signals?: (AbortSignal | null | undefined)[],
  timeout?: number
) {
  const signal_list = (signals ?? []).filter((s) => !!s);
  if (timeout) {
    signal_list.push(AbortSignal.timeout(timeout));
  }
  return signal_list.length ? AbortSignal.any(signal_list) : undefined;
}
function isTypedArray(obj: object) {
  return (
    obj instanceof Int8Array ||
    obj instanceof Uint8Array ||
    obj instanceof Uint8ClampedArray ||
    obj instanceof Int16Array ||
    obj instanceof Uint16Array ||
    obj instanceof Int32Array ||
    obj instanceof Uint32Array ||
    obj instanceof Float32Array ||
    obj instanceof Float64Array ||
    obj instanceof BigInt64Array ||
    obj instanceof BigUint64Array
  );
}
function isBodyJson(body: any) {
  return !!(
    body &&
    typeof body === "object" &&
    !(
      body instanceof Blob ||
      body instanceof ArrayBuffer ||
      body instanceof FormData ||
      body instanceof File ||
      body instanceof DataView ||
      body instanceof URLSearchParams ||
      body instanceof ReadableStream ||
      isTypedArray(body)
    )
  );
}

function parseUrlOptions<Options extends SoonOptions>(urlOptions: {
  url: string;
  options?: Options;
  baseURL?: string;
  baseOptions?: Options;
}) {
  const { url, options, baseURL, baseOptions } = urlOptions;
  //override baseOptions
  const _options = { ...baseOptions, ...options };

  //signal  merge signals by AbortSignal.any
  _options.signal = mergeSignals(
    [baseOptions?.signal, options?.signal],
    _options.timeout
  );

  //url  handled with baseURL , options.query , options.params
  const _url = mergeUrl(url, { ..._options, baseURL });

  //body  auto stringify json body
  let _body = options?.body;
  let is_body_json = isBodyJson(_body);
  _options.body = is_body_json ? JSON.stringify(_body) : _body;

  //headers  merge headers , the same-key header would be override by options.headers
  //if body is json ,then add header "Content-Type": "application/json" }
  const headers = mergeHeaders(
    baseOptions?.headers,
    options?.headers,
    is_body_json ? { "Content-Type": "application/json" } : undefined
  );
  _options.headers = headers;

  return [_url, _options as Options & { headers: Headers }] as const;
}

const METHODS = ["get", "post", "put", "delete", "patch"] as const;

function createSoon<
  T extends (url: string, options?: SoonOptions) => Promise<any>
>(requestFun: T) {
  const request = requestFun;

  const API = createShortAPI(request);

  const shorts = createShortMethods(
    [...METHODS, "head", "options"] as const,
    request
  );

  return {
    request,
    API,
    ...shorts,
  };
}

function createShortMethods<
  Methods extends string[],
  RequestFun extends <T>(
    url: string,
    options?: { method?: string }
  ) => Promise<any>
>(methods: Methods, requestFun: RequestFun) {
  const _soon: any = {};
  methods.forEach((method) => {
    _soon[method] = <T>(url: string, options?: any) => {
      return requestFun(url, { ...options, method });
    };
  });
  return _soon as Record<Tuple2Union<Methods>, typeof requestFun>;
}

function createShortAPI<
  requestFun extends <T>(url: string, options?: SoonOptions) => Promise<any>
>(requestFun: requestFun) {
  type Args = Parameters<requestFun>;
  const API = (<Url extends string>(url: Url, options?: Args[1]) => {
    const _API = {} as any;
    const hasParams = !!parseUrlPathParams(url).length;

    METHODS.forEach((method) => {
      const _method = method.toUpperCase();
      _API[_method] =
        () =>
        (...args: any) => {
          const [arg1, arg2] = args;
          const dataKey = method === "get" ? "query" : "body";
          return requestFun(url, {
            ...options,
            method,
            params: hasParams ? arg1 : undefined,
            [dataKey]: hasParams ? arg2 : arg1,
          });
        };
    });
    return _API;
  }) as <Url extends string>(
    url: Url,
    options?: Args[1]
  ) => Record<
    "GET",
    <Req = undefined, Res = Awaited<ReturnType<requestFun>>>() => (
      ...arg: [
        ...OptionParams<{ [key in GetUrlKey<Url>]: string | number }>,
        ...OptionQuery<Req>
      ]
    ) => Promise<Res>
  > &
    Record<
      "POST" | "PATCH" | "DELETE" | "PUT",
      <Req = undefined, Res = Awaited<ReturnType<requestFun>>>() => (
        ...arg: [
          ...OptionParams<{ [key in GetUrlKey<Url>]: string | number }>,
          ...OptionBody<Req>
        ]
      ) => Promise<Res>
    >;

  return API;
}

export {
  createSoon,
  createShortAPI,
  createShortMethods,
  parseUrlOptions,
  mergeHeaders,
  mergeSignals,
  mergeUrl,
  isBodyJson,
};
export type { SoonOptions };
