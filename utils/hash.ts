export async function sha256(input: string) {
  try {
    const enc = new TextEncoder()
    const data = enc.encode(input)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  } catch (e) {
    // fallback to plain text (not secure) if crypto unavailable
    let s = ''
    for (let i = 0; i < input.length; i++) s += input.charCodeAt(i).toString(16)
    return s
  }
}
