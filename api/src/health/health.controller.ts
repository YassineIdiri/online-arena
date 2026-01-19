import { Controller, Get } from "@nestjs/common";

@Controller()
export class HealthController {
  @Get("healthz")
  healthz() {
    return {
      ok: true,
      message: "pong",
      timestamp: new Date().toISOString(),
      uptimeSec: Math.floor(process.uptime()),
    };
  }
}
