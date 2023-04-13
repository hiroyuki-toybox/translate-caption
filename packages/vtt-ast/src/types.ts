type Header = string;

export type Cap = {
  id: string;
  start: string;
  end: string;
  text: string;
  isSentenceEnd: boolean;
};

export type VttAst = {
  header: Header;
  caps: Cap[];
};
