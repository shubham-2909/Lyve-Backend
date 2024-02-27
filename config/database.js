const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.URI, { dialect: "postgres" });

module.exports = {
  connectDatabase: async () => {
    try {
      sequelize.sync();
      // sequelize.sync({ force: true });
      await sequelize.authenticate();
      console.log("Connection has been established successfully.");
    } catch (error) {
      console.error("Unable to connect to the database:", error);
    }
  },
  db: sequelize,
};
