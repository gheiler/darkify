const timedStart = document.getElementById('timedStart');
const timeFrom = document.getElementById('timeFrom');
const timeTo = document.getElementById('timeTo');

timedStart.addEventListener('change', function() {
    if (this.checked) {
        chrome.storage.sync.set({ timedStart: true });
        chrome.storage.sync.set({ timeFrom: timeFrom.value });
        chrome.storage.sync.set({ timeTo: timeTo.value });
    } else {
        chrome.storage.sync.set({ timedStart: false });
    }
});

timeFrom.addEventListener('input', function() {
    if (this.value === '') {
        this.value = '00:00';
    }
    chrome.storage.sync.set({ timeFrom: this.value });
});

timeTo.addEventListener('input', function() {
    if (this.value === '') {
        this.value = '00:00';
    }
    chrome.storage.sync.set({ timeTo: this.value });
});

chrome.storage.sync.get(['timedStart','timeFrom','timeTo'], function (data) {
    if (data.timedStart) {
        timedStart.checked = true;
    }
    if (data.timeFrom) {
        timeFrom.value = data.timeFrom;
    }
    if (data.timeTo) {
        timeTo.value = data.timeTo;
    }
});