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

// r2BucketNm을 외부 URL로 설정
const r2BucketNm = "https://pub-ee4d21cc8d0a487da2147fc062da4bf1.r2.dev/";

// URLSearchParams로 content_key 추출
const params = new URLSearchParams(window.location.search);
const contentKey = params.get("content_key");

// GA4 gtag 이벤트 호출 함수
function gtag() {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(arguments);
}

// 데이터를 fetch하고 iframe 내용을 설정
const fetchData = async () => {
  try {
    const response = await fetch(`${r2BucketNm}content_map.json`);
    const map = await response.json();
    const item = map[contentKey];

    if (!item) {
      iframeSrc.value = null;
      return;
    }

    if (item.type === "survey") {
      iframeSrc.value = item.src;
    } else {
      iframeSrc.value = `${r2BucketNm}${item.src}`;
    }

    // GA 이벤트: 콘텐츠 제목 보내기
    gtag("event", "content-title", {
      content_type: item.title,
    });
  } catch (error) {
    iframeSrc.value = null;
  }
};

const logDataSetting = async () => {
  const res = await fetch("/logData/");
  const data = await res.json();
  console.log("data", data);
};

// 컴포넌트가 마운트될 때 fetchData 호출
onMounted(() => {
  fetchData();
  logDataSetting();
});
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
