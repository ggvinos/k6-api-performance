import http from 'k6/http'
import { check, group, sleep } from 'k6'
import { BASE_URL, authHeaders, uniqueId } from './lib/api.js'

// Jornada de um admin: listar, criar, consultar e remover produto.
export function productJourney(token) {
  group('listar produtos', () => {
    const res = http.get(`${BASE_URL}/produtos`, { tags: { name: 'GET /produtos' } })
    check(res, {
      'lista 200': (r) => r.status === 200,
      'lista traz produtos': (r) => r.json('quantidade') >= 0,
    })
  })

  let productId
  group('criar produto', () => {
    const body = JSON.stringify({
      nome: `Produto k6 ${uniqueId()}`,
      preco: 100,
      descricao: 'carga',
      quantidade: 10,
    })
    const res = http.post(`${BASE_URL}/produtos`, body, {
      ...authHeaders(token),
      tags: { name: 'POST /produtos' },
    })
    check(res, { 'produto criado (201)': (r) => r.status === 201 })
    productId = res.json('_id')
  })

  if (!productId) return

  group('consultar produto', () => {
    const res = http.get(`${BASE_URL}/produtos/${productId}`, { tags: { name: 'GET /produtos/{id}' } })
    check(res, { 'consulta 200': (r) => r.status === 200 })
  })

  group('remover produto', () => {
    const res = http.del(`${BASE_URL}/produtos/${productId}`, null, {
      ...authHeaders(token),
      tags: { name: 'DELETE /produtos/{id}' },
    })
    check(res, { 'remoção 200': (r) => r.status === 200 })
  })

  sleep(1)
}
