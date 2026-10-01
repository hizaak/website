// Variables the API cannot run without. Checked at startup so that a
// missing secret stops the deploy instead of breaking logins later.
const REQUIRED = ["JWT_SECRET", "MONGO_USER", "MONGO_PASS", "MONGO_PORT", "MONGO_DB"];

const checkEnvironment = () => {
  const required =
    process.env.NODE_ENV === "production" ? REQUIRED : [...REQUIRED, "MONGO_HOST"];
  const missing = required.filter((name) => !process.env[name]);

  if (missing.length) {
    throw new Error(`Missing environment variable(s): ${missing.join(", ")}.`);
  }
};

module.exports = { checkEnvironment };
