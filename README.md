# k6-api-performance

Testes de performance de API com [k6](https://k6.io): smoke, carga e estresse sobre uma jornada real de admin (cadastro, login, listar, criar, consultar e remover produto), com thresholds de aprovação e reprovação versionados junto do código.

O alvo é a [Serverest](https://serverest.dev), API pública de prática. Por padrão os testes rodam contra uma instância local (`npx serverest`), tanto aqui quanto no CI, para não sobrecarregar o serviço público.

## Cenários

| Script | Objetivo | Perfil |
| --- | --- | --- |
| `scripts/smoke.js` | Validar que a jornada funciona antes de gerar carga | 1 VU, 3 iterações, todos os checks precisam passar |
| `scripts/load.js` | Medir o comportamento sob carga esperada | Rampa até 20 VUs em 70 s |
| `scripts/stress.js` | Achar o ponto de quebra | Rampa até 100 VUs, limites frouxos de propósito |

## Thresholds

| Métrica | Smoke | Load | Stress |
| --- | --- | --- | --- |
| `checks` | 100% | acima de 99% | sem limite |
| `http_req_failed` | 0% | abaixo de 1% | abaixo de 5% |
| `http_req_duration` p95 | abaixo de 1500 ms | abaixo de 800 ms | abaixo de 3000 ms |
| `http_req_duration` p99 | sem limite | abaixo de 1500 ms | sem limite |
| `POST /produtos` p95 | sem limite | abaixo de 1000 ms | sem limite |

Load e stress também exigem `http_reqs` com contagem maior que zero, para que um erro de setup não passe como aprovado por falta de dados.

## Como rodar

Com k6 instalado ([guia](https://grafana.com/docs/k6/latest/set-up/install-k6/)):

```bash
npx serverest
k6 run scripts/smoke.js
k6 run scripts/load.js
k6 run scripts/stress.js
```

Sem instalar o k6, via container:

```bash
podman run --rm --network=host -v "$PWD":/work:Z -w /work docker.io/grafana/k6:latest run scripts/smoke.js
```

Outro alvo:

```bash
k6 run -e BASE_URL=https://serverest.dev scripts/smoke.js
```

Contra a Serverest pública use apenas o smoke.

## Estrutura

- `scripts/lib/api.js`: cadastro, login e cabeçalhos reutilizáveis.
- `scripts/journey.js`: a jornada de produtos, agrupada com `group` e com requisições nomeadas por `tags` para os thresholds por endpoint.
- `.github/workflows/k6.yml`: sobe a Serverest local, roda smoke e load e anexa os resumos JSON como artefato.

## Metodologia

A ordem é a mesma usada em testes de carga em produtos reais: primeiro o smoke prova que o fluxo é válido, depois o load mede a latência com carga esperada e por fim o stress procura onde a latência ou a taxa de erro quebram o limite. Cada etapa só vale se a anterior passou.
