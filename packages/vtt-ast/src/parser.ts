import { VttAst } from "./types";

export const parseVttToAST = (vtt: string): VttAst => {
  const [header, ...rest] = vtt.split("\n");

  const caps: VttAst["caps"] = [];

  for (let i = 0; i < rest.length; i++) {
    const line = rest[i];

    if (line === "") {
      continue;
    }

    const id = line;
    const time = rest[++i];
    const [start, end] = time.split(" --> ");
    const texts: string[] = [];
    while (rest[++i] !== "") {
      texts.push(rest[i]);
    }
    const text = texts.join(" ");
    caps.push({
      id,
      start,
      end,
      text,
      isSentenceEnd:
        text.endsWith(".") || text.endsWith("?") || text.endsWith("!"),
    });
  }

  return {
    header,
    caps,
  };
};

export const parseASTToVtt = (ast: VttAst): string => {
  const { header, caps } = ast;
  const lines = [header];

  for (const cap of caps) {
    lines.push("");
    lines.push(cap.id);
    lines.push(`${cap.start} --> ${cap.end}`);
    lines.push(cap.text);
  }

  return lines.join("\n");
};
