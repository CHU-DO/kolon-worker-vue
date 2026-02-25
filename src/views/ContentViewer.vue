<template>
  <div>
    <iframe v-if="iframeSrc" :src="iframeSrc" id="viewer"></iframe>
    <div v-else class="error-message">
      <h2>매핑 정보를 불러오지 못했습니다.</h2>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

// Composition API 변수
const iframeSrc = ref(null);
const r2BucketUrl = import.meta.env.VITE_R2_BUCKET_URL;

// URLSearchParams로 content_key 추출
const params = new URLSearchParams(window.location.search);
const contentKey = params.get("content_key");

// 컴포넌트가 마운트될 때 fetchData 호출
onMounted(() => {
  loadGA4Script();
  fetchData();
  accessLogWrite();
});

const loadGA4Script = () => {
  const G4_URL = import.meta.env.VITE_G4_URL;
  const G4_KEY = import.meta.env.VITE_G4_KEY;

  const script = document.createElement("script");
  script.src = G4_URL;
  script.async = true;
  document.head.appendChild(script);
  script.onload = () => {
    gtag("js", new Date());
    gtag("config", G4_KEY, {
      anonymize_ip: true,
    });
  };
};

// GA4 gtag 이벤트 호출 함수
function gtag() {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(arguments);
}

// 데이터를 fetch하고 iframe 내용을 설정
const fetchData = async () => {
  try {
    const response = await fetch(`${r2BucketUrl}content_map.json`);
    const map = await response.json();
    const item = map[contentKey];

    if (!item) {
      iframeSrc.value = null;
      return;
    }

    if (item.type === "survey") {
      iframeSrc.value = item.src;
    } else {
      iframeSrc.value = `${r2BucketUrl}${item.src}`;
    }

    // GA 이벤트: 콘텐츠 제목 보내기
    gtag("event", "content-title", {
      content_type: item.title,
    });

    await accessLogWrite(item.title);
  } catch (error) {
    iframeSrc.value = null;
  }
};

const accessLogWrite = async (itemTitle) => {
  const date = new Date();
  // 날짜와 시간을 각각 가져오기
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 +1
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  // 원하는 포맷으로 문자열 생성
  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  const res = await fetch("/access-log/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content_key: contentKey,
      content_name: itemTitle,
      connect_time: formattedDate,
    }),
  });
  const data = await res.json();
  console.log("resresresresres:", data);
};
</script>

<style scoped>
.error-message {
  text-align: center;
  margin-top: 50px;
}

iframe {
  width: 100%;
  height: 100vh; /* iframe이 부모 div의 높이를 꽉 차게 설정 */
  border: none;
  overflow: hidden; /* iframe 내부에서 스크롤을 숨김 */
}
</style>
