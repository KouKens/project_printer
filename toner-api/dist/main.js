"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    serveWeb(app);
    const port = Number(process.env.PORT ?? 3000);
    const host = process.env.HOST;
    await (host ? app.listen(port, host) : app.listen(port));
}
function serveWeb(app) {
    const configured = process.env.WEB_ROOT;
    if (!configured)
        return;
    const root = (0, node_path_1.resolve)(configured);
    const index = (0, node_path_1.join)(root, 'index.html');
    if (!(0, node_fs_1.existsSync)(index)) {
        throw new Error(`WEB_ROOT に index.html がありません: ${index}。フロントの dist を指してください`);
    }
    app.useStaticAssets(root, { index: false });
    app.use((req, res, next) => {
        if (req.path.startsWith('/api'))
            return next();
        res.sendFile(index);
    });
}
bootstrap();
//# sourceMappingURL=main.js.map