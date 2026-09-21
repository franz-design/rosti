/* oxlint-disable no-console */

import { EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'
import { RostiSeeder } from './rosti.seeder'

/**
 * Default development seeder.
 * Creates an admin owner, one club, 15 joined players, a season, and past matches.
 */
export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    await new RostiSeeder().run(em)
    console.info('DatabaseSeeder done')
  }
}
