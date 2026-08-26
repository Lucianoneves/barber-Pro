# BarberPro

Sistema de gestão para barbearias: cadastro de cortes, agendamentos e plano Premium via Stripe.

Este repositório tem duas aplicações:

| Pasta | Função | Stack | Porta |
| --- | --- | --- | --- |
| `barber/` | API | Node.js, Express, Prisma, PostgreSQL, Stripe | `3333` |
| `barber-web/` | Interface | Next.js (Pages Router), React, Chakra UI | `3000` |

---

## Funcionalidades

- Cadastro, login e perfil da barbearia (JWT)
- Modelos de corte (criar, listar, editar)
- Agendamentos (criar, listar, finalizar)
- Plano **grátis**: até **3** modelos de corte
- Plano **Premium** (Stripe Checkout, cartão): cortes ilimitados e edição de modelos
- Após o pagamento, a assinatura é gravada no banco (webhook + sincronização no `GET /me`)
- **Alterar assinatura** abre o Stripe Customer Portal

---

## Pré-requisitos

- Node.js 18+
- Yarn
- PostgreSQL (local ou hospedado, por exemplo Neon)
- Conta Stripe (modo teste)

---

## Estrutura

```text
.
├── barber/                 # backend
│   ├── prisma/             # schema e migrations
│   └── src/
│       ├── controller/
│       ├── service/
│       ├── middlewares/
│       ├── utils/          # Stripe, save/sync de assinatura
│       ├── routes.ts
│       └── server.ts
└── barber-web/             # frontend
    └── src/
        ├── pages/          # login, dashboard, cortes, planos, perfil
        ├── components/
        ├── context/        # autenticação
        └── services/       # axios + SSR
```

---

## Variáveis de ambiente

Não commite arquivos `.env`. Use os exemplos abaixo.

### Backend — `barber/.env`

```env
DATABASE_URL="postgresql://USUARIO:SENHA@HOST/DB?sslmode=require"
JWT_SECRET="seu_jwt_secret"

STRIPE_API_KEY="sk_test_..."
STRIPE_PRICE="price_..."          # Price ID (price_...). Também aceita Product ID (prod_...)
STRIPE_SUCCESS_URL="http://localhost:3000/planos"
STRIPE_CANCEL_URL="http://localhost:3000/planos"
STRIPE_WEBHOOK_SECRET="whsec_..."
```

`STRIPE_SUCCESS_URL` e `STRIPE_CANCEL_URL` são as URLs de retorno do Checkout. A API acrescenta `session_id={CHECKOUT_SESSION_ID}` na URL de sucesso.

### Frontend — `barber-web/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
```

---

## Como rodar

Em dois terminais:

```bash
# 1) API
cd barber
yarn
npx prisma generate
npx prisma migrate deploy
yarn dev
```

```bash
# 2) Web
cd barber-web
yarn
yarn dev
```

- API: http://localhost:3333
- App: http://localhost:3000 (redireciona para `/login`)

### Webhook Stripe (local)

O Stripe não chama `localhost` sozinho. Em um terceiro terminal:

```bash
stripe listen --forward-to localhost:3333/webhook
```

Copie o `whsec_...` exibido pelo CLI para `STRIPE_WEBHOOK_SECRET` e reinicie a API.

Sem o CLI, o pagamento ainda funciona: ao voltar para `/planos` ou ao chamar `GET /me`, a API busca a assinatura ativa na Stripe e grava no banco.

Ative o **Customer Portal** no Dashboard da Stripe (Settings → Billing → Customer portal) para o botão **Alterar assinatura**.

Cartão de teste: `4242 4242 4242 4242`, validade futura, CVC qualquer.

---

## Modelo de dados (Prisma)

- **User** — barbearia (`stripe_customer_id` opcional)
- **Subscription** — uma por usuário (`id` da Stripe `sub_...`, `status`, `price_id`)
- **Haircut** — modelo de corte
- **Service** — agendamento (cliente + data + corte)

---

## API

Base: `http://localhost:3333`  
Rotas com autenticação enviam `Authorization: Bearer <token>`.

### Usuários

| Método | Rota | Auth | Descrição |
| --- | --- | --- | --- |
| `POST` | `/users` | não | Cadastro |
| `POST` | `/sessions` | não | Login (devolve token + dados) |
| `GET` | `/me` | sim | Perfil; sincroniza assinatura na Stripe se necessário |
| `PUT` | `/users` | sim | Atualizar nome/endereço |

### Cortes

| Método | Rota | Auth | Descrição |
| --- | --- | --- | --- |
| `POST` | `/haircuts` | sim | Criar modelo (limite 3 no plano grátis) |
| `GET` | `/haircuts` | sim | Listar |
| `PUT` | `/haircuts` | sim | Atualizar (Premium) |
| `GET` | `/haircut/check` | sim | Status da assinatura |
| `GET` | `/haircut/count` | sim | Quantidade de cortes |
| `GET` | `/haircut/detail` | sim | Detalhe de um corte |

### Assinatura (Stripe)

| Método | Rota | Auth | Descrição |
| --- | --- | --- | --- |
| `POST` | `/subscriptions` | sim | Cria Checkout Session e devolve `{ sessionId, url }` |
| `POST` | `/subscriptions/confirm` | sim | Confirma pagamento com `session_id` |
| `POST` | `/create-portal` | sim | Customer Portal; devolve `{ url }` |
| `POST` | `/webhook` | não | Eventos Stripe (body cru + assinatura) |

Eventos tratados no webhook:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

### Agendamentos

| Método | Rota | Auth | Descrição |
| --- | --- | --- | --- |
| `POST` | `/schedules` | sim | Novo agendamento |
| `GET` | `/schedules` | sim | Listar |
| `DELETE` | `/schedules` | sim | Finalizar |

---

## Frontend — páginas

| Rota | Acesso | Descrição |
| --- | --- | --- |
| `/` | visitante | Redireciona para `/login` |
| `/login` | visitante | Entrar |
| `/register` | visitante | Cadastrar barbearia |
| `/dashboard` | logado | Agenda do dia |
| `/haircuts` | logado | Modelos de corte |
| `/haircuts/new` | logado | Novo modelo |
| `/haircuts/[id]` | logado | Editar modelo (Premium) |
| `/new` | logado | Novo agendamento |
| `/planos` | logado | Grátis vs Premium; Checkout e portal |
| `/profile` | logado | Dados da conta |

Fluxo Premium em `/planos`:

1. **Vire premium** → `POST /subscriptions` → redireciona para o Checkout Stripe
2. Pagamento → retorno em `/planos?session_id=...` → `POST /subscriptions/confirm` + `GET /me`
3. **Alterar assinatura** → `POST /create-portal` → usa o campo `url` da resposta

---

## Assinatura: como o `sub_...` entra no banco

O `POST /subscriptions` **não** devolve o ID da assinatura. Ele só cria a sessão de pagamento (`cs_test_...`).

O `sub_...` é salvo depois, por:

1. Webhook (`/webhook`), quando o Stripe consegue chamar a API
2. Sincronização no `GET /me`, login e conferência de plano — lista assinaturas do `stripe_customer_id` e grava a ativa
3. `POST /subscriptions/confirm` na volta do Checkout

---

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/), descrição em português, imperativo, sem ponto final:

```text
feat: adiciona portal de assinatura Stripe
fix: corrige redirecionamento do portal no frontend
```

Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

---

## Scripts

**Backend (`barber/`)**

```bash
yarn dev                 # API com reload (porta 3333)
npx prisma generate      # client Prisma
npx prisma migrate dev   # nova migration (desenvolvimento)
npx prisma studio        # interface do banco
```

**Frontend (`barber-web/`)**

```bash
yarn dev     # Next.js (porta 3000)
yarn build
yarn start
yarn lint
```
