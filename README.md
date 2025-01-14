[English](#soon-fetch) | [中文](#soon-fetch-1) | [Installation](#安装-installation)

<!-- omit in toc -->

### `soon-fetch`

**A lightweight http request lib , alternative to axios**

> - 🌐 automatic parse restful api url parameters
> - ⭐ rapid define a request api
> - ⌛ timeout disconnect
> - 🔤 automatic parse or serialization of JSON
> - 📏 .min size less than **3K**, smaller after zip
> - 💡 smart type tips with Typescript

- [Example](#example)

- [Features](#features)
  - [Shortcut](#shortcut)
  - [Restful Url Params](#restful-url-params)
  - [Timeout](#timeout)
  - [Rapid Define APIs](#rapid-define-apis)
- [API](#api)
- [Support Me](#support-me)

### Example

> [github: soon-admin-vue3 ](https://github.com/leafio/soon-admin-vue3)  
> [github: soon-admin-react-nextjs ](https://github.com/leafio/soon-admin-react-nextjs)

```typescript
import { createSoon, parseUrlOptions, type SoonOptions } from "soon-fetch";

const request = <T>(url: string, options?: SoonOptions) => {
  const [_url, _options] = parseUrlOptions({
    url,
    options,
    baseURL: "/api",
    baseOptions: {
      timeout: 20 * 1000,
      headers: { Authorization: localStorage.getItem("token") ?? "" },
    },
  });

  return fetch(_url, _options).then((res) => res.json() as T);
};

const soon = createSoon(request);

/** GET */
soon.get("/user?id=123");
soon.get("/user", { query: { id: 123 } });
soon.get("/user/:id", { params: { id: 123 } });

/** POST */
soon.post("/login", { body: { username: "admin", password: "123456" } });

/**Define API */
export const login = soon
  .API("/user/login")
  .POST<{ username: string; password: string }, { token: string }>();

login({ username: "admin", password: "123" }).then((res) => {
  localStorage.setItem("token", res.token);
});
```

### Features

##### Shortcut

```typescript
soon.get(url, options);
soon.post(url, options);
soon.put(url, options);
soon.patch(url, options);
soon.delete(url, options);
soon.head(url, options);
soon.options(url, options);
```

##### Restful Url Params

url like /:key , will handle the key

```typescript
soon.get("/api/user/:id", { params: { id: 1 } });
// api/user/1
soon.get("/api/:job/:year", { params: { job: "engineer", year: 5 } });
//api/engineer/5
```

##### Timeout

```typescript
//** the request level timeout, will override the instance level timeout  */
soon.get(url, { timeout: 1000 * 20 });
```

##### Rapid Define APIs

```typescript
  //can be GET POST PATCH PUT DELETE
  //GET data=>query,other method data=>body
  soon.API(url:string).POST<RequestType,ResponseType>()

  //define an api
 export const getUserInfo=soon.API('/user/:id').GET()
  //then use in any where
  getUserInfo({id:2}).then(res=>console.log(res))


  //with typescript,
 export const login=soon.API('/user/login')
    .POST<{username:string,password:string},{token:string}>()
 //the develop tools will have type tips for request and response
  login({username:'admin',password:'123'}).then(res=>{
    localStorage.setItem('token', res.token);
  })
```

### API

#### parseUrlOptions

`parseUrlOptions` source code:

```ts
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
```

You can customize your own parse function with the functions exported below:
`mergeHeaders`, `mergeSignals`, `mergeUrl`, `isBodyJson`

### Support Me

If you like this library , you can give a **star** on github.  
GitHub: https://github.com/leafio/soon-fetch

> Email: leafnote@outlook.com

[English](#soon-fetch) | [中文](#soon-fetch-1) | [Installation](#安装-installation)

<!-- omit in toc -->

#### soon-fetch

**极轻量的请求库，不到 3K**

> - 🌐 自动解析 rest Url 的参数
> - ⭐ 快捷定义请求 api
> - ⌛ 超时断开
> - 🔤 自动处理 JSON
> - 📏 不到 **3K** , zip 后会更小
> - 💡 用 typescript 有智能类型提醒

- [示例](#示例)

- [特别功能](#特别功能)

  - [快捷方法](#快捷方法)
  - [Restful Url 参数自动处理](#restful-url-参数自动处理)
  - [超时](#超时)
  - [快速定义 API](#快速定义-api)

- [API](#api-1)
- [支持一下](#支持一下)

### 示例

> [github: soon-admin-vue3 ](https://github.com/leafio/soon-admin-vue3)  
> [github: soon-admin-react-nextjs ](https://github.com/leafio/soon-admin-react-nextjs)

```typescript
const request = <T>(url: string, options?: SoonOptions) => {
  const [_url, _options] = parseUrlOptions({
    url,
    options,
    baseURL: "/api",
    baseOptions: {
      timeout: 20 * 1000,
      headers: { Authorization: localStorage.getItem("token") ?? "" },
    },
  });

  return fetch(_url, _options).then((res) => res.json() as T);
};

const soon = createSoon(request);

/** GET */
soon.get("/user?id=123");
soon.get("/user", { query: { id: 123 } });
soon.get("/user/:id", { params: { id: 123 } });

/** POST */
soon.post("/login", { body: { username: "admin", password: "123456" } });

/**定义 API */
export const login = soon
  .API("/user/login")
  .POST<{ username: string; password: string }, { token: string }>();

login({ username: "admin", password: "123" }).then((res) => {
  localStorage.setItem("token", res.token);
});
```

### 特别功能

##### 快捷方法

```typescript
soon.get(url, options);
soon.post(url, options);
soon.put(url, options);
soon.patch(url, options);
soon.delete(url, options);
soon.head(url, options);
soon.options(url, options);
```

###### Restful Url 参数自动处理

url 包含 /:key 会解析匹配 key

```typescript
soon.get("/api/user/:id", { params: { id: 1 } });
// api/user/1
soon.get("/api/:job/:year", { params: { job: "engineer", year: 5 } });
//api/engineer/5
```

##### 超时

```typescript
//** 请求级超时, 会覆盖实例级超时  */
soon.get(url, { timeout: 1000 * 20 });
```

##### 快速定义 API

```typescript
  //可以是 GET POST PATCH PUT DELETE
  //GET 请求数据传递至query,其他方法请求数据传递至body
  soon.API(url:string).POST<RequestType,ResponseType>()

  //定义一个api
 export const getUserInfo=soon.API('/user/:id').GET()
  //使用
  getUserInfo({id:2}).then(res=>console.log(res))

  //用typescript,
 export const login=soon.API('/user/login')
    .POST<{username:string,password:string},{token:string}>()
 //开发工具会有请求和响应的智能提醒
  login({username:'admin',password:'123'}).then(res=>{
    localStorage.setItem('token', res.token);
  })
```

### API

#### parseUrlOptions

`parseUrlOptions` 源码如下:

```ts
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
```

如有特殊需要，可以根据下方的函数定制你自己的解析函数来替代 `parseUrlOptions`:
`mergeHeaders`, `mergeSignals`, `mergeUrl`, `isBodyJson`

### 支持一下

喜欢 soon-fetch 的话 , 在 github 上给个 **star** 吧.
GitHub: https://github.com/leafio/soon-fetch

> Email: leafnote@outlook.com

[English](#soon-fetch) | [中文](#soon-fetch-1) | [Installation](#安装-installation)

<!-- omit in toc -->

##### 安装 Installation

```bash
    npm install soon-fetch
```
