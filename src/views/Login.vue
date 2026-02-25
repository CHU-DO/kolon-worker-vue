<template>
  <div class="login-container">
    <h2 class="login-title">로그인</h2>
    <form @submit.prevent="handleLogin" class="login-form">
      <div class="form-group">
        <label for="username">아이디</label>
        <input
          type="text"
          id="username"
          v-model="username"
          placeholder="아이디를 입력하세요"
          required
        />
      </div>
      <div class="form-group">
        <label for="password">비밀번호</label>
        <input
          type="password"
          id="password"
          v-model="password"
          placeholder="비밀번호를 입력하세요"
          required
        />
      </div>
      <button type="submit" class="login-button">로그인</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router"; // Vue Router 사용
const router = useRouter();

const username = ref("");
const password = ref("");

const handleLogin = async () => {
  if (username.value && password.value) {
    const res = await fetch("/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    });

    const data = await res.json();

    if (data.isSuccess) {
      // 로그인 성공 시 localStorage에 로그인 상태 저장
      localStorage.setItem("isLoggedIn", "true"); // 로그인 상태 저장
      // 로그인 성공 시 페이지 이동
      router.push("/itemlist");
    } else {
      localStorage.setItem("isLoggedIn", "false"); // 로그인 상태 저장
      alert(data.message);
    }
  } else {
    alert("아이디와 비밀번호를 모두 입력해주세요.");
  }
};
</script>

<style scoped>
/* 로그인 화면 컨테이너 스타일 */
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* 로그인 제목 스타일 */
.login-title {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

/* 폼 스타일 */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 입력 필드 스타일 */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

input {
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #0056b3;
  box-shadow: 0 0 3px rgba(0, 86, 179, 0.3);
}

/* 로그인 버튼 스타일 */
.login-button {
  padding: 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

.login-button:hover {
  background-color: #0056b3;
}
</style>
