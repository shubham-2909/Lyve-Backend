const { db } = require("../../config/database");
const { DataTypes } = require("sequelize");

const isDate = (date) => {
  return (
    date instanceof Date &&
    new Date(date) !== "Invalid Date" &&
    !isNaN(new Date(date))
  );
};

const eventModel = db.define("Event", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: "Event title Can't Be null" },
      notEmpty: { msg: "Event title Can't Be null" },
    },
  },
});
