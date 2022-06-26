import { DataTypes } from 'sequelize'
import sequelize from '../bootstrap/database'

export const LastOrders = sequelize.define(
  'last_orders',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    // info: {
    //   type: DataTypes.TEXT,
    //   get: function () {
    //     return JSON.parse(this.getDataValue('value'))
    //   },
    //   set: function (value) {
    //     this.setDataValue('value', JSON.stringify(value))
    //   },
    // },
    clientOrderId: DataTypes.STRING,
    datetime: DataTypes.DATE,
    symbol: DataTypes.STRING,
    type: DataTypes.STRING,
    timeInForce: DataTypes.STRING,
    postOnly: DataTypes.STRING,
    reduceOnly: DataTypes.STRING,
    side: DataTypes.STRING,
    price: DataTypes.NUMBER,
    amount: DataTypes.NUMBER,
    cost: DataTypes.NUMBER,
    average: DataTypes.NUMBER,
    filled: DataTypes.NUMBER,
    remaining: DataTypes.NUMBER,
    status: DataTypes.STRING,
    // trades: {
    //   type: DataTypes.TEXT,
    //   get: function () {
    //     return JSON.parse(this.getDataValue('value'))
    //   },
    //   set: function (value) {
    //     this.setDataValue('value', JSON.stringify(value))
    //   },
    // },
    // fees: {
    //   type: DataTypes.TEXT,
    //   get: function () {
    //     return JSON.parse(this.getDataValue('value'))
    //   },
    //   set: function (value) {
    //     this.setDataValue('value', JSON.stringify(value))
    //   },
    // },
  },
  { timestamps: false }
)

LastOrders.sync().then(status => console.log('last_orders table created'))
