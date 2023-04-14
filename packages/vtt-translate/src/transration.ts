import type { VttAst, Cap } from "vtt-ast";

const translate = async (text: string, target = "JA"): Promise<string> => {
  if (process.env.DEEPL_API_KEY === undefined) {
    throw new Error("DEEPL_API_KEY is not defined");
  }
  const res = await fetch("https://api-free.deepl.com/v2/translate", {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `text=${text}&target_lang=${target}`,
  });

  const json = await res.json();

  return json.translations[0].text;
};

export const joinSentences = (vttAst: VttAst): VttAst => {
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

export const translateVttAst = async (ast: VttAst): Promise<VttAst> => {
  const { header, caps } = ast;
  const newCaps: Cap[] = [];

  for (const cap of caps) {
    const { text, ...rest } = cap;

    await new Promise((resolve) => setTimeout(resolve, 100));
    const newText = await translate(text);

    newCaps.push({ text: newText, ...rest });
  }

  return {
    header,
    caps: newCaps,
  };
};
