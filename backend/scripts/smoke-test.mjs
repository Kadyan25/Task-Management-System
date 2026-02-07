const BASE_URL = process.env.API_BASE_URL ?? "http://localhost:5000";
const PASSWORD = process.env.SMOKE_TEST_PASSWORD ?? "Password123!";
const COOKIE_NAME = process.env.REFRESH_TOKEN_COOKIE_NAME ?? "refreshToken";

const email = `smoke_${Date.now()}@example.com`;

const fail = (message, details) => {
  console.error(`SMOKE TEST FAILED: ${message}`);
  if (details !== undefined) {
    console.error(details);
  }
  process.exit(1);
};

const parseJson = async (response) => {
  const raw = await response.text();
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return { raw };
  }
};

const request = async (path, options = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const body = await parseJson(response);
  return { response, body };
};

const getRefreshTokenFromSetCookie = (response) => {
  const setCookieHeader = response.headers.get("set-cookie") ?? "";
  const cookieRegex = new RegExp(`${COOKIE_NAME}=([^;]+)`);
  const match = setCookieHeader.match(cookieRegex);
  return match?.[1];
};

const expectStatus = (actual, expected, context, body) => {
  if (actual !== expected) {
    fail(`${context} expected status ${expected} but got ${actual}`, body);
  }
};

const main = async () => {
  const registerResult = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email,
      password: PASSWORD,
    }),
  });

  expectStatus(registerResult.response.status, 201, "register", registerResult.body);
  const accessToken = registerResult.body.accessToken;
  const refreshToken = getRefreshTokenFromSetCookie(registerResult.response);

  if (!accessToken) {
    fail("register response did not include accessToken", registerResult.body);
  }
  if (!refreshToken) {
    fail("register response did not include refresh token cookie");
  }

  const refreshResult = await request("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
  expectStatus(refreshResult.response.status, 200, "refresh", refreshResult.body);

  const refreshedAccessToken = refreshResult.body.accessToken;
  if (!refreshedAccessToken) {
    fail("refresh response did not include accessToken", refreshResult.body);
  }

  const createTaskResult = await request("/tasks", {
    method: "POST",
    headers: {
      authorization: `Bearer ${refreshedAccessToken}`,
    },
    body: JSON.stringify({
      title: "Smoke test task",
      description: "created by smoke test",
    }),
  });
  expectStatus(createTaskResult.response.status, 201, "create task", createTaskResult.body);

  const createdTaskId = createTaskResult.body?.task?.id;
  if (!createdTaskId) {
    fail("create task response did not include task id", createTaskResult.body);
  }

  const listTasksResult = await request("/tasks?page=1&limit=10&search=Smoke", {
    method: "GET",
    headers: {
      authorization: `Bearer ${refreshedAccessToken}`,
    },
  });
  expectStatus(listTasksResult.response.status, 200, "list tasks", listTasksResult.body);

  const toggleResult = await request(`/tasks/${createdTaskId}/toggle`, {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${refreshedAccessToken}`,
    },
  });
  expectStatus(toggleResult.response.status, 200, "toggle task", toggleResult.body);

  const deleteResult = await request(`/tasks/${createdTaskId}`, {
    method: "DELETE",
    headers: {
      authorization: `Bearer ${refreshedAccessToken}`,
    },
  });
  expectStatus(deleteResult.response.status, 200, "delete task", deleteResult.body);

  const logoutResult = await request("/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
  expectStatus(logoutResult.response.status, 200, "logout", logoutResult.body);

  console.log("SMOKE TEST PASSED");
};

main().catch((error) => fail("unexpected error", error));
