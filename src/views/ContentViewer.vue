<template>
    <div class="viewer-container">
        <!-- loading -->
        <div v-if="state.loading" class="loading">Loading...</div>

        <!-- error -->
        <div v-else-if="state.error" class="error">
            <h2>콘텐츠를 불러올 수 없습니다.</h2>
        </div>

        <!-- iframe viewer -->
        <iframe
            v-else-if="viewer.type === 'iframe'"
            :src="viewer.src"
            :style="
                viewer.mobile
                    ? { marginTop: '40px', height: 'calc(100dvh - 40px)' }
                    : { height: '100%' }
            "
            loading="lazy"
        />

        <!-- sandbox="allow-scripts allow-same-origin allow-forms allow-popups" -->

        <img
            v-else-if="viewer.type === 'image'"
            :src="viewer.src"
            class="image-viewer"
        />

        <!-- video -->

        <video
            v-else-if="viewer.type === 'video'"
            controls
            class="video-viewer"
        >
            <source :src="viewer.src" />
        </video>

        <!-- audio -->
        <audio v-else-if="viewer.type === 'audio'" controls>
            <source :src="viewer.src" />
        </audio>
    </div>
</template>

<script setup>
import { reactive, onMounted, onUnmounted } from "vue";

/* ---------------- state ---------------- */

const state = reactive({
    loading: true,
    error: false,
});

const viewer = reactive({
    type: null,
    src: null,
    mobile: false,
});

/* ---------------- env ---------------- */

const R2 = import.meta.env.VITE_R2_BUCKET_URL;
const GA_URL = import.meta.env.VITE_G4_URL;
const GA_KEY = import.meta.env.VITE_G4_KEY;

/* ---------------- params ---------------- */

const params = new URLSearchParams(location.search);
const contentKey = params.get("content_key");

/* ---------------- request control ---------------- */

let controller;

/* ---------------- lifecycle ---------------- */

onMounted(() => {
    loadGA4();
    loadContent();
});

onUnmounted(() => {
    controller?.abort();
});

function setFullHeight() {
    const height = window.innerHeight;
    document.documentElement.style.setProperty("--real-vh", `${height}px`);
}

/* ---------------- GA4 ---------------- */

function gtag() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(arguments);
}

function loadGA4() {
    if (!GA_URL) return;

    const script = document.createElement("script");
    script.src = GA_URL;
    script.async = true;

    script.onload = () => {
        gtag("js", new Date());
        gtag("config", GA_KEY, { anonymize_ip: true });
    };
    document.head.appendChild(script);
}

/* ---------------- cache ---------------- */

let contentMapCache = null;

/* ---------------- main load ---------------- */

async function loadContent() {
    try {
        state.loading = true;
        state.error = false;

        controller?.abort();
        controller = new AbortController();

        const map = await getContentMap();

        const item = map[contentKey];

        if (!item) throw new Error("content not found");

        setViewer(item);

        sendGA(item.title);

        writeAccessLog(item.title);
    } catch (err) {
        if (err.name !== "AbortError") {
            console.error(err);
            state.error = true;
        }
    } finally {
        state.loading = false;
    }
}

/* ---------------- map fetch with cache ---------------- */

async function getContentMap() {
    if (contentMapCache) return contentMapCache;

    const res = await fetch(`${R2}content_map.json`);

    if (!res.ok) throw new Error("map fetch fail");

    contentMapCache = await res.json();

    return contentMapCache;
}

/* ---------------- viewer builder ---------------- */

function setViewer(item) {
    const url = buildFileUrl(item);
    const ext = getExt(url);

    if (item.type === "survey") {
        viewer.type = "iframe";
        viewer.src = url;
        return;
    }

    if (isImage(ext)) {
        viewer.type = "image";
        viewer.src = url;
        return;
    }

    if (isVideo(ext)) {
        viewer.type = "video";
        viewer.src = url;
        return;
    }

    if (isAudio(ext)) {
        viewer.type = "audio";
        viewer.src = url;
        return;
    }

    if (isPdf(ext)) {
        if (isMobile()) {
            // viewer.type = "iframe";
            // viewer.src = googleViewer(url);
            // return;

            viewer.mobile = true;
        }

        viewer.type = "iframe";
        viewer.src = googleViewer(url);
        return;
    }

    if (isOffice(ext)) {
        viewer.type = "iframe";
        viewer.src = googleViewer(url);
        return;
    }

    viewer.type = "iframe";
    viewer.src = url;
}

/* ---------------- file helpers ---------------- */

function buildFileUrl(item) {
    if (item.type === "survey") return item.src;

    return `${R2}${item.src}`;
}

function googleViewer(url) {
    return `https://docs.google.com/gview?embedded=true&url=${url}`;
}

function getExt(url) {
    return url.split(".").pop().toLowerCase();
}

function isImage(ext) {
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
}

function isVideo(ext) {
    return ["mp4", "webm", "mov"].includes(ext);
}

function isAudio(ext) {
    return ["mp3", "wav", "ogg"].includes(ext);
}

function isPdf(ext) {
    return ext === "pdf";
}

function isOffice(ext) {
    return ["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(ext);
}

function isMobile() {
    return /iPhone|iPad|Android/i.test(navigator.userAgent);
}

/* ---------------- analytics ---------------- */

function sendGA(title) {
    gtag("event", "content-view", {
        content_name: title,
    });
}

/* ---------------- access log ---------------- */

async function writeAccessLog(title) {
    try {
        await fetch("/access-log/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content_key: contentKey,
                content_name: title,
                connect_time: new Date().toLocaleString("sv-SE"),
            }),
        });
    } catch (err) {
        console.warn("log fail", err);
    }
}
</script>

<style scoped>
.viewer-container {
    width: 100%;
    height: 100dvh;
    overflow: hidden;
}

iframe {
    width: 100%;
    height: 100%;
    border: none;
}

.loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.error {
    text-align: center;
    margin-top: 50px;
}

/* iframe {
  width: 100%;
  height: 100dvh;
  border: none;
} */

.image-viewer {
    width: 100%;
    height: 100vh;
    object-fit: contain;
}

.video-viewer {
    width: 100%;
    height: 100vh;
}
</style>
