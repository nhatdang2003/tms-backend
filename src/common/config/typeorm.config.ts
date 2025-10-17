import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
dotenv.config()

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'dev'}` })

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || '12345?a',
  database: process.env.DATABASE_NAME || 'course_db',
  synchronize: false,
  dropSchema: false,
  logging: false,
  logger: 'file',
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/**/*.ts'],
  migrationsTableName: 'migration_table',
})
