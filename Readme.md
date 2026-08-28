# JSONPlaceholder Middleware

A scalable Node.js/Express middleware layer that sits between clients and the
[JSONPlaceholder](https://jsonplaceholder.typicode.com) fake REST API,
adding caching, retries, rate limiting, pagination, filtering, sorting,
request validation, and multi-resource aggregation that the raw API
doesn't provide.

## Why this exists

JSONPlaceholder is a raw test API — no caching, no rate limits, no relations
resolved for you. This project wraps it with a production-style middleware
layer, built to demonstrate patterns used in real backend services: layered
architecture, resilience to upstream failure, and request validation.

## Features

- **Caching** — in-memory cache (TTL-based) so repeated requests don't hit
  the upstream API every time. `X-Cache: HIT/MISS` header on every response.
- **Retry with backoff** — transient upstream failures are retried
  automatically with exponential backoff, instead of failing immediately.
- **Rate limiting** — protects both this service and the upstream API from
  being overwhelmed.
- **Pagination, filtering & sorting** — `/api/posts` supports `page`,
  `limit`, `userId` (filter), `sortBy`, and `order` query params —
  JSONPlaceholder doesn't natively support most of these.
- **Write endpoint** — `POST /api/posts` creates a post via the upstream
  API and invalidates the relevant cache entry.
- **Request validation** — body and route-param validation middleware
  rejects malformed requests with a `400` before they reach business logic.
- **Aggregation endpoint** — `/api/users/:id/summary` combines a user, their
  posts, and per-post comment counts into a single response, fetched in
  parallel rather than sequentially.
- **Interactive API docs** — Swagger UI at `/api-docs`, generated from
  JSDoc comments in the route files.
- **Centralized error handling** — consistent error response shape across
  every route.
- **Security headers & CORS** — via `helmet` and `cors`.
- **Health check endpoint** — for uptime monitoring.

## Architecture

```
Client → Rate Limiter → Router → Validation → Controller → Service → Cache? → HTTP Client (retry) → JSONPlaceholder
```

| Layer | Responsibility |
|---|---|
| `routes/` | Maps URLs to controller functions, applies validation middleware. |
| `controllers/` | Handles req/res, calls the service layer, shapes the response. |
| `services/` | Business logic — calls upstream, aggregates, applies caching. |
| `middleware/` | Cross-cutting concerns — rate limiting, validation, centralized error handling. |
| `utils/` | Shared low-level tools — cache wrapper, HTTP client with retry. |

Each layer can be swapped independently — for example, the in-memory cache
could be replaced with Redis without touching routes, controllers, or
services. See [`DESIGN.md`](./DESIGN.md) for the full reasoning behind each
design decision and its trade-offs.

## Prerequisites

- [Node.js](https://nodejs.org) v18 or later
- npm (bundled with Node)

```bash
node -v
npm -v
```

## Installation

```bash
git clone https://github.com/<your-username>/jsonplaceholder-middleware.git
cd jsonplaceholder-middleware
npm install
```

## Environment variables

Create a `.env` file in the project root (copy `.env.example` as a starting
point — `.env` itself should never be committed):

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port the server listens on. **Must be a plain number** (e.g. `5000`), not a full URL. |
| `UPSTREAM_BASE_URL` | `https://jsonplaceholder.typicode.com` | Base URL of the upstream API |
| `ALLOWED_ORIGIN` | `*` | CORS allowed origin |

## Running locally

```bash
npm start        # production mode
npm run dev        # auto-restarts on file changes (nodemon)
```

Server starts on `http://localhost:<PORT>` (default `3000`, or whatever
`PORT` is set to in `.env`).

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check — returns status and uptime |
| `GET` | `/api-docs` | Interactive Swagger UI documentation |
| `GET` | `/api/posts?page=1&limit=10&userId=1&sortBy=title&order=asc` | Filtered, sorted, paginated list of posts |
| `GET` | `/api/posts/:id` | Single post by ID (validates `id` is a positive integer) |
| `POST` | `/api/posts` | Create a post — requires `title`, `body`, `userId` in the JSON body |
| `GET` | `/api/users/:id/summary` | Aggregated user profile: user + posts + comment counts |
| `GET` | `/api/_cache-stats` | Cache hit/miss statistics |

### Examples

```bash
curl http://localhost:5000/api/posts?userId=1&sortBy=title
curl http://localhost:5000/api/posts/1
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Hello","body":"World","userId":1}'
curl http://localhost:5000/api/users/1/summary
```

Check the `X-Cache` response header — `MISS` on the first call to a given
resource, `HIT` on subsequent calls within the cache TTL.

## Project structure

```
.
├── controllers/          # req/res handling, calls services
│   ├── postsController.js
│   └── userController.js
├── routes/                # URL → controller mapping, applies validation
│   ├── posts.js
│   └── userRoutes.js
├── services/               # business logic, upstream calls, caching, aggregation
│   └── jsonPlaceholderService.js
├── middleware/              # rate limiting, request validation, error handling
│   ├── errorHandler.js
│   ├── rateLimiter.js
│   └── validation.js
├── utils/                    # cache wrapper, HTTP client with retry, Swagger setup
│   ├── cache.js
│   ├── httpClient.js
│   └── swagger.js
├── server.js                  # app entrypoint
├── .env.example                # template for required environment variables
├── DESIGN.md                    # architecture & design decision notes
└── package.json
```

## Known limitations / roadmap

Being upfront about what's not done yet, rather than presenting this as
finished:

- **No API versioning yet.** All routes are under `/api/...` directly
  rather than `/api/v1/...`. Planned, not yet implemented.
- **No graceful shutdown handling.** The server doesn't currently handle
  `SIGTERM` to close connections cleanly before exiting. Planned.
- **No automated tests yet.** Planned: unit tests for the service layer
  (HTTP client mocked) and integration tests for routes.
- **Cache invalidation on write is minimal.** `POST /api/posts` only
  invalidates one specific cached list-page key, not every cached
  combination of filters/sort/page that could include the new post. A
  more complete solution would use tag-based or pattern-based invalidation.
- **Cache and rate limiter are in-memory**, so they don't share state
  across multiple instances of this service. A production deployment
  would back both with Redis (see `DESIGN.md` §3).
- **No structured logging** — currently uses `console.error`; would move
  to a structured logger (e.g. `pino`) with request IDs for real
  production use.

## Design decisions

Full reasoning for every architectural choice — caching strategy, retry
logic, why aggregation is done in parallel, what "scalable" means for this
project — is documented in [`DESIGN.md`](./DESIGN.md).

## License

MIT