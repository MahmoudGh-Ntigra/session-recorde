function captureNetwork() {
    const originalFetch = window.fetch;

    window.fetch = async function (...args) {
        const startTime = Date.now();
        const [input, init] = args;

        try {
            const response = await originalFetch.apply(this, args);
            const clone = response.clone();

            let responseBody = null;
            try {
                responseBody = await clone.text();
            } catch (e) { }

            window.postMessage({
                type: "RRWEB_EVENT",
                event: {
                    type: "custom",
                    timestamp: Date.now(),
                    data: {
                        source: "network",
                        method: (init && init.method) || "GET",
                        url: typeof input === "string" ? input : input.url,
                        status: response.status,
                        duration: Date.now() - startTime,
                        response: responseBody?.slice(0, 1000) // limit size
                    }
                }
            }, "*");

            return response;
        } catch (error) {
            window.postMessage({
                type: "RRWEB_EVENT",
                timestamp: Date.now(),
                event: {
                    type: "custom",
                    data: {
                        source: "network",
                        method: (init && init.method) || "GET",
                        url: typeof input === "string" ? input : input.url,
                        error: error.message
                    }
                }
            }, "*");

            throw error;
        }
    };

    // 🟣 Capture XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url) {
        this._method = method;
        this._url = url;
        return originalOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function (body) {
        const startTime = Date.now();

        this.addEventListener("load", function () {
            window.postMessage({
                type: "RRWEB_EVENT",
                event: {
                    type: "custom",
                    timestamp: Date.now(),
                    data: {
                        source: "network",
                        method: this._method,
                        url: this._url,
                        status: this.status,
                        duration: Date.now() - startTime,
                        response: this.response?.toString().slice(0, 1000)
                    }
                }
            }, "*");
        });

        return originalSend.apply(this, arguments);
    };
}
(function () {
    if (window.__RRWEB_RUNNING__) return;
    window.__RRWEB_RUNNING__ = true;

    const currentScript = document.currentScript;
    const rrwebUrl = currentScript.getAttribute("data-rrweb");

    const s = document.createElement("script");
    s.src = rrwebUrl;

    s.onload = () => {
        captureNetwork();
        window.rrweb.record({
            maskAllInputs: true,
            emit(event) {
                event.timestamp = Date.now();
                window.postMessage({ type: "RRWEB_EVENT", event }, "*");
            },
        });
    };

    document.head.appendChild(s);
})();