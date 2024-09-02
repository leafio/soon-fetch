[English](#soon-fetch-is-a-lightweight-http-request-library-based-on-vanilla-fetch-with-typescript) | [中文](#soon-fetch-是用-ts-对原生-fetch-的轻量封装) | [Installation](#安装-installation)

<!-- omit in toc -->

##### `soon-fetch` is a lightweight http request library based on vanilla fetch with Typescript

> - 🌐 automatic parse restful api url parameters
> - ⭐ rapid define a request api
> - ⌛ timeout disconnect
> - 🔤 automatic parse or serialization of JSON
> - 📏 .min size less than **3K**, smaller after zip
> - 💡 smart type tips with Typescript

- [Example](#example)
- [API Reference](#api-reference)
  - [Create Instance](#create-instance)
  - [Request](#request)
  - [Response](#response)
- [Features](#features)
  - [Shortcut](#shortcut)
  - [Restful Url Params](#restful-url-params)
  - [Timeout](#timeout)
  - [Rapid Define APIs](#rapid-define-apis)
- [Support Me](#support-me)

### Example
> [github: soon-admin-vue3 ](https://github.com/leafio/soon-admin-vue3)

```typescript
export const soon = createSoon({
  baseURL: baseURL,
  defaultOptions:()=> ({
    timeout: 20 * 1000,
  }),
  beforeRequest: (options) => {
    options.headers.append(
      "Authorization",
      localStorage.getItem("token") ?? ""
    );
  },
  afterResponse: async (result,  resolve, reject ) => {
    const res = result.response;
    if (res) {
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (!contentType?.includes("json")) {
          resolve(res);
        } else {
          const body = await res.json();
          if (body.code === 0) {
            resolve(body.data);
          } else {
            console.log(res);
            toast.error(body.err);
            reject(res.body);
          }
        }
      } else if (res.status === 401) {
        localStorage.removeItem("token");
        location.href = "/login";
      }
      toast.error(res.statusText);
      reject();
    } else if (result.isTimeout) {
      toast.error("Timeout");
    } else if (result.error) {
      toast.error(result.error);
    }
  },
});

/** GET */
soon.get("/user?id=123").then((data) => console.log(data));
soon.get("/user", { query: { id: 123 } }).then((data) => console.log(data));
soon
  .get("/user/:id", { params: { id: 123 } })
  .then((data) => console.log(data));
/** POST */
soon
  .post("/login", { body: { username: "admin", password: "123456" } })
  .then((data) => console.log(data));

/**Define API */
export const login = soon
  .API("/user/login")
  .POST<{ username: string; password: string }, { token: string }>();

login({ username: "admin", password: "123" }).then((res) => {
  localStorage.setItem("token", res.token);
});
```

### API Reference

##### Create Instance

```typescript
import { createSoon } from "soon";

declare function createSoon<Options extends SoonOptions = SoonOptions>(
  soonInit?: SoonInit<Options>
);

// options would overwrite by order : defaultOptions ,request(url,options),beforeRequest(options)
export type SoonInit<Options> = {
  //**url prefix */
  baseURL?: string;
  /**the fetch http options */
  defaultOptions?:()=> Options;
  /** can modify the fetch options before been handled*/
  beforeRequest?: (options: Options & { headers: Headers }) => void;
  /** can modify the response after fetched and promise resolved */
  afterResponse?: (result: SoonResult<Options>, resolve: (value: any) => void, reject: (reason?: any) => void) => Promise<void>;
};
```

##### Request

```typescript
soon.request(url[,options])
```

Request data can choose `query` `params` `body` for easy specification

```typescript
type SoonOptions = {
  /** url search params like  `api/info?name=yes`  {name:"yes"} passed here*/
  query?:
    | Record<
        string,
        string | number | boolean | string[] | number[] | null | undefined
      >
    | URLSearchParams;
  /** url rest params like `api/info/:id`  {id:1} passed here*/
  params?: Record<string, string | number>;
  /** unit ms */
  timeout?: number;
  /*****   vanilla fetch props  *****/
  //body can pass json without stringified
  body?: any;
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
  mode?: "cors" | "no-cors" | "same-origin";
  cache?: "default" | "no-cache" | "reload" | "force-cache" | "only-if-cached";
  credentials?: "include" | "same-origin" | "omit";
  headers?: Headers;
  redirect?: "manual" | "follow" | "error";
  referrerPolicy?:
    | "no-referrer"
    | "no-referrer-when-downgrade"
    | "origin"
    | "origin-when-cross-origin"
    | "same-origin"
    | "strict-origin"
    | "strict-origin-when-cross-origin"
    | "unsafe-url";
  integrity?: string;
};
```

##### Response

Default : return raw fetch Response , you can customize it in afterResponse params of createSoon

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
  getUserInfo({id:2})
    .then(res=>console.log(res))
    .catch(err=>console.log(err))

  //with typescript,
 export const login=soon.API('/user/login')
    .POST<{username:string,password:string},{token:string}>()
 //the develop tools will have type tips for request and response
  login({username:'admin',password:'123'}).then(res=>{
    localStorage.setItem('token', res.token);
  })
```

### Support Me

If you like this library , you can give a **start** on github.  
Email: leafnote@outlook.com

> I'm looking for a frontend job in Shanghai , hope someone could find a offer for me.

[English](#soon-fetch-is-a-lightweight-http-request-library-based-on-vanilla-fetch-with-typescript) | [中文](#soon-fetch-是用-ts-对原生-fetch-的轻量封装) | [Installation](#安装-installation)

<!-- omit in toc -->

##### soon-fetch 是用 ts 对原生 fetch 的轻量封装

> - 🌐 自动解析 rest Url 的参数
> - ⭐ 快捷定义请求 api
> - ⌛ 超时断开
> - 🔤 自动处理 JSON
> - 📏 不到 **3K** , zip 后会更小
> - 💡 用 typescript 有智能类型提醒

- [示例](#示例)
- [API 参考](#api参考)

  - [创建实例](#创建实例)
  - [请求](#请求)
  - [响应](#响应)

- [特别功能](#特别功能)
  - [快捷方法](#快捷方法)
  - [Restful Url 参数自动处理](#restful-url-参数自动处理)
  - [超时](#超时)
  - [快速定义 API](#快速定义-api)
- [支持一下](#支持一下)

### 示例
> [github: soon-admin-vue3 ](https://github.com/leafio/soon-admin-vue3)
```typescript
export const soon = createSoon<SoonOptions>({
  baseURL: baseURL,
  defaultOptions:()=> ({
    timeout: 20 * 1000,
  }),
  beforeRequest: (options) => {
    options.headers.append(
      "Authorization",
      localStorage.getItem("token") ?? ""
    );
  },
  afterResponse: async (result,  resolve, reject ) => {
    const res = result.response;
    if (res) {
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (!contentType?.includes("json")) {
          resolve(res);
        } else {
          const body = await res.json();
          if (body.code === 0) {
            resolve(body.data);
          } else {
            console.log(res);
            toast.error(body.err);
            reject(res.body);
          }
        }
      } else if (res.status === 401) {
        localStorage.removeItem("token");
        location.href = "/login";
      }
      toast.error(res.statusText);
      reject();
    } else if (result.isTimeout) {
      toast.error("请求超时");
    } else if (result.error) {
      toast.error(result.error);
    }
  },
});

/** GET */
soon.get("/user?id=123").then((data) => console.log(data));
soon.get("/user", { query: { id: 123 } }).then((data) => console.log(data));
soon
  .get("/user/:id", { params: { id: 123 } })
  .then((data) => console.log(data));
/** POST */
soon
  .post("/login", { body: { username: "admin", password: "123456" } })
  .then((data) => console.log(data));

/**定义 API */
export const login = soon
  .API("/user/login")
  .POST<{ username: string; password: string }, { token: string }>();

login({ username: "admin", password: "123" }).then((res) => {
  localStorage.setItem("token", res.token);
});
```

### API 参考

##### 创建实例

```typescript
import { createSoon } from "soon";

declare function createSoon<Options extends SoonOptions = SoonOptions>(
  soonInit?: SoonInit<Options>
);

// options 依次被覆盖 defaultOptions ,request(url,options),beforeRequest(options)
export type SoonInit<Options> = {
  baseURL?: string;
  //默认的options
  defaultOptions?:()=> Options;
  //在请求前对options的处理
  beforeRequest?: (options: Options & { headers: Headers }) => void;
  //在请求后对Response的处理
  afterResponse?: (result: SoonResult<Options>, resolve: (value: any) => void, reject: (reason?: any) => void) => Promise<void>;
};
```

```typescript
export type SoonResult<Options> = {
  isTimeout: boolean;
  request: Request; //原生fetch的Request
  error?: any;
  response?: Response; //原生fetch的Response
  options: Options; //请求传递来的options
};
```

##### 请求

```typescript
soon.request(url[,options])
```

请求数据可以选择 _`query`_ _`params`_ _`body`_ ，易于传递。

```typescript
type SoonOptions = {
  /** url ？后的参数  `api/info?name=yes` 传递 {name:"yes"}*/
  query?:
    | Record<
        string,
        string | number | boolean | string[] | number[] | null | undefined
      >
    | URLSearchParams;
  /** rest风格url的请求参数 `api/info/:id` 传递 {id:1}*/
  params?: Record<string, string | number>;
  /** unit 毫秒 */
  timeout?: number;

  /*** 原生fetch 参数*/
  //可直接传递JSON而不必stringified
  body?: any;
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
  mode?: "cors" | "no-cors" | "same-origin";
  cache?: "default" | "no-cache" | "reload" | "force-cache" | "only-if-cached";
  credentials?: "include" | "same-origin" | "omit";
  headers?: Headers;
  redirect?: "manual" | "follow" | "error";
  referrerPolicy?:
    | "no-referrer"
    | "no-referrer-when-downgrade"
    | "origin"
    | "origin-when-cross-origin"
    | "same-origin"
    | "strict-origin"
    | "strict-origin-when-cross-origin"
    | "unsafe-url";
  integrity?: string;
};
```

##### 响应

默认为原生 fetch 的 Response ，可在 createSoon 的 afterResponse 里自定义处理 Response

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
  getUserInfo({id:2})
    .then(res=>console.log(res))
    .catch(err=>console.log(err))

  //用typescript,
 export const login=soon.API('/user/login')
    .POST<{username:string,password:string},{token:string}>()
 //开发工具会有请求和响应的智能提醒
  login({username:'admin',password:'123'}).then(res=>{
    localStorage.setItem('token', res.token);
  })
```
### 支持一下

喜欢soon-fetch的话 , 在github上给个 **star** 吧. 
Email: leafnote@outlook.com

> 我目前在找前端的工作，位置上海。有岗位机会的话，可以联系我。


[English](#soon-is-a-lightweight-http-request-library-based-on-vanilla-fetch-with-typescript) | [中文](#soon-是用-ts-对原生-fetch-的轻量封装)

<!-- omit in toc -->

##### 安装 Installation

```bash
    npm install soon-fetch
```
