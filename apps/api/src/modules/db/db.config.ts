import type { Options } from '@mikro-orm/postgresql'
import { EntityCaseNamingStrategy } from '@mikro-orm/core'
import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy'
import { Migrator } from '@mikro-orm/migrations'
import { defineConfig } from '@mikro-orm/postgresql'
import { SeedManager } from '@mikro-orm/seeder'
import { config } from '../../config/env.config'

type CreateMikroOrmOptions = {
  isTest?: boolean
} & Options

export const entityGlobs = {
  entities: ['./dist/**/*.entity.js'],
  entitiesTs: ['./src/**/*.entity.ts'],
}

export function createMikroOrmOptions(options?: CreateMikroOrmOptions) {
  // Nest (`nest start` / `node dist/main.js`) runs compiled JS. Always prefer
  // `entities` (dist) there — Node's native type-stripping cannot resolve the
  // extensionless imports in `src/**/*.entity.ts`.
  //
  // The MikroORM CLI registers a TS loader and forces `preferTs` unless
  // `MIKRO_ORM_CLI_PREFER_TS=false` (see Dockerfile). Keep `entitiesTs` /
  // `pathTs` populated so local `db:migrate:*` can still read `src/`.
  const migrationsPath = './dist/modules/db/migrations'

  return defineConfig({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    dbName: config.database.name,
    entities: entityGlobs.entities,
    entitiesTs: entityGlobs.entitiesTs,
    preferTs: false,
    metadataProvider: ReflectMetadataProvider,
    // Column names mirror entity property names verbatim (camelCase),
    // matching the database schema. Relation FK columns still declare an
    // explicit `fieldName` since the property name (e.g. `user`) differs
    // from the column (e.g. `userId`).
    namingStrategy: EntityCaseNamingStrategy,
    forceUtcTimezone: true,
    debug: config.env === 'development',
    extensions: [SeedManager, Migrator],
    migrations: {
      path: migrationsPath,
      pathTs: './src/modules/db/migrations',
      allOrNothing: true,
      disableForeignKeys: false,
    },
    seeder: {
      path: './dist/seeders',
      pathTs: './src/seeders',
      defaultSeeder: 'DatabaseSeeder',
      glob: '!(*.d).{js,ts}',
      emit: 'ts',
      fileName: (className: string) => className,
    },
    ...options,
  })
}

export function createTestMikroOrmOptions(options?: Options) {
  return createMikroOrmOptions({ isTest: true, ...options })
}

export default createMikroOrmOptions
