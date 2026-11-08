import http from 'k6/http'
import { check, fail } from 'k6'

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export function uniqueId() {
  return `${__VU}-${typeof __ITER === "undefined" ? 0 : __ITER}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`
}

export function createAdmin() {
  const email = `k6-${uniqueId()}@qa.dev`
  const password = 'teste123'
  const res = http.post(
    `${BASE_URL}/usuarios`,
    JSON.stringify({ nome: 'k6 admin', email, password, administrador: 'true' }),
    { headers: JSON_HEADERS, tags: { name: 'POST /usuarios' } },
  )
  if (!check(res, { 'usuário criado (201)': (r) => r.status === 201 })) {
    fail(`cadastro falhou: ${res.status} ${res.body}`)
  }
  return { email, password }
}

export function login({ email, password }) {
  const res = http.post(`${BASE_URL}/login`, JSON.stringify({ email, password }), {
    headers: JSON_HEADERS,
    tags: { name: 'POST /login' },
  })
  const ok = check(res, {
    'login 200': (r) => r.status === 200,
    'login devolve token': (r) => !!r.json('authorization'),
  })
  if (!ok) fail(`login falhou: ${res.status} ${res.body}`)
  return res.json('authorization')
}

export function authHeaders(token) {
  return { headers: { ...JSON_HEADERS, Authorization: token } }
}
