import { createShortMethods, createSoon, parseUrlOptions } from "."
import { SoonOptions } from "./types"

const request = <T = any>(url: string, options?: SoonOptions & { name?: string }) => {
    // _url : url handled with baseURL , options.query , options.params
    // _options: 1. merge baseOptions and options,
    //           2. transfer merged options from SoonOptions to raw fetch options
    //           3. json object body would be auto stringified and add  header { "Content-Type": "application/json" }
    const [_url, _options] = parseUrlOptions({
        url,
        options,
        baseURL: "/api",
        baseOptions: {
            // would override by options.timeout
            timeout: 20 * 1000,
            // would merged with options.headers 
            // the same-key header would  override by  options.headers
            headers: { Authorization: localStorage.getItem("token") ?? "" },
        },
    })

    return fetch(_url, _options).then((res) => res.json() as T)
}
// create shortcut methods and API-Define function for request
const soon = createSoon(request)

const getInfo = soon.API("/get").GET()
const x = soon.get<{ id: string }>("/")
const soon0 = createSoon((url, options?) =>
    fetch(...parseUrlOptions({ url, options }))
)
const fun = soon0.API("/test").GET<{ id: string }>()
soon0.get("/")

const soon2 = createSoon((url, options2?) =>
    fetch(...parseUrlOptions({ url, options: options2 })).then((res) => res.json())
)
const fun2 = soon2.API("/test").GET<{ id: string }>()
const zz=soon2.get("/")

type MyOptions = SoonOptions & { hh?: string }
const request2 = (url: string, options?: MyOptions) =>
    fetch(...parseUrlOptions({ url, options })).then((res) => res.json())

const soon3 = createSoon(request2)
const fun3 = soon3.API("/test").GET<{ id: string }>()
soon3.get("/")

const moon = createShortMethods(["get", "post"] as const, request2)
moon.get("/")


type RR = typeof request2
type cc = Parameters<RR>
type OO = [url: string, options?: MyOptions]



type zzzz = Partial<OO>


// type A = [int: number, name: string];
// type B = [boolean, Date];
// type C = [...A, ...B]
// type TupleLast<T> =Required <T> extends [infer First, ...infer Rest] ? Rest : never
// type TupleFirst<T> = Required <T> extends [...infer Rest, infer Last] ? Rest : never
// export type ToOptionalOptionsRequest<T extends (...args: any) => any> =

//     (...args: [...TupleFirst<Parameters<T>>, ...Partial<TupleLast<Parameters<T>>>]) => ReturnType<T>

// type zz = (...args: [...TupleFirst<cc>, ...Partial<TupleLast<cc>>]) => ReturnType<RR>

// type yy = ToOptionalOptionsRequest<RR>
// type qq = [...TupleFirst<OO>]
// type yo = RR extends (...args: infer P) => infer R ? (...args: P) => R : never

// type TupleFirs2t =Required<OO> extends [...infer Rest, infer Last] ? Rest : never