let excludeOnce = document.getElementById('excludeOnce');
let switchCurrentDomain = document.getElementById('switchCurrentDomain');
let switchPlugin = document.getElementById('switchPlugin');
let currentDomain = document.getElementById('currentDomain');

function checkPluginButtons() {
    chrome.storage.sync.get('dontStop', function(data) {
        if (typeof data.dontStop === 'undefined' || data.dontStop) {
            switchPlugin.checked = true;
        } else {
            switchPlugin.checked = false;
        }
    });
}

function checkDomainButtons() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.storage.sync.get('excludedDomains', function(data) {
            let list = data.excludedDomains;
            if (!list) {
                list = [];
            }
            currentDomainIsExcluded = false;
            const currentTabOrigin = new URL(tabs[0].url).origin;
            currentDomain.innerHTML = currentTabOrigin;
            for (var i = list.length-1; i >= 0; i--) {
                if (list[i] === currentTabOrigin) {
                    currentDomainIsExcluded = true;
                    break;
                }
            }
            if (currentDomainIsExcluded) {
                switchCurrentDomain.checked = false;
            } else {
                switchCurrentDomain.checked = true;
            }
        });
    });
}

switchPlugin.onclick = function() {
    chrome.storage.sync.get('dontStop', function(data) {
        if (typeof data.dontStop === 'undefined') {
            data.dontStop = true;
        }

        chrome.storage.sync.set({ dontStop: !data.dontStop }, function(data) {
        });
        checkPluginButtons();
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
        });
    });
};

switchCurrentDomain.onclick = function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.storage.sync.get('excludedDomains', function(data) {
            let list = data.excludedDomains;
            let removed = false;
            if (!list) {
                list = [];
            }

            const currentTabOrigin = new URL(tabs[0].url).origin;
            for (var i = list.length-1; i >= 0; i--) {
                if (list[i] === currentTabOrigin) {
                    list.splice(i, 1);
                    removed = true;
                }
            }
            if (!removed) {
                list.push(new URL(tabs[0].url).origin);
            }
            chrome.storage.sync.set({ excludedDomains: list});
            chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
        });
    });
};

excludeOnce.onclick = function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.storage.sync.set( { excludeOnce: true});
        excludeOnce.checked = false;
        chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
    });
};

checkPluginButtons();
checkDomainButtons();