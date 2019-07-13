import typescript from "rollup-plugin-typescript2";
import buble from "rollup-plugin-buble";
import { uglify } from "rollup-plugin-uglify";


const scriptArgs = {
  name: process.env.npm_package_name,
  version: process.env.npm_package_version,
  license: process.env.npm_package_license,
  repoUrl: "https://github.com/dettalant/fc2_comment_avatar| dettalant/fc2_comment_avatar",
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
  typescript(),
  buble(),
];

let fileName = "./dist/index";
if (process.env.NODE_ENV === "production") {
  // for production build
  fileName += ".min";

  const uglifyArgs = {
    output: {
      comments: "some"
    }
  };

  plugins.push(uglify(uglifyArgs));
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
