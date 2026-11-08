import { createAdmin, login } from './lib/api.js'
import { productJourney } from './journey.js'

// Procura o ponto de quebra: os limites são frouxos de propósito, o objetivo é ler a curva.
export const options = {
  stages: [
    { duration: '30s', target: 25 },
    { duration: '30s', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    http_reqs: ['count>0'],
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<3000'],
  },
}

export function setup() {
  return { admin: createAdmin() }
}

let token
export default function (data) {
  if (!token) token = login(data.admin)
  productJourney(token)
}
