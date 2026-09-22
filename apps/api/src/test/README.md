# Tests pour l'API NestJS

Ce dossier contient les tests pour l'API NestJS du projet. Nous utilisons Vitest comme framework de test.

## Structure des tests

```
src/test/
├── helpers/
│   ├── test-app.helper.ts      # initializeTestApp – bootstrap NestJS app pour e2e
│   ├── test-auth.helper.ts     # createRequest, createSessionFromUser, testSessionMiddleware
│   ├── test-db.helper.ts       # createTestOrm, cleanupTestOrm
│   └── test-user.helpers.ts    # createUserWithSession
├── setup/
│   ├── test.setup.ts           # Import reflect-metadata
│   ├── test.e2e-setup.ts       # beforeEach/afterEach avec ORM + cleanup
│   └── test.global-setup.ts    # Container PostgreSQL partagé + env variables
```

La config Vitest se trouve dans `apps/api/vitest.config.ts` (projets `unit` et `e2e`).

Dans le dossier `src/modules/*/tests/`, vous trouverez les tests pour le module `*`.

- **Tests unitaires** : fichiers `*.spec.ts`
- **Tests e2e** : fichiers `*.e2e-spec.ts`

## Commandes

```bash
# Tests
pnpm test

# Tests en mode watch
pnpm test:watch

# Tests avec couverture
pnpm test:cov
```

## Architecture des tests e2e

Le système utilise :
- **1 container PostgreSQL partagé** démarré via `globalSetup` (rapide)
- **1 base de données par test** pour l'isolation totale
- **Sessions parallel-safe** avec `AsyncLocalStorage` + header `X-Test-Session-Id`
- **Pattern AAA** (Arrange-Act-Assert) recommandé

## Exemple de test e2e (controller)

```typescript
import { beforeEach, describe, expect, it } from 'vitest'
import { initializeTestApp } from '../../../../test/helpers/test-app.helper'
import { createRequest } from '../../../../test/helpers/test-auth.helper'
import { createUserWithSession } from '../../../../test/helpers/test-user.helpers'
import { SeasonModule } from '../season.module'

describe('seasonController (e2e)', () => {
  beforeEach(async (context) => {
    const { orm, app } = await initializeTestApp({ orm: context.orm }, {
      imports: [SeasonModule],
    })
    context.app = app
    context.em = orm.em.fork()
    context.request = createRequest(app)
  })

  it('should list seasons', async (context) => {
    const { request } = context
    // Arrange / Act / Assert against the seasons endpoints
    expect(request).toBeDefined()
  })
})
```

See [API testing](../../../documentation/src/content/docs/guides/api-testing.mdx) for more detail.
