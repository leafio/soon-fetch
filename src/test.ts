import { createSoon } from "../dist";

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
