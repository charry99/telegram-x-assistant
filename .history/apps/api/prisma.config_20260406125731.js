module.exports = {
  schema: "../../prisma/schema.prisma",
  generator: {
    provider: "prisma-client-js",
  },
  datasource: {
    provider: "postgresql",
    url: "env(\"DATABASE_URL\")",
  },
};
