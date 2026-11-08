import { createAdmin, login } from './lib/api.js'
import { productJourney } from './journey.js'

export const options = {
  vus: 1,
  iterations: 3,
  thresholds: {
    checks: ['rate==1'],
    http_req_failed: ['rate==0'],
    http_req_duration: ['p(95)<1500'],
  },
}

export default function () {
  const token = login(createAdmin())
  productJourney(token)
}
