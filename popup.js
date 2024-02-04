function run() {
  console.log("run from popup.js");
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "compress-dom" },
      function (response) {
        console.log("content responded with: ", response.message);
        // send response to LLM
      }
    );
  });
}

document.getElementById("compress-dom").addEventListener("click", run);
