export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // /login/ 경로로 들어오는 POST 요청을 처리
    if (url.pathname.startsWith("/login/") && request.method === "POST") {
      try {
        const requestBody = await request.json(); // 요청 본문을 JSON으로 파싱
        const { username, password } = requestBody;
        const db = env.MY_DB;
        const result = await db
          .prepare("SELECT * FROM users WHERE id = ? AND password = ?")
          .bind(username, password)
          .first();

        // 아이디와 비밀번호 검증 (여기서는 예시로 간단한 검증 사용)
        if (result) {
          // 로그인 성공
          return new Response(
            JSON.stringify({
              message: "로그인 성공",
              isSuccess: true,
              data: result,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        } else {
          // 로그인 실패
          return new Response(
            JSON.stringify({
              message: "아이디 또는 비밀번호가 잘못되었습니다.",
              isSuccess: false,
            }),
            {
              status: 401,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      } catch (error) {
        // 요청 본문을 파싱할 수 없는 경우 에러 처리
        return new Response(JSON.stringify({ message: "잘못된 요청입니다." }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    } else if (url.pathname.startsWith("/logData/")) {
      return new Response(
        JSON.stringify({ message: request.cf, isSuccess: true }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // /login/ 경로가 아닌 다른 요청은 404로 처리
    return new Response(null, { status: 404 });
  },
};
