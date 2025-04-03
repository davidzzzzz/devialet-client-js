import OpenAPIBackend, { Request } from 'openapi-backend';
import express from 'express';
import path from 'path';
import morgan from 'morgan';
import * as http from "http";

import { Request as ExpressReq, Response as ExpressRes, Express } from 'express';

export class MockDosServer {
    private readonly app: Express;
    server: http.Server | null = null;

    constructor() {
        this.app = express();
        this.app.use(express.json()); 
        this.app.use(morgan('combined'))

        const api = new OpenAPIBackend({
            definition: path.join(__dirname, 'openapi.yml'),
            handlers: {
                validationFail: async (c, req: ExpressReq, res: ExpressRes) => res.status(400).json({ err: c.validation.errors }),
                notFound: async (c, req: ExpressReq, res: ExpressRes) => res.status(404).json({ err: 'Dos API not found' }),
                notImplemented: async (c, req: ExpressReq, res: ExpressRes) => {
                    const { status, mock } = c.api.mockResponseForOperation(c.operation.operationId || '');
                    return res.status(status).json(mock);
                },
            },
        });
        api.init();
        this.app.use((req, res) => api.handleRequest(req as Request, req, res));
    }

    public start(port: number = 9000): Promise<void> {
        return new Promise((resolve) => {
            this.server = this.app.listen(port, () => {
                console.info(`api listening at http://localhost:${port}`)
                resolve();
            });
        });
    }
    public stop(): Promise<void>{
        if (this.server != null) {
            return new Promise((resolve) => {
                this.server?.close(() => {
                    console.info('api closed');
                    resolve();
                });
            });
        }
        return Promise.resolve();
    }
}