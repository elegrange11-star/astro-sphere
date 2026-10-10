interface GitHubFileResponse {
  content: string
  sha: string
  encoding: string
}

function getEnv(locals?: unknown) {
  const rt = (locals as any)?.runtime?.env
  return {
    token: rt?.GITHUB_TOKEN ?? import.meta.env.GITHUB_TOKEN ?? "",
    repo: rt?.GITHUB_REPO ?? import.meta.env.GITHUB_REPO ?? "",
    branch: rt?.GITHUB_BRANCH ?? import.meta.env.GITHUB_BRANCH ?? "main",
  }
}

function makeHeaders(token: string): Record<string, string> {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  }
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

function base64ToText(b64: string): string {
  const binary = atob(b64.replace(/\n/g, ""))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

function textToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

export async function getFile(
  path: string,
  locals?: unknown,
): Promise<{ content: string; sha: string }> {
  const { token, repo, branch } = getEnv(locals)
  const res = await fetch(
    `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`,
    { headers: makeHeaders(token) },
  )
  if (!res.ok) throw new Error(`GitHub API error ${res.status}: ${await res.text()}`)
  const data = (await res.json()) as GitHubFileResponse
  return { content: base64ToText(data.content), sha: data.sha }
}

export async function putFile(
  path: string,
  content: string,
  sha: string | undefined,
  locals?: unknown,
): Promise<void> {
  const { token, repo, branch } = getEnv(locals)
  const body: Record<string, unknown> = {
    message: `Admin: update ${path}`,
    content: textToBase64(content),
    branch,
  }
  if (sha) body.sha = sha
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: "PUT",
    headers: makeHeaders(token),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`GitHub API error ${res.status}: ${await res.text()}`)
}

export async function putFileBinary(
  path: string,
  buffer: ArrayBuffer,
  sha: string | undefined,
  locals?: unknown,
): Promise<void> {
  const { token, repo, branch } = getEnv(locals)
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  const body: Record<string, unknown> = {
    message: `Admin: upload ${path}`,
    content: btoa(binary),
    branch,
  }
  if (sha) body.sha = sha
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: "PUT",
    headers: makeHeaders(token),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`GitHub API error ${res.status}: ${await res.text()}`)
}

export async function getFileSha(
  path: string,
  locals?: unknown,
): Promise<string | undefined> {
  try {
    const { sha } = await getFile(path, locals)
    return sha
  } catch {
    return undefined
  }
}
