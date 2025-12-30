/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "commercium-app",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    const web = new sst.cloudflare.StaticSite("Web", {
      path: "apps/mobile/dist"
    });

    const api = new sst.aws.Function("ApiServer", {
      handler: "apps/api/handler.handler",
      url: true,
      timeout: "60 seconds",
      environment: {
        DATABASE_URL: process.env.DATABASE_URL as string,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY as string,
      },
    });
    return {
      api: api.url,
      web: web.url,
    };
  },
});
