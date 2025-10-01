import { Injectable } from "@nestjs/common";
import { Counter, Histogram, register } from "prom-client";

@Injectable()
export class MetricsService {
    private readonly httpRequestTotal: Counter<string>;
    private readonly httpRequestDuration: Histogram<string>;
    private readonly httpErrorTotal: Counter<string>;

    constructor() {
        this.httpRequestTotal = new Counter({
            name: 'http_requests_total',
            help: 'Total numbers of API requests',
            labelNames: ['method', 'route'],
            registers: [register],  // attach to default global registry
        });

        this.httpRequestDuration = new Histogram({
            name: 'http_request_duration_seconds',
            help: 'Durations of API request in seconds',
            labelNames: ['method', 'route'],
            buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
            registers: [register],
        });

        this.httpErrorTotal = new Counter({
            name: 'http_errors_total',
            help: 'Total number of API errors',
            labelNames: ['method', 'route', 'status'],
            registers: [register],
        });
    }

    incRequests(method: string, route: string) {
        this.httpRequestTotal.inc({ method, route });
    }

    observeDuration(method: string, route: string, duration: number) {
        this.httpRequestDuration.observe({ method, route }, duration);
    }

    incErrors(method: string, route: string, status: number) {
        this.httpErrorTotal.inc({ method, route, status: status.toString() });
    }

    getMetrics() {
        return register.metrics();
    }
}
