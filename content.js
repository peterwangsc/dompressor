console.log("content.js loaded");

function notVisible(dom) {
  return (
    dom.tagName === "SCRIPT" ||
    dom.tagName === "NOSCRIPT" ||
    dom.tagName === "STYLE" ||
    dom.tagName === "LINK" ||
    dom.tagName === "META" ||
    (dom.style && dom.style.display === "none") ||
    (dom.style && dom.style.visibility === "hidden")
  );
}

function domToJson(dom) {
  var json = {};
  if (notVisible(dom)) {
    return null;
  }
  json["tag"] = dom.tagName;
  json["children"] = [];

  if (dom.nodeType === 3) {
    json["data"] = dom.data.trim();
    json["tag"] = "text";
    if (!json["data"]) {
      return null;
    }
    return json;
  }
  for (var i = 0; i < dom.childNodes.length; i++) {
    var child = domToJson(dom.childNodes[i]);
    if (child) {
      json["children"].push(child);
    }
  }
  return json;
}

function removeIrrelevant(json) {
  if (json.tag === "text") {
    return json;
  }
  var children = [];
  for (var i = 0; i < json.children.length; i++) {
    var child = removeIrrelevant(json.children[i]);
    if (child) {
      children.push(child);
    }
  }
  if (children.length === 0) {
    return null;
  }
  if (children.length === 1) {
    return children[0];
  }
  json.children = children;
  return json;
}

function jsonToHtml(json) {
  if (json.tag === "text") {
    return `{{${json.data}}}`;
  }
  var html = "<" + json.tag;
  if (json.tag === "img") {
    html += ' src="' + json.src + '"';
  }
  html += ">";
  for (var i = 0; i < json.children.length; i++) {
    html += jsonToHtml(json.children[i]);
  }
  html += "</" + json.tag + ">";
  return html;
}

function searchImages(doc) {
  return Array.from(doc.images)
    .map((img) => img.src)
    .concat(searchBackgroundImages(doc));
}

function searchBackgroundImages(doc) {
  const srcChecker = /url\(\s*?['"]?\s*?(\S+?)\s*?["']?\s*?\)/i;
  return Array.from(
    Array.from(doc.querySelectorAll("*")).reduce((collection, node) => {
      let prop = window
        .getComputedStyle(node, null)
        .getPropertyValue("background-image");
      let match = srcChecker.exec(prop);
      if (match) {
        collection.add(match[1]);
      }
      return collection;
    }, new Set())
  );
}

function searchIFrames(doc) {
  let iframeList = [];
  doc.querySelectorAll("iframe").forEach((iframe) => {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeList.push({
        message: jsonToHtml(removeIrrelevant(domToJson(iframeDoc))),
        // images: searchImages(iframeDoc),
        // iframes: searchIFrames(iframeDoc), is left out because... keep it simple
        // no one uses iframes anymore anyways, now that i'm searching for them,
        // it took me a while to find any on the web
      });
      console.log("pushed iframe");
    } catch (e) {
      // no-op
      console.log("errored iframe", e);
    }
  });
  return iframeList;
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("content.js received message");
  console.log(request);

  if (request.action === "compress-dom") {
    sendResponse({
      message: jsonToHtml(removeIrrelevant(domToJson(document.body))),
      images: searchImages(document),
      iframes: searchIFrames(document),
    });
  }
});
