import { Controller, Get, Res } from "@nestjs/common";
import type { Response } from "express";
import { register } from "prom-client";

@Controller('metrics')
export class MetricsController {
    @Get()
    async getMetrics(@Res() res: Response) {
        res.setHeader('Content-Type', register.contentType);
        res.end(await register.metrics());
    }
}
