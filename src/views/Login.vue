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
      const expirationTime = new Date().getTime() + 30 * 60 * 1000; // 30분 후 시간 (밀리초 단위)
      localStorage.setItem("loginExpiration", expirationTime); // 만료 시간 저장

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
/* 로그인 폼 스타일 */
.login-container {
  margin: 0 auto;
  background-color: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px; /* 최대 너비 설정 */
}

/* 폼 타이틀 */
h2 {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

/* 입력 필드 스타일 */
input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 2px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  color: #333;
  transition: border-color 0.3s ease;
}

/* 입력 필드 포커스 효과 */
input[type="text"]:focus,
input[type="password"]:focus {
  border-color: #3498db; /* 포커스 시 파란색 */
  outline: none;
}

/* 로그인 버튼 스타일 */
button {
  width: 100%;
  padding: 12px;
  background-color: #3498db; /* 버튼 배경색 */
  color: #fff;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

/* 버튼 호버 효과 */
button:hover {
  background-color: #2980b9; /* 호버 시 색상 변화 */
}

/* 모바일 친화적인 스타일 */
@media (max-width: 600px) {
  .login-container {
    padding: 20px;
  }

  h2 {
    font-size: 20px;
  }

  input[type="text"],
  input[type="password"] {
    font-size: 14px;
  }

  button {
    font-size: 14px;
  }
}
</style>
