import { createAdmin, login } from './lib/api.js'
import { productJourney } from './journey.js'

export const options = {
  stages: [
    { duration: '20s', target: 10 },
    { duration: '40s', target: 20 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    checks: ['rate>0.99'],
    http_reqs: ['count>0'],
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800', 'p(99)<1500'],
    'http_req_duration{name:POST /produtos}': ['p(95)<1000'],
  },
}

// O login acontece uma vez por VU para a carga medir a jornada, não o cadastro.
export function setup() {
  return { admin: createAdmin() }
}

let token
export default function (data) {
  if (!token) token = login(data.admin)
  productJourney(token)
}
