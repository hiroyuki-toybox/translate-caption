"use strict";

const getFile = async (fileName: string) => {
  const path = chrome.runtime.getURL(fileName);
  const response = await fetch(path);
  const json = await response.json();
  return json;
};

const time2sec = (time: string) => {
  const [h, m, s] = time.split(":").map((n) => Number(n));
  return h * 60 * 60 + m * 60 + s;
};

const getTranslatedTranscriptJson = async () => {
  const pageUrl = window.location.href;
  const [_, contentsName, courseName] = pageUrl.split("/").reverse();
  const fileName = `json/${courseName}/${contentsName}.json`;
  const jaAst = (await getFile(fileName)) as {
    caps: { start: string; end: string; text: string }[];
  };

  return jaAst;
};

const main = async () => {
  const videoContainer = document.querySelector("#vjs_video_3");
  const video = document.querySelector("video");
  if (videoContainer == null) return;

  const jaAst = await getTranslatedTranscriptJson();

  const { caps } = jaAst;
  const p = document.createElement("p");
  const style: Partial<CSSStyleDeclaration> = {
    position: "absolute",
    bottom: "12%",
    width: "100%",
    textAlign: "center",
    fontSize: "17px",
    padding: "0 10%",
    lineHeight: "1.5em",
  };
  Object.assign(p.style, style);
  p.appendChild(document.createTextNode("Hello World"));
  videoContainer.appendChild(p);

  video?.addEventListener("timeupdate", function () {
    const currentSec = video.currentTime;
    const currentCaption = caps.find((cap) => {
      const startSec = time2sec(cap.start);
      const endSec = time2sec(cap.end);
      return startSec <= currentSec && currentSec <= endSec;
    });
    if (currentCaption == null) return;
    const text = currentCaption.text;
    p.textContent = text;
  });
};

main();
