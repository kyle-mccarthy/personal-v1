import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { parse } from 'dotenv';
import * as fs from 'fs';
import * as joi from 'joi';

export interface EnvConfig {
  [key: string]: any;
}

@Injectable()
export class ConfigService implements TypeOrmOptionsFactory {
  private readonly envConfig: EnvConfig;

  constructor(path: string = '.env') {
    this.envConfig = this.validateConfig(parse(fs.readFileSync(path)));
  }

  public getConfig() {
    return this.envConfig;
  }

  public get(key: string): any {
    return this.envConfig[key];
  }

  public createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: this.get('DB'),
      host: this.get('DB_HOST'),
      port: this.get('DB_PORT'),
      username: this.get('DB_USER'),
      password: this.get('DB_PASS'),
      database: this.get('DB_NAME'),
      synchronize: this.get('DB_SYNC'),
      entities: [`${__dirname}/../**/*.entity.ts`],
    };
  }

  private validateConfig(envConfig: EnvConfig): EnvConfig {
    const schema: joi.ObjectSchema = joi.object({
      DB: joi.string().default('postgres'),
      DB_HOST: joi.string().optional(),
      DB_PORT: joi.number().optional(),
      DB_NAME: joi.string(),
      DB_USER: joi.string().optional(),
      DB_PASS: joi.string().optional(),
      DB_SYNC: joi.boolean().default(false),
    });

    const { error, value } = joi.validate(envConfig, schema);

    if (error) {
      throw new Error(`Config validator error: ${error.message}`);
    }

    return value;
  }
}