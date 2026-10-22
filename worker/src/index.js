const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin");
  if (!origin || origin !== env.ALLOWED_ORIGIN) return null;
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function base64url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function sign(payload, secret) {
  const header = base64url(new TextEncoder().encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const body = base64url(new TextEncoder().encode(JSON.stringify(payload)));
  const data = `${header}.${body}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data)));
  return `${data}.${base64url(signature)}`;
}

async function verify(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const data = `${parts[0]}.${parts[1]}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const signature = Uint8Array.from(
    atob(parts[2].replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (parts[2].length % 4)) % 4)),
    (char) => char.charCodeAt(0),
  );
  if (!(await crypto.subtle.verify("HMAC", key, signature, new TextEncoder().encode(data)))) return false;
  const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (parts[1].length % 4)) % 4)));
  return payload.aud === "petal-admin" && payload.exp > Math.floor(Date.now() / 1000);
}

async function sameSecret(expected, provided) {
  const encoder = new TextEncoder();
  const [left, right] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
    crypto.subtle.digest("SHA-256", encoder.encode(provided)),
  ]);
  const a = new Uint8Array(left);
  const b = new Uint8Array(right);
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i];
  return difference === 0;
}

async function github(path, env, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Maison-Petal-Publisher",
      ...(options.headers || {}),
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.message || `GitHub returned ${response.status}.`);
    error.status = response.status;
    throw error;
  }
  return result;
}

function allowedPath(path) {
  return path === "index.html" ||
    path === "data/store.json" ||
    path === "meta-catalog.csv" ||
    path === "sitemap.xml" ||
    path === "robots.txt" ||
    /^assets\/(products\/[A-Za-z0-9_-]+|site\/(hero2?|og|category-[0-9]+))-[A-Za-z0-9_-]+\.jpg$/.test(path);
}

async function publish(body, env) {
  if (!Array.isArray(body.files) || body.files.length < 1 || body.files.length > 100) {
    return json({ error: "The publish pack has an invalid number of files." }, 400);
  }
  const files = new Map();
  let totalBytes = 0;
  for (const file of body.files) {
    if (!file || typeof file.path !== "string" || !allowedPath(file.path) || files.has(file.path)) {
      return json({ error: "The publish pack contains an invalid or duplicate file path." }, 400);
    }
    if (typeof file.content !== "string" || !["utf8", "base64"].includes(file.encoding)) {
      return json({ error: "The publish pack contains an invalid file." }, 400);
    }
    totalBytes += file.encoding === "base64"
      ? Math.ceil(file.content.length * 3 / 4)
      : new TextEncoder().encode(file.content).length;
    if (totalBytes > 20 * 1024 * 1024) {
      return json({ error: "This update is too large. Use smaller photos and try again." }, 413);
    }
    files.set(file.path, file);
  }

  const storeFile = files.get("data/store.json");
  if (!storeFile || storeFile.encoding !== "utf8") {
    return json({ error: "The store data is missing from this update." }, 400);
  }
  let store;
  try {
    store = JSON.parse(storeFile.content);
  } catch {
    return json({ error: "The store data is not valid JSON." }, 400);
  }
  if (!Array.isArray(store.products) || !store.site || typeof store.site !== "object") {
    return json({ error: "The store data is incomplete." }, 400);
  }

  const owner = env.GITHUB_OWNER;
  const repo = env.GITHUB_REPO;
  const branch = env.GITHUB_BRANCH || "main";
  const repository = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const reference = await github(`${repository}/git/ref/heads/${encodeURIComponent(branch)}`, env);
  const parent = await github(`${repository}/git/commits/${reference.object.sha}`, env);

  const treeEntries = await Promise.all([...files.values()].map(async (file) => {
    const blob = await github(`${repository}/git/blobs`, env, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: file.content, encoding: file.encoding }),
    });
    return { path: file.path, mode: "100644", type: "blob", sha: blob.sha };
  }));
  const tree = await github(`${repository}/git/trees`, env, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base_tree: parent.tree.sha, tree: treeEntries }),
  });
  const commit = await github(`${repository}/git/commits`, env, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `Update Maison Petal store (${store.products.length} products)`,
      tree: tree.sha,
      parents: [reference.object.sha],
    }),
  });
  await github(`${repository}/git/refs/heads/${encodeURIComponent(branch)}`, env, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });
  return json({ ok: true, commit: commit.sha, message: "Store updated. GitHub Pages is publishing the changes now." });
}

export default {
  async fetch(request, env) {
    const headers = corsHeaders(request, env);
    if (!headers) return json({ error: "This website is not allowed to use the publishing service." }, 403);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    const url = new URL(request.url);

    if (url.pathname === "/api/login" && request.method === "POST") {
      if (!env.ADMIN_PASSWORD || env.ADMIN_PASSWORD.length < 16 || !env.SESSION_SECRET || env.SESSION_SECRET.length < 32 ||
          !env.GITHUB_TOKEN || !env.GITHUB_OWNER || !env.GITHUB_REPO) {
        return json({ error: "The publishing service has not been fully configured. Please contact the site owner." }, 503, headers);
      }
      if (env.LOGIN_LIMITER) {
        const result = await env.LOGIN_LIMITER.limit({
          key: request.headers.get("CF-Connecting-IP") || "unknown",
        });
        if (!result.success) return json({ error: "Too many sign-in attempts. Wait a minute and try again." }, 429, headers);
      }
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Enter your admin password and try again." }, 400, headers);
      }
      if (typeof body.password !== "string" || body.password.length > 256 ||
          !(await sameSecret(env.ADMIN_PASSWORD, body.password))) {
        return json({ error: "That password is not correct. Try again." }, 401, headers);
      }
      const expires = Math.floor(Date.now() / 1000) + 8 * 60 * 60;
      const token = await sign({ exp: expires, aud: "petal-admin" }, env.SESSION_SECRET);
      return json({ token, expires }, 200, headers);
    }

    if (url.pathname === "/api/publish" && request.method === "POST") {
      const authorization = request.headers.get("Authorization") || "";
      const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
      try {
        if (!env.SESSION_SECRET || !(await verify(token, env.SESSION_SECRET))) {
          return json({ error: "Your admin session has expired. Sign in again to publish." }, 401, headers);
        }
      } catch {
        return json({ error: "Your admin session is invalid. Sign in again to publish." }, 401, headers);
      }
      const length = Number(request.headers.get("Content-Length") || 0);
      if (length > 30 * 1024 * 1024) return json({ error: "This update is too large. Use smaller photos and try again." }, 413, headers);
      try {
        const body = await request.json();
        const result = await publish(body, env);
        return new Response(result.body, { status: result.status, headers: { ...headers, ...Object.fromEntries(result.headers) } });
      } catch (error) {
        const status = error.status === 409 || error.status === 422 ? 409 : 502;
        return json({
          error: status === 409
            ? "Another update was published at the same time. Please save again."
            : `Could not publish to GitHub: ${error.message}`,
        }, status, headers);
      }
    }

    return json({ error: "Not found." }, 404, headers);
  },
};
