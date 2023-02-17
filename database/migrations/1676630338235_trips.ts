import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'trips'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('uuid_generate_v4()').knexQuery)
      table.uuid('departure_location_id').unsigned().references('locations.id').notNullable()
      table.uuid('arrival_location_id').unsigned().references('locations.id').notNullable()
      table.dateTime('departure_datetime').notNullable()
      table.integer('max_passengers').notNullable()
      table.integer('price').notNullable()
      table.uuid('driver_id').unsigned().references('users.id').notNullable()
      table.text('content')

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
