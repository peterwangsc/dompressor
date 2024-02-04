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

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("content.js received message");
  console.log(request);

  if (request.action === "compress-dom") {
    sendResponse({
      message: jsonToHtml(removeIrrelevant(domToJson(document.body))),
    });
  }
});
