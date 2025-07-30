import { OptionParams, GetUrlKey, OptionQuery, OptionBody, SoonOptions, Tuple2Union } from "./types"

const parseUrlPathParams = (url: string) => {
  const urlKeys: string[] = []
  const result = url.match(/:([^:/\d]+)\/?/g)
  if (result) {
    result.forEach((str) => {
      urlKeys.push(str.replace(/\//g, "").replace(/:/g, ""))
    })
  }

  return urlKeys
}
const trimEndSlash = (str: string = "") => {
  return str.endsWith("/") ? str.slice(0, -1) : str
}

const toStartWithSlash = (str: string = "") => {
  return !str.startsWith("/") ? "/" + str : str
}
const isStartOfHttp = (str: string = "") => {
  return str.startsWith("http")
}

const parseWithBaseUrl = (url: string, baseUrl?: string) => {
  if (isStartOfHttp(url)) return url
  const parsedBaseUrl = isStartOfHttp(baseUrl) ? baseUrl : toStartWithSlash(baseUrl)
  return trimEndSlash(parsedBaseUrl) + trimEndSlash(toStartWithSlash(url))
}

const parseQueryString = (
  query?:
    | string
    | string[][]
    | Record<string, string | number | boolean | null | undefined | (string | number | boolean | null | undefined)[]>
    | URLSearchParams,
) => {
  if (!query) return []
  if (query instanceof URLSearchParams || typeof query === "string" || Array.isArray(query))
    return Array.from(new URLSearchParams(query).entries())
  const queryData: string[][] = []

  Object.keys(query).forEach((queryKey) => {
    const queryVal = (query as any)[queryKey]
    ;(Array.isArray(queryVal) ? queryVal : [queryVal]).forEach((val) => {
      queryData.push([queryKey, val ?? ""])
    })
  })
  return queryData
}
const mergeUrl = (
  url: string,
  config: {
    query?:
      | Record<string, string | number | boolean | null | undefined | (string | number | boolean | null | undefined)[]>
      | URLSearchParams
    params?: Record<string, string | number>
    baseURL?: string
  },
) => {
  const { query, params, baseURL } = config
  //和 url
  let _url = url.trim()

  //处理path params解析类似:id参数
  const urlKeys = parseUrlPathParams(url)
  urlKeys.forEach((key) => {
    if (params) {
      _url = _url.replace(":" + key, "" + params[key])
    }
  })

  const [_base_url, _path_query] = _url.split("?")

  //处理queryString
  const querystring = new URLSearchParams([...parseQueryString(_path_query), ...parseQueryString(query)])

  let result = parseWithBaseUrl(_base_url, baseURL)

  if (querystring.size) result = result + "?" + querystring
  return result
}
const mergeHeaders = (...headersList: (HeadersInit | undefined)[]) => {
  const c = new Headers()
  headersList.forEach((h) => {
    if (h)
      new Headers(h).forEach((val, key) => {
        c.set(key, val)
      })
  })
  return c
}

function mergeSignals(signals?: (AbortSignal | null | undefined)[], timeout?: number) {
  const signal_list = (signals ?? []).filter((s) => !!s)
  if (timeout) {
    signal_list.push(AbortSignal.timeout(timeout))
  }
  return signal_list.length ? AbortSignal.any(signal_list) : undefined
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
  )
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
  )
}

function mergeOptions<Options extends SoonOptions>(
  ...optionsList: (Options | undefined)[]
): Options & { headers: Headers } {
  const _options: Options = Object.assign({}, ...optionsList)
  //headers  merge headers , the same-key header would be override by options.headers
  const headers = mergeHeaders(...optionsList.map((o) => o?.headers))
  _options.headers = headers
  //signal  merge signals by AbortSignal.any
  _options.signal = mergeSignals(
    optionsList.map((o) => o?.signal),
    _options.timeout,
  )
  return _options as Options & { headers: Headers }
}

function parseWithBase<Options extends SoonOptions>(urlOptions: {
  url: string
  options?: Options
  baseURL?: string
  baseOptions?: Options
}) {
  const { url, options, baseURL, baseOptions } = urlOptions
  //override baseOptions
  const _options = mergeOptions(baseOptions, options)

  //url  handled with baseURL , options.query , options.params
  const _url = mergeUrl(url, { ..._options, baseURL })

  //body  auto stringify json body
  const _body = _options?.body
  const is_body_json = isBodyJson(_body)
  _options.body = is_body_json ? JSON.stringify(_body) : _body

  //if body is json ,then add header "Content-Type": "application/json" }
  if (is_body_json) _options.headers.append("Content-Type", "application/json")

  const abortController = new AbortController()
  _options.signal = mergeSignals([_options.signal, abortController.signal])
  return {
    url: _url,
    options: _options,
    is_body_json,
    abortController,
  } as {
    url: string
    options: Options & {
      headers: Headers
      body?: RequestInit["body"]
    }
    is_body_json: boolean
    abortController: AbortController
  }
}

function parseUrlOptions<Options extends SoonOptions>(urlOptions: {
  url: string
  options?: Options
  baseURL?: string
  baseOptions?: Options
}) {
  const { url, options } = parseWithBase(urlOptions)
  return [url, options] as [
    url: string,
    options: Options & {
      headers: Headers
      body?: BodyInit | null
    },
  ]
}

const METHODS = ["get", "post", "put", "delete", "patch"] as const

function createShortMethods<
  Methods extends readonly string[],
  Wrapper extends (method: string) => <T>(...args: any) => Promise<T>,
>(methods: Methods, wrapper: Wrapper) {
  const _soon: any = {}
  methods.forEach((method) => {
    _soon[method] = wrapper(method)
  })
  return _soon as Record<Tuple2Union<Methods>, ReturnType<typeof wrapper>>
}

function createShortApi<
  Wrapper extends <T>(
    url: string,
    method: string,
    params: Record<string, string | number> | undefined,
    query:
      | Record<string, string | number | boolean | null | undefined | (string | number | boolean | null | undefined)[]>
      | URLSearchParams
      | undefined,
    body: RequestInit["body"] | object,
    options?: any,
    defineOptions?: any,
  ) => Promise<T>,
>(wrapper: Wrapper) {
  const genMethod = (
    url: string,
    method: string,
    opt?: { hasQuery?: boolean; hasBody?: boolean; options?: object },
  ) => {
    const hasParams = !!parseUrlPathParams(url).length
    return (...args: any) => {
      const _args = [...args]

      const { hasBody, hasQuery } = opt || {}
      const params = hasParams ? _args.shift() : undefined
      const query = hasQuery ? _args.shift() : undefined
      const body = hasBody ? _args.shift() : undefined
      const _options = _args.shift()
      return wrapper(url, method, params, query, body, _options, opt?.options)
    }
  }
  const _API = {} as any

  METHODS.forEach((method) => {
    const _method = method.toUpperCase()
    _API[_method] = (url: string) => {
      return {
        Send: (options?: object) => genMethod(url, method, { options }),
        Body: () => ({
          Send: (options?: object) => genMethod(url, method, { hasBody: true, options }),
        }),
        Query: () => ({
          Send: (options?: object) =>
            genMethod(url, method, {
              hasQuery: true,
              options,
            }),
          Body: () => ({
            Send: (options?: object) =>
              genMethod(url, method, {
                hasBody: true,
                hasQuery: true,
                options,
              }),
          }),
        }),
      }
    }
  })
  type Result<Url, Query, Body> = <Res>(options?: Parameters<Wrapper>[5]) => (
    ...arg: [
      ...OptionParams<{
        [key in GetUrlKey<Url>]: string | number
      }>,
      ...OptionQuery<Query>,
      ...OptionBody<Body>,
      options?: Parameters<Wrapper>[5],
    ]
  ) => Promise<Res>

  return _API as {
    GET: <Url extends string>(
      url: Url,
    ) => {
      Send: Result<Url, never, never>
      Query: <Query>() => unknown extends Query
        ? never
        : {
            Send: Result<Url, Query, never>
          }
    }
  } & Record<
    "POST" | "PATCH" | "DELETE" | "PUT",
    <Url extends string>(
      url: Url,
    ) => {
      Send: Result<Url, never, never>
      Body: <Body>() => unknown extends Body
        ? never
        : {
            Send: Result<Url, never, Body>
          }
      Query: <Query>() => unknown extends Query
        ? never
        : {
            Send: Result<Url, Query, never>
            Body: <Body>() => unknown extends Body ? never : { Send: Result<Url, Query, Body> }
          }
    }
  >
}
type NoData<T> = Omit<T, "method" | "body" | "params" | "query">

function raceAbort(abortController: AbortController, controllers?: AbortController[]) {
  //结束上一个请求
  if (controllers) {
    controllers.pop()?.abort("race abort")
    controllers.push(abortController)
  }
}

function deepSort(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(deepSort)
  }

  if (typeof obj === "object" && obj !== null) {
    const sortedObj: Record<string, any> = {}
    Object.keys(obj)
      .sort()
      .forEach((key) => {
        sortedObj[key] = deepSort((obj as Record<string, any>)[key])
      })
    return sortedObj
  }

  return obj
}

function genRequestKey(req: {
  url: string
  options?: {
    method?: string
    headers?: RequestInit["headers"]
    body?: RequestInit["body"] | object
    query?:
      | Record<string, string | number | boolean | null | undefined | (string | number | boolean | null | undefined)[]>
      | URLSearchParams
    params?: Record<string, string | number>
  }
}) {
  const { url, options } = req
  const { headers, method, body, query, params } = options ?? {}
  const headersSorted = deepSort(Object.fromEntries(new Headers(headers).entries() ?? []))
  return (
    (method ?? "get").toLowerCase() +
    url +
    JSON.stringify(deepSort(query) ?? "") +
    JSON.stringify(deepSort(params) ?? "") +
    JSON.stringify(headersSorted) +
    (typeof body === "object" && body != null ? JSON.stringify(deepSort(body)) : (body ?? ""))
  )
}
function createCache() {
  const cached: Record<
    string,
    | {
        data: unknown
        expiredTime: number
      }
    | undefined
  > = {}

  const list: { key: string; expiredTime: number }[] = []

  const timer = setInterval(() => {
    const now = Date.now()
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].expiredTime < now) {
        delete cached[list[i].key]
        list.splice(i, 1)
      }
    }
  }, 1000 * 60)

  const clone = (data: unknown) => {
    if (data instanceof Response) {
      return data.clone()
    } else if (typeof data === "function" || data instanceof Promise) {
      return data
    } else {
      return structuredClone(data)
    }
  }
  function set(key: string, res: Response | unknown, expiredTime: number) {
    cached[key] = { data: clone(res), expiredTime }
    list.push({ key, expiredTime })
  }
  function get(key: string) {
    const cache = cached[key]
    if (cache === undefined) return
    if (cache.expiredTime > Date.now()) {
      return clone(cache.data)
    } else {
      remove(key)
    }
  }
  function remove(key: string) {
    delete cached[key]
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].key === key) {
        list.splice(i, 1)
        break
      }
    }
  }
  return {
    get,
    set,
    remove,
  }
}

function createShare() {
  const shared_requests: Record<string, Promise<any> | undefined> = {}
  const get = (key: string) => shared_requests[key]
  const set = (key: string, value: Promise<any>) => {
    shared_requests[key] = value
    value.finally(() => remove(key))
  }
  const remove = (key: string) => (shared_requests[key] = undefined)

  return {
    get,
    set,
  }
}

function createSilentRefresh(refresh_token_fn: () => Promise<void>) {
  let requests: { success: () => void; fail: () => void }[] = []
  let isRefreshing = false
  return (success: () => void, fail: () => void) => {
    requests.push({ success, fail })
    if (!isRefreshing) {
      isRefreshing = true
      refresh_token_fn()
        .then(() => {
          requests.forEach((r) => r.success())
        })
        .catch((err) => {
          requests.forEach((r) => r.fail())
        })
        .finally(() => {
          isRefreshing = false
          requests = []
        })
    }
  }
}

function createSoon<Options extends SoonOptions>(
  getConfig: (
    url: string,
    options?: Options,
  ) => {
    url?: string
    options?: Options
    baseURL?: string
    baseOptions?: Options
  },

  wrapper: (instance: {
    parsed: {
      url: string
      options: Options & {
        headers: Headers
        body?: RequestInit["body"]
      }
      is_body_json: boolean
      abortController: AbortController
      requestKey: string
    }
  }) => <T>(url: string, options?: Options) => Promise<T>,
) {
  const cache = createCache()
  const share = createShare()
  type RequestFn = <T>(url: string, options?: Options) => Promise<T>

  const request = <T>(url: string, options?: Options) => {
    return new Promise<T>((resolve, reject) => {
      const config = getConfig(url, options)
      const parsed = parseWithBase({ url, options, ...config })
      const requestKey = genRequestKey(parsed)
      const { abortController: fetchAbort } = parsed
      const abortController = new AbortController()
      abortController.signal.addEventListener("abort", () => {
        reject(abortController.signal.reason)
      })
      const fetching = wrapper({ parsed: { ...parsed, requestKey } })
      //共享未完成的请求
      if (parsed.options?.share) {
        const shared = share.get(requestKey)
        if (shared) {
          return resolve(shared)
        }
      }
      //结束上一个请求
      raceAbort(parsed.options.share ? abortController : fetchAbort, parsed.options?.aborts)

      //获取缓存的数据
      if (parsed.options?.staleTime) {
        const cachedData = cache.get(requestKey)
        if (cachedData !== undefined) {
          return resolve(cachedData as T)
        }
      }

      const req_promise = fetching(url, options)
      //添加共享
      if (parsed.options?.share) share.set(requestKey, req_promise)

      req_promise
        .then((res) => {
          resolve(res as T)
          if (parsed.options?.staleTime) cache.set(requestKey, res, new Date().getTime() + parsed.options.staleTime)
        })
        .catch((err) => reject(err))
    })
  }

  const API = createShortApi(
    <T>(
      url: string,
      method: string,
      params: Record<string, string | number> | undefined,
      query:
        | Record<
            string,
            string | number | boolean | null | undefined | (string | number | boolean | null | undefined)[]
          >
        | URLSearchParams
        | undefined,
      body: RequestInit["body"] | object | undefined,
      options: NoData<Options> | undefined,
      defineOptions: NoData<Options> | undefined,
    ) => {
      return request<T>(url, {
        ...defineOptions,
        ...options,
        method,
        params,
        query,
        body,
      } as Options)
    },
  )
  const shorts = createShortMethods([...METHODS, "head", "options"] as const, (method) => {
    return ((url: string, options?: Options) => {
      return request(url, { ...options, method } as Options)
    }) as RequestFn
  })
  return {
    request,
    ...API,
    ...shorts,
  }
}
export {
  createSoon,
  createShortApi,
  createShortMethods,
  parseUrlOptions,
  mergeHeaders,
  mergeSignals,
  mergeUrl,
  mergeOptions,
  isBodyJson,
  genRequestKey,
  raceAbort,
  createCache,
  deepSort,
  createShare,
  createSilentRefresh,
  parseWithBase,
}
export type { SoonOptions }
