import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";

const scriptArgs = {
  name: process.env.npm_package_name,
  version: process.env.npm_package_version,
  license: process.env.npm_package_license,
  repoUrl: "https://github.com/dettalant/" + process.env.npm_package_name,
}

const bannerComment = `/*!
 *   ${scriptArgs.name}.js
 * See {@link ${scriptArgs.repoUrl}}
 *
 * @author dettalant
 * @version v${scriptArgs.version}
 * @license ${scriptArgs.license} License
 */`;

const plugins = [
  typescript({
    useTsconfigDeclarationDir: true
  }),
];

let fileName = "./dist/index";
if (process.env.NODE_ENV === "production") {
  // for production build
  fileName += ".min";
  const terserOptions = {
    output: {
      comments: "some"
    }
  }

  plugins.push(terser(terserOptions));
}

export default {
  input: "./src/index.ts",
  output: {
    file: fileName + ".js",
    format: "esm",
    name: scriptArgs.name,
    banner: bannerComment,
    sourceMap: "inline",
  },
  plugins
};
