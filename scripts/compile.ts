import * as fs from "fs";
import process from "process";
import { Cell } from "ton-core";
import { compileFunc } from "@ton-community/func-js";
import {HEX_ARTIFACTS_FOLDER, SOURCE_FOLDER} from "../constants";

// Sanity check
const sourceFileName = process.argv[2];
if (!sourceFileName) {
  console.error("Please specify the contract that you want to compile"); 
  process.exit(1);
} else if (!fs.existsSync(`${SOURCE_FOLDER}/${sourceFileName}.fc`)){
  console.error(`File, ${sourceFileName}.fc is not present in ${SOURCE_FOLDER} folder. Please check the file name and try again.`); 
  process.exit(1);
}

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
