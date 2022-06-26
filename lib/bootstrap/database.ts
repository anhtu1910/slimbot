import { Sequelize } from 'sequelize'

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'data/database.sqlite',
  logging: false,
})

sequelize
  .authenticate()
  .then(() => {
    console.log(`SQLite successfully connected!`)
  })
  .catch((error: any) => {
    console.error('Unable to connect to SQLite database:', error)
  })

export default sequelize
