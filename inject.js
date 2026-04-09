(function () {
    // منع التشغيل أكثر من مرة
    if (window.__RRWEB_RUNNING__) return;
    window.__RRWEB_RUNNING__ = true;

    const currentScript = document.currentScript;
    const rrwebUrl = currentScript.getAttribute("data-rrweb");

    // تحميل مكتبة rrweb
    const s = document.createElement("script");
    s.src = rrwebUrl;

    s.onload = () => {
        // بدء تسجيل الأحداث
        window.rrweb.record({
            maskAllInputs: true, // إخفاء البيانات الحساسة
            emit(event) {
                window.postMessage({ type: "RRWEB_EVENT", event }, "*");
            },
        });
    };

    document.head.appendChild(s);
})();