<template>
  <div id="item-area">
    <!-- items 배열을 반복하여 동적으로 아이템을 렌더링 -->
    <div
      v-for="(item, index) in items"
      :key="index"
      class="item"
      @click="openItem(item)"
    >
      <!-- 타입 표시 -->
      <div class="item-type">
        {{ item.type.toUpperCase() }}
      </div>

      <!-- 제목 표시 -->
      <div class="item-title">
        {{ item.title }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

// 아이템 데이터를 저장할 변수
const items = ref([]);

const router = useRouter();
const r2BucketUrl = import.meta.env.VITE_R2_BUCKET_URL;

onMounted(() => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const loginExpiration = localStorage.getItem("loginExpiration");

  if (isLoggedIn && loginExpiration) {
    const currentTime = new Date().getTime();

    // 만료 시간이 지나면 자동으로 로그아웃 처리
    if (currentTime > loginExpiration) {
      // 만료되었으므로 로그인 상태를 제거하고 로그인 페이지로 리디렉션
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("loginExpiration");
      router.push("/login"); // 로그인 페이지로 이동
    } else {
      getData();
    }
  } else {
    // 로그인하지 않은 경우 /login 페이지로 리디렉션
    router.push("/login");
  }
});

const openItem = (item) => {
  if (item.type == "survey") {
    window.open(`${item.src}`, "_blank"); // 새 창에서 파일 열기
  } else {
    window.open(`${r2BucketUrl}${item.src}`, "_blank"); // 새 창에서 파일 열기
  }
};

// 데이터 로딩 함수
const getData = async () => {
  try {
    const res = await fetch(`${r2BucketUrl}content_map.json`);
    const data = await res.json();
    items.value = Object.values(data); // 데이터를 배열로 변환하여 저장
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};
</script>

<style scoped>
#item-area {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(250px, 1fr)
  ); /* 반응형 그리드 레이아웃 */
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto; /* 가운데 정렬 */
  background-color: #f9f9f9; /* 배경 색 */
  border-radius: 10px; /* 모서리 둥글게 */
}

.item {
  background-color: #fff; /* 아이템 배경 */
  padding: 20px;
  border-radius: 12px; /* 둥근 모서리 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 부드러운 그림자 */
  text-align: center;
  font-size: 16px;
  color: #333; /* 텍스트 색 */
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease; /* 애니메이션 */
  display: flex;
  flex-direction: column;
  align-items: center; /* 아이템 제목과 타입을 가운데로 정렬 */
  justify-content: space-between;
}

.item:hover {
  transform: translateY(-5px); /* 마우스 호버시 위로 이동 */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); /* 강한 그림자 */
  background-color: #f0f0f0; /* 배경 색상 변화 */
}

.item-type {
  background-color: #9ee1a5; /* 타입 배경 색 */
  color: #333; /* 타입 텍스트 색 */
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 14px;
  margin-bottom: 10px; /* 아래 여백 */
  font-weight: bold;
}

.item-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin-top: 10px; /* 제목과 타입 간의 여백 */
}

@media (max-width: 768px) {
  #item-area {
    grid-template-columns: 1fr; /* 작은 화면에서 한 열로 표시 */
  }
}
</style>
