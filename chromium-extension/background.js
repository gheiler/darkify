
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    chrome.tabs.insertCSS(tabId, { file: "css/extras.css" }, function() {
        console.log("extras was inserted successfully");
    });
    for (let i = 0; i < document.styleSheets.length; i++) {
        var sheet = document.styleSheets[i];
        console.log(sheet);
    }
});