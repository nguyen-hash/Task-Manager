import { Injectable, NestMiddleware } from "@nestjs/common";
import { MetricsService } from "./metrics.service";

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
    constructor(private readonly metricsService: MetricsService) {}

    use(req: any, res: any, next: () => void) {
        const start = Date.now();

        res.on('finish', () => {
            const duration = (Date.now() - start) / 1000;
            const route = req.route?.path || req.url;

            this.metricsService.incRequests(req.method, route);
            this.metricsService.observeDuration(req.method, route, duration);
            
            if(res.statusCode >= 400) {
                this.metricsService.incErrors(req.method, route, res.statusCode);
            }
        });

        next();
    }
}