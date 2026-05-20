import { OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
export declare class DatabaseModule implements OnModuleInit {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    onModuleInit(): Promise<void>;
}
