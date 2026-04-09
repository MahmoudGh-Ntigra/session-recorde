chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "DOWNLOAD") {
        chrome.downloads.download({
            url: msg.url,
            filename: msg.filename
        });
    }
});