require("dotenv").config(); 
require('colors');
const app = require("./app.js");
const sequelize = require("./config/database");
const customerRoutes = require('./routes/customerRoutes.js'); 
const authRoutes = require('./routes/authRoutes.js')


app.use('/api/customers', customerRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL Database connected successfully.".bgGreen);
    await sequelize.sync();

    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(" DB connection failed:".bgRed, error.message);
  }
})();



