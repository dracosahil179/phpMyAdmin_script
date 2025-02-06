const { Sequelize } = require("sequelize");
require("dotenv").config();

// First Database Connection
const db1 = new Sequelize(
  process.env.DBNAME,
  process.env.USER_NAME,
  process.env.PASSWORD,
  {
    host: process.env.HOST_NAME,
    dialect: "mysql",
    port: Number(process.env.DBPORT || 3306),
    logging: false,
  }
);

// Second Database Connection
const db2 = new Sequelize(
  process.env.DBNAME2,
  process.env.USER_NAME,
  process.env.PASSWORD,
  {
    host: process.env.HOST_NAME,
    dialect: "mysql",
    port: Number(process.env.DBPORT || 3306),
    logging: false,
  }
);

// Test Connections
(async () => {
  try {
    await db1.authenticate();
    console.log("✅ Connection to DB1 successful!");

    await db2.authenticate();
    console.log("✅ Connection to DB2 successful!");
  } catch (error) {
    console.error("❌ Database connection error:", error);
  }
})();

module.exports = { db1, db2 };
