import * as fs from "fs";
import process from "process";
import { Cell } from "ton-core";
import { compileFunc } from "@ton-community/func-js";
import {HEX_ARTIFACTS_FOLDER, SOURCE_FOLDER} from "../constants";

const sourceFileName = process.argv[2];

async function compileScript() {
    console.log("Compiling contract: ", `${sourceFileName}.fc`);

  // Compile source file
  const compileResult = await compileFunc({
    targets: [`${SOURCE_FOLDER}/${sourceFileName}.fc`],
    sources: (x) => fs.readFileSync(x).toString("utf-8"),
  });
  if (compileResult.status === "error") {
    console.error("Compilation Error: ", compileResult.message);
    process.exit(1);
  }

  // Save compiled code in hex format
  const cellBoc = Cell.fromBoc(Buffer.from(compileResult.codeBoc, "base64"))[0]
    .toBoc()
    .toString("hex");
  if (!fs.existsSync(HEX_ARTIFACTS_FOLDER)) {
    fs.mkdirSync(HEX_ARTIFACTS_FOLDER);
  }
  fs.writeFileSync(
    `${HEX_ARTIFACTS_FOLDER}/${sourceFileName}.compiled.json`,
    JSON.stringify({ hex: cellBoc })
  );

    console.log("Compilation successful");
    console.log("Compiled code saved in: ", `${HEX_ARTIFACTS_FOLDER}/${sourceFileName}.compiled.json`);
}
compileScript();
