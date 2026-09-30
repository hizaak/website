// Changes the admin password. Run inside the backend container:
//   docker exec -it site-perso-backend node scripts/set-admin-password.js
const readline = require("readline");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const { ADMIN_PASSWORD_MIN_LENGTH } = require("../config/validation");

const ask = (question) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });

(async () => {
  const password = await ask(`New admin password (${ADMIN_PASSWORD_MIN_LENGTH} characters or more): `);

  if (password.length < ADMIN_PASSWORD_MIN_LENGTH) {
    console.error("Password too short.");
    process.exit(1);
  }

  await connectDB();

  // Single-user site: the admin may have been renamed.
  const admin = await User.findOne();
  if (!admin) {
    console.error("No admin account.");
    process.exit(1);
  }

  admin.password = password;
  await admin.save();
  console.log(`Password changed for "${admin.username}".`);

  await mongoose.disconnect();
})();
