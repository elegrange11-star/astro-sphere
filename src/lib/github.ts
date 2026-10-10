interface GitHubFileResponse {
  content: string
  sha: string
  encoding: string
}

function getHeaders() {
  return {
    Authorization: `Bearer ${import.meta.env.GITHUB_TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  }
}

function baseUrl(): string {
  return `https://api.github.com/repos/${import.meta.env.GITHUB_REPO}/contents`
}

function branch(): string {
  return import.meta.env.GITHUB_BRANCH || "main"
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

export async function getFile(path: string): Promise<{ content: string; sha: string }> {
  const res = await fetch(`${baseUrl()}/${path}?ref=${branch()}`, {
    headers: getHeaders(),
  })
  if (!res.ok) throw new Error(`GitHub API error ${res.status}: ${await res.text()}`)
  const data = await res.json() as GitHubFileResponse
  return { content: base64ToText(data.content), sha: data.sha }
}

export async function putFile(path: string, content: string, sha?: string): Promise<void> {
  const encoded = textToBase64(content)
  const body: Record<string, unknown> = {
    message: `Admin: update ${path}`,
    content: encoded,
    branch: branch(),
  }
  if (sha) body.sha = sha
  const res = await fetch(`${baseUrl()}/${path}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`GitHub API error ${res.status}: ${await res.text()}`)
}

export async function putFileBinary(path: string, buffer: ArrayBuffer, sha?: string): Promise<void> {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  const body: Record<string, unknown> = {
    message: `Admin: upload ${path}`,
    content: btoa(binary),
    branch: branch(),
  }
  if (sha) body.sha = sha
  const res = await fetch(`${baseUrl()}/${path}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`GitHub API error ${res.status}: ${await res.text()}`)
}

export async function getFileSha(path: string): Promise<string | undefined> {
  try {
    const { sha } = await getFile(path)
    return sha
  } catch {
    return undefined
  }
}
