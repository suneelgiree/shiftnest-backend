export declare const databaseConfig: {
    host: string;
    port: number;
    username: string | undefined;
    password: string | undefined;
    database: string | undefined;
    synchronize: boolean;
    logging: boolean;
};
export declare const redisConfig: {
    host: string;
    port: number;
    password: string | undefined;
    db: number;
};
export declare const jwtConfig: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
};
//# sourceMappingURL=database.d.ts.map