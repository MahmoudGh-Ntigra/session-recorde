let events = [];

// استقبال أحداث rrweb من inject.js
window.addEventListener("message", (event) => {
    if (event.source !== window) return;

    if (event.data?.type === "RRWEB_EVENT") {
        events.push(event.data.event);
    }
});

// التأكد من أنه لم يتم حقن السكربت مسبقًا
if (!window.__RRWEB_INJECTED__) {
    window.__RRWEB_INJECTED__ = true;

    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("inject.js");
    script.setAttribute("data-rrweb", chrome.runtime.getURL("lib/rrweb.min.js"));
    document.documentElement.appendChild(script);
}

// إرسال الأحداث كل دقيقة
setInterval(() => {
    if (events.length === 0) return;

    const blob = new Blob(
        [JSON.stringify({ timestamp: new Date().toISOString(), events })],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    chrome.runtime.sendMessage({
        type: "DOWNLOAD",
        url,
        filename: `session-${Date.now()}.json`,
    });

    // إعادة تعيين الأحداث
    events = [];
}, 20000);