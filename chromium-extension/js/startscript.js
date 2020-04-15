const defaultBackgroundColor = '#282A36';
let pluginEnabled = false;

chrome.storage.sync.get(['dontStop', 'excludedDomains', 'excludeOnce', 'timedStart','timeFrom','timeTo'], function(data) {
    pluginEnabled = checkPluginEnabled(data);
    if (pluginEnabled) {
        setLoader();
    }
});

const checkPluginEnabled = (data) => {
    if (!data || typeof data.dontStop === 'undefined') data = { dontStop: true };
    chrome.storage.sync.set({ excludeOnce: false});
    let dateFromHour, dateFromMins, dateToHour, dateToMins, nowFromTo, nowHours, now;
    if (data.timedStart && data.timeFrom && data.timeTo) {
        dateFromHour = parseInt(data.timeFrom.split(':')[0], 10);
        dateFromMins = parseInt(data.timeFrom.split(':')[1], 10);
        dateToHour = parseInt(data.timeTo.split(':')[0], 10);
        if (dateToHour === 0) {
            dateToHour = 24;
        }
        dateToMins = parseInt(data.timeTo.split(':')[1], 10);
        now = new Date();
        nowFromTo = new Date();
        nowHours = now.getHours();
    }

    if (!data.excludeOnce && 
        data.dontStop && 
        (!data.excludedDomains || !data.excludedDomains.includes(window.location.origin)) &&
        (!data.timedStart || ( // ToDo fix when dateToHour >= dateFromHour
                (dateToHour >= dateFromHour ? 
                    now >= nowFromTo.setHours(dateFromHour, dateFromMins) : 
                    nowHours <= dateToHour || now >= nowFromTo.setHours(dateFromHour, dateFromMins)
                ) &&
                (dateToHour >= dateFromHour ? 
                    now <= nowFromTo.setHours(dateToHour, dateToMins) : 
                    nowHours >= dateFromHour || now <= nowFromTo.setHours(dateToHour, dateToMins)
                )
            )
        )) {
        return true;
    }
    return false;
}

const setLoader = () => {
    var loaderStyle = document.documentElement.appendChild(document.createElement('style'));
    loaderStyle.setAttribute('id', 'darkify-loader');
    loaderStyle.textContent = `head {
        display:block!important;
        top:0!important;
        left:0!important;
        position:fixed!important;
        width:100%!important;
        height:100%!important;
        opacity:0.95!important;
        z-index:2147483647!important;
        background:${defaultBackgroundColor}!important
    }`;
    
}