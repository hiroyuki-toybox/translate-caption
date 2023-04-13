type Header = string;

type Cap = {
  id: string;
  start: string;
  end: string;
  text: string;
  isSentenceEnd: boolean;
};

type VttAst = {
  header: Header;
  caps: Cap[];
};

const getVttAst = (vtt: string): VttAst => {
  const [header, ...rest] = vtt.split("\n");

  const caps: Cap[] = [];

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

const ast2Text = (ast: VttAst): string => {
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

const translate = async (text: string, target = "JA"): Promise<string> => {
  return "";
  new Promise((r) => setTimeout(r, 1000));
  const res = await fetch("https://api-free.deepl.com/v2/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `text=${text}&target_lang=${target}`,
  });

  const json = await res.json();

  return json.translations[0].text;
};

// 一つの文に結合する
const joinCaps = (vttAst: VttAst): VttAst => {
  const { caps } = vttAst;

  const newCaps: Cap[] = [];

  let inTheSentence = false;
  let start: string = "";
  let sentenceTexts: string[] = [];
  let idNum = 1;

  for (let i = 0; i < caps.length; i++) {
    const cap = caps[i];

    // 文章の開始位置の時
    // ピリオドがなくて、inTheSentenceがfalseの時
    if (!cap.isSentenceEnd && !inTheSentence) {
      // 文章の途中フラグ
      inTheSentence = true;
      // 開始位置を保持
      start = cap.start;
      // テキストを保持
      sentenceTexts.push(cap.text);
      continue;
    }
    // 文章の途中の時
    if (!cap.isSentenceEnd && inTheSentence) {
      // テキストを保持
      sentenceTexts.push(cap.text);
      continue;
    }
    // 文章の終了位置の時
    if (cap.isSentenceEnd && inTheSentence) {
      // 文章の途中フラグ
      inTheSentence = false;
      // テキストを保持
      sentenceTexts.push(cap.text);
      // 文章を結合
      const text = sentenceTexts.join(" ");
      // 文章を保持
      newCaps.push({ ...cap, id: idNum.toString(), start, text });
      // 文章を初期化
      sentenceTexts = [];
      // idを進める
      idNum++;
      continue;
    }
    // 文章が完結してる時
    if (cap.isSentenceEnd && !inTheSentence) {
      // そのまま
      newCaps.push({
        ...cap,
        id: idNum.toString(),
      });
      // idを進める
      idNum++;
      continue;
    }
    throw new Error("ここは来ないはず");
  }

  return {
    ...vttAst,
    caps: newCaps,
  };
};

const translateAst = async (ast: VttAst): Promise<VttAst> => {
  const { header, caps } = ast;
  const newCaps: Cap[] = [];

  for (const cap of caps) {
    const { text, ...rest } = cap;

    const newText = await translate(text);

    newCaps.push({ text: newText, ...rest });
  }

  return {
    header,
    caps: newCaps,
  };
};

const main = async () => {
  const ast = getVttAst("");
  console.log(ast);

  // const joinedAst = joinCaps(ast);
  // const translated = await translateAst(joinedAst);
  // console.log(translated);

  // const text = ast2Text(translated);
  // console.log(text);
};

main();
