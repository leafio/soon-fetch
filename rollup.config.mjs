import resolve from "@rollup/plugin-node-resolve"
import babel from "@rollup/plugin-babel"
import commonjs from "rollup-plugin-commonjs"
import typescript from "rollup-plugin-typescript"
import dts from "rollup-plugin-dts"
import terser from "@rollup/plugin-terser"
const pkgName = "index"
const banner = ""
export default [
    {
        input: "src/index.ts", // 打包入口
        output: [
            // {
            //   file: `dist/${pkgName}.umd.js`,
            //   format: 'umd',
            //   name: pkgName,
            //   banner
            // },
            // {
            //   file: `dist/${pkgName}.umd.min.js`,
            //   format: 'umd',
            //   name: pkgName,
            //   banner,
            //   plugins: [terser()]
            // },
            {
                file: `dist/${pkgName}.cjs.js`,
                format: "cjs",
                name: pkgName,
                banner,
            },
            {
                file: `dist/${pkgName}.js`,
                format: "es",
                banner,
            },
        ],
        plugins: [
            // 打包插件
            resolve(), // 查找和打包node_modules中的第三方模块
            commonjs(), // 将 CommonJS 转换成 ES2015 模块供 Rollup 处理
            typescript(), // 解析TypeScript
            babel({ babelHelpers: "bundled" }), // babel配置,编译es6
            terser(),
        ],
    },
    {
        input: "src/index.ts",
        plugins: [dts()],
        output: {
            format: "esm",
            file: "dist/index.d.ts",
        },
    },
]
