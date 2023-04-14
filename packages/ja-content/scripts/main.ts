import { readdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { joinSentences, translateVttAst } from "vtt-translate";
import { parseVttToAST } from "vtt-ast";
import dotenv from "dotenv";

const filePath = path.join(
  __dirname,
  "../transcripts/en-US/2023-01-23-react-performance"
);

const main = async () => {
  dotenv.config();
  try {
    const files = await readdir(filePath);
    for (const file of files) {
      if (!file.endsWith(".vtt")) continue;
      const contentsName = file.slice(file.indexOf("-") + 1, file.indexOf("."));
      console.log(contentsName + " is processing...");

      const content = await readFile(path.join(filePath, file), "utf-8");
      const ast = parseVttToAST(content);
      const joined = joinSentences(ast);
      const translated = await translateVttAst(joined);
      const savePath = path.join(
        __dirname,
        "../json/react-performance/",
        `${contentsName}.json`
      );
      await writeFile(savePath, JSON.stringify(translated));
    }
  } catch (err) {
    console.error(err);
  }
};

main();
