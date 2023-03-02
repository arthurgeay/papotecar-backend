import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'passengers'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('user_id').unsigned().references('users.id').notNullable()
      table.uuid('trip_id').unsigned().references('trips.id').notNullable()
      table.boolean('is_approve').defaultTo(false)

      table.primary(['user_id', 'trip_id'])

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
