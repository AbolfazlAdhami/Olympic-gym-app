export const config = {
  app: {
    name: "gym-app",
    environment: process.env.NODE_ENV ?? "development",
  },
} as const;
