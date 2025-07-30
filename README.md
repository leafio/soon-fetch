[English](#soon-fetch) | [中文](#soon-fetch-1) | [Installation](#安装-installation)

<!-- omit in toc -->

### soon-fetch

**A lightweight http request lib , alternative to axios with timeout, request reusing, race, response cache ...**

> - 🌐 automatic parse restful api url parameters
> - ⭐ rapid define a request api
> - ⌛ timeout disconnect
> - 📦 request reusing
> - 🚀 request race
> - 📝 response cache
> - 🔤 automatic serialization of JSON
> - 📏 .min size less than **5K**, smaller after zip
> - 💡 smart type tips with Typescript

- [Example](#example)
- [Features](#features)
  - [Shortcut](#shortcut)
  - [Restful Url Params](#restful-url-params)
  - [Timeout](#timeout)
  - [Share pending request](#share-pending-request)
  - [Response cache](#response-cache)
  - [Request race](#request-race)
  - [Rapid Define APIs](#rapid-define-apis)
- [API](#api)

### Example

> [github: soon-admin-vue3 ](https://github.com/leafio/soon-admin-vue3)  
> [github: soon-admin-react-nextjs ](https://github.com/leafio/soon-admin-react-nextjs)

```typescript
import { createSoon } from "soon-fetch";

const soon = createSoon(
  (url, options) => {
    const isGet = !options?.method || options?.method.toLocaleLowerCase() === "get"
    return {
      baseURL: '/api',
      baseOptions: {
        timeout: 20 * 1000,
        headers: new Headers({
          Authorization: "Bearer " + localStorage.getItem("token"),
        }),
        share: isGet ? true : false,
        staleTime: isGet ? 2 * 1000 : 0,
      },
    }
  },
  ({ parsed }) => {
    return <T>() => {
      return fetch(parsed.url, parsed.options).then((res) =>
        res.json()
      ) as Promise<T>;
    };
  }
);

/** GET */
soon.get("/user?id=123");
soon.get("/user", { query: { id: 123 } });
soon.get("/user/:id", { params: { id: 123 } });

/** POST */
soon.post("/login", { body: { username: "admin", password: "123456" } });

/**Define API */
export const login = soon
  .POST("/user/login")
  .Body<{ username: string; password: string }>()
  .Send<{ token: string }>();
//the develop tools will have type tips for request and response
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

##### Share pending request

If a request is made again before the first completes, will reuse the first request instead of making a new request.

```ts
soon.get(url, { share: true });
```

##### Response cache

A cached response will be returned if the request is made again within the specified time.

```ts
soon.get(url, { staleTime: 1000 * 60 * 5 });
```

##### Request race

‌If a second request is made before the first completes, abort the first to avoid race conditions from out-of-order responses.

```tsx
import { useEffect, useRef, useState } from "react";

type User = { name: string; job: string };
const api = soon.GET("/api/users").Query<{ page: number }>().Send<User[]>();
export default function App() {
  const refAbort = useRef([]);
  const [list, setList] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  useEffect(() => {
    api({ page }, { aborts: refAbort.current })
      .then(setList)
      .catch(console.log);
  }, [page]);
  return (
    <div>
      <button onClick={() => setPage((pre) => pre + 1)}>next</button>
      <div>
        {list.map((item) => (
          <div key={item.name}>{item.name}</div>
        ))}
      </div>
    </div>
  );
}
```

##### Rapid Define APIs

```typescript
//can be GET POST PATCH PUT DELETE
  soon.GET(url:string).Query<Query>().Send<Response>()
  soon.POST(url:string).Body<Body>().Send<Response>()
//define an api
export const getUserInfo = soon.GET("/user/:id").Send();
//then use in any where
getUserInfo({ id: 2 }).then((res) => console.log(res));

//with typescript,
export const login = soon
  .POST("/user/login")
  .Body<{ username: string; password: string }>()
  .Send<{ token: string }>();
//the develop tools will have type tips for request and response
login({ username: "admin", password: "123" }).then((res) => {
  localStorage.setItem("token", res.token);
});
```

### API

#### SoonOptions

```ts
// function fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>
// RequestInit  is fetch's init options
type SoonOptions = Omit<RequestInit, "body"> & {
  body?: RequestInit["body"] | object;
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
  aborts?: AbortController[] | never[];
  share?: boolean;
  staleTime?: number;
};
```

[English](#soon-fetch) | [中文](#soon-fetch-1) | [Installation](#安装-installation)

<!-- omit in toc -->

#### soon-fetch

**极轻量的请求库，不到 5K**

> - 🌐 自动解析 rest Url 的参数
> - ⭐ 快捷定义请求 api
> - ⌛ 超时断开
> - 📦 请求复用
> - 🚀 请求竞态
> - 📝 响应缓存
> - 🔤 自动处理 JSON
> - 📏 不到 **5K** , zip 后会更小
> - 💡 用 typescript 有智能类型提醒

- [示例](#示例)

- [特别功能](#特别功能)

  - [快捷方法](#快捷方法)
  - [Restful Url 参数自动处理](#restful-url-参数自动处理)
  - [共享未完成的请求](#共享未完成的请求)
  - [超时](#超时)
  - [响应缓存](#响应缓存)
  - [请求竞态](#请求竞态)
  - [快速定义 API](#快速定义-api)

- [API](#api-1)

### 示例

> [github: soon-admin-vue3 ](https://github.com/leafio/soon-admin-vue3)  
> [github: soon-admin-react-nextjs ](https://github.com/leafio/soon-admin-react-nextjs)

```typescript
const soon = createSoon(
  (url, options) => {
    const isGet = !options?.method || options?.method.toLocaleLowerCase() === "get"
    return {
      baseURL: '/api',
      baseOptions: {
        timeout: 20 * 1000,
        headers: new Headers({
          Authorization: "Bearer " + localStorage.getItem("token"),
        }),
        share: isGet ? true : false,
        staleTime: isGet ? 2 * 1000 : 0,
      },
    }
  },
  ({ parsed }) => {
    return <T>() => {
      return fetch(parsed.url, parsed.options).then((res) =>
        res.json()
      ) as Promise<T>;
    };
  }
);

/** GET */
soon.get("/user?id=123");
soon.get("/user", { query: { id: 123 } });
soon.get("/user/:id", { params: { id: 123 } });

/** POST */
soon.post("/login", { body: { username: "admin", password: "123456" } });

/**定义 API */
export const login = soon
  .POST("/user/login")
  .Body<{ username: string; password: string }>()
  .Send<{ token: string }>();

//开发工具会有请求和响应的智能提醒
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

##### 共享未完成的请求

如果在第一个请求完成之前再次发起相同的请求，则会复用第一个请求，而不是发起新的请求。

```ts
soon.get(url, { share: true });
```

##### 响应缓存

如果在指定时间内再次发起相同的请求，则会返回缓存的响应。

```ts
soon.get(url, { staleTime: 1000 * 60 * 5 });
```

##### 请求竞态

如果在第一个请求完成之前发起第二个请求，则会中止第一个请求，以避免因响应顺序错乱导致的问题。

```tsx
import { useEffect, useRef, useState } from "react";

type User = { name: string; job: string };
const api = soon.GET("/api/users").Query<{ page: number }>().Send<User[]>();
export default function App() {
  const refAbort = useRef([]);
  const [list, setList] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  useEffect(() => {
    api({ page }, { aborts: refAbort.current })
      .then(setList)
      .catch(console.log);
  }, [page]);
  return (
    <div>
      <button onClick={() => setPage((pre) => pre + 1)}>next</button>
      <div>
        {list.map((item) => (
          <div key={item.name}>{item.name}</div>
        ))}
      </div>
    </div>
  );
}
```

##### 快速定义 API

```ts
  //可以是 GET POST PATCH PUT DELETE
  //GET 请求数据传递至query,其他方法请求数据传递至body
  soon.GET(url:string).Query<Query>().Send<Response>()
  soon.POST(url:string).Body<Body>().Send<Response>()

  //定义一个api
 export const getUserInfo=soon.GET('/user/:id').Send()
  //使用
  getUserInfo({id:2}).then(res=>console.log(res))

  //用typescript,
 export const login=soon
  .POST('/user/login')
  .Body<{username:string,password:string}>()
  .Send<{token:string}>()
 //开发工具会有请求和响应的智能提醒
  login({username:'admin',password:'123'}).then(res=>{
    localStorage.setItem('token', res.token);
  })
```

### API

#### SoonOptions

```ts
// function fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>
// RequestInit  为原生 fetch 的 init 选项
type SoonOptions = Omit<RequestInit, "body"> & {
  body?: RequestInit["body"] | object;
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
  aborts?: AbortController[] | never[];
  share?: boolean;
  staleTime?: number;
};
```

[English](#soon-fetch) | [中文](#soon-fetch-1) | [Installation](#安装-installation)

<!-- omit in toc -->

##### 安装 Installation

```bash
    npm install soon-fetch
```
