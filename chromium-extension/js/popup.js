let excludeOnce = document.getElementById('excludeOnce');
let excludeDomain = document.getElementById('excludeCurrentDomain');
let includeDomain = document.getElementById('includeCurrentDomain');
let start = document.getElementById('start');
let stop = document.getElementById('stop');

function checkPluginButtons() {
    chrome.storage.sync.get('dontStop', function(data) {
        if (data.dontStop) {
            start.style = 'display: none';
            stop.style = 'display: block';
        } else {
            start.style = 'display: block';
            stop.style = 'display: none';
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
            for (var i = list.length-1; i >= 0; i--) {
                if (list[i] === currentTabOrigin) {
                    currentDomainIsExcluded = true;
                    break;
                }
            }
            if (currentDomainIsExcluded) {
                excludeDomain.style = 'display: none';
                includeDomain.style = 'display: block';
            } else {
                excludeDomain.style = 'display: block';
                includeDomain.style = 'display: none';
            }
        });
    });
}

start.onclick = function() {
    chrome.storage.sync.set({ dontStop: true }, function(data) {
    });
    checkPluginButtons();
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
    });
};

stop.onclick = function() {
    chrome.storage.sync.set({ dontStop: false }, function(data) {
    });
    checkPluginButtons();
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
    });
};

excludeDomain.onclick = function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.storage.sync.get('excludedDomains', function(data) {
            let list = data.excludedDomains;
            if (!list) {
                list = [];
            }
            let foo = new URL(tabs[0].url);
            list.push(new URL(tabs[0].url).origin);
            chrome.storage.sync.set({ excludedDomains: list});
            checkDomainButtons();
            chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
        });
    });
};

includeDomain.onclick = function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.storage.sync.get('excludedDomains', function(data) {
            let list = data.excludedDomains;
            if (!list) {
                list = [];
            }
            const currentTabOrigin = new URL(tabs[0].url).origin;
            for (var i = list.length-1; i >= 0; i--) {
                if (list[i] === currentTabOrigin) {
                    list.splice(i, 1);
                }
            }

            chrome.storage.sync.set({ excludedDomains: list});
            checkDomainButtons();
            chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
        });
    });
};

excludeOnce.onclick = function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.storage.sync.set( { excludeOnce: true});
        chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
    });
};

checkPluginButtons();
checkDomainButtons();