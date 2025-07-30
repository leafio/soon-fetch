import { createSoon } from "../dist";

const soon = createSoon(
    () => ({}),
    ({ parsed }) =>
        () =>
            fetch(parsed.url, parsed.options).then((res) => res.json())
);
const fun = soon.GET("/test").Send();

const fun2 = soon.POST("/test/:id").Send();
const zz = soon.get("/");
