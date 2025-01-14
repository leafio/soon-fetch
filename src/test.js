import { createShortMethods, createSoon, parseUrlOptions } from "."


const soon0 = createSoon((url, options) =>
    fetch(...parseUrlOptions({ url, options }))
)
const fun = soon0.API("/test").GET()
soon0.get("/")

const soon2 = createSoon((url, options2) =>
    fetch(...parseUrlOptions({ url, options: options2 })).then((res) => res.json())
)
const fun2 = soon2.API("/test/:id").GET()
const zz=soon2.get("/")





