import { Hono } from 'hono'
import { User } from "@commercium/core"
import { authRoutes } from './routes/auth';
import { openAPIRouteHandler } from 'hono-openapi'
import { Scalar } from '@scalar/hono-api-reference';
import { userRoutes } from './routes/users';
import { productRoutes, storeRoutes } from './routes/store';

const app = new Hono()

const routes = app
    .route("/api/auth", authRoutes)
    .route("/api/users", userRoutes)
    .route("/api/stores", storeRoutes)
    .route("/api/stores/:storeId/products", productRoutes)
    .get("/", async (c) => {
        const user = await User.fetch(1);
        console.log(user)
        return c.text("Hello Hono!")
    })
    .get("/docs", Scalar({
        url: "/openapi"
    }))
    .get(
        '/openapi',
        openAPIRouteHandler(app, {
            documentation: {
                info: {
                    title: 'Hono API',
                    version: '1.0.0',
                    description: 'Commercium API',
                },
                servers: [
                    { url: 'http://localhost:3001', description: 'Local Server' },
                ],
            },
        })
    )

export default routes;