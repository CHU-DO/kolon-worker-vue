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
const r2BucketNm = "https://pub-ee4d21cc8d0a487da2147fc062da4bf1.r2.dev/";

onMounted(() => {
  // 로그인 여부 확인
  if (localStorage.getItem("isLoggedIn") !== "true") {
    // 로그인하지 않은 경우 /login 페이지로 리디렉션
    router.push("/login");
  } else {
    getData();
  }
});

const openItem = (item) => {
  if (item.type == "survey") {
    window.open(`${item.src}`, "_blank"); // 새 창에서 파일 열기
  } else {
    window.open(`${r2BucketNm}${item.src}`, "_blank"); // 새 창에서 파일 열기
  }
};

// 데이터 로딩 함수
const getData = async () => {
  try {
    const res = await fetch(`${r2BucketNm}content_map.json`);
    const data = await res.json();
    items.value = Object.values(data); // 데이터를 배열로 변환하여 저장

    console.log("items.value:", items.value);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};
</script>

<style scoped>
/* 전체 아이템 영역 스타일 */
#item-area {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(250px, 1fr)
  ); /* 카드형 레이아웃 */
  gap: 20px; /* 아이템들 사이 간격 */
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto; /* 가운데 정렬 */
  background-color: #f9f9f9; /* 배경색 */
  border-radius: 10px; /* 모서리 둥글게 */
}

/* 각 아이템 스타일 */
.item {
  background-color: #fff; /* 배경색 */
  padding: 20px;
  border-radius: 10px; /* 모서리 둥글게 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 그림자 효과 */
  text-align: center;
  font-size: 18px;
  color: #333; /* 글자 색 */
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease; /* 클릭 효과 */
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center; /* 가운데 정렬 */
  justify-content: flex-start; /* 아이템 제목은 아래로 배치 */
  height: 100px; /* 카드 높이 고정 */
}

/* 타입을 표시할 영역 스타일 */
.item-type {
  position: absolute;
  top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 5px 15px;
  border-radius: 5px;
  font-size: 14px;
  width: auto;
}

/* 아이템에 마우스 올릴 때 효과 */
.item:hover {
  transform: translateY(-5px); /* 살짝 위로 이동 */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); /* 더 강한 그림자 */
  background-color: #f0f0f0; /* 배경색 변화 */
}

/* 제목 스타일 */
.item-title {
  margin-top: 40px; /* 타입 태그 아래로 제목 배치 */
  font-size: 18px;
  font-weight: bold;
}

/* 작은 화면에서 아이템 크기 조정 (반응형) */
@media (max-width: 768px) {
  #item-area {
    grid-template-columns: 1fr; /* 한 줄로 표시 */
  }
}
</style>
