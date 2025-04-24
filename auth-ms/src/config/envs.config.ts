import 'dotenv/config'
import * as joi from 'joi';


interface EnvVars{
    PORT: number;
    DATABASE_URL: string,
    JWT_SECRET_ACCESS: string,
    JWT_SECRET_REFRESH: string,
    JWT_SECRET_RESET_PASSWORD:string,
    NATS_SERVERS: string[];
}

const envsSchema = joi.object({
    PORT: joi.number().required(),
    DATABASE_URL: joi.string().required(),
    JWT_SECRET_ACCESS: joi.string().required(),
    JWT_SECRET_REFRESH: joi.string().required(),
    JWT_SECRET_RESET_PASSWORD: joi.string().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required()
}).unknown(true)

const { error, value } = envsSchema.validate({
    ...process.env,
    NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
})

if (error) {
    throw new Error(`Config validation Error ${error.message}`)
}

const envsVars: EnvVars = value;


export const envs = {
    PORT: envsVars.PORT,
    DATABASE_URL: envsVars.DATABASE_URL,
    NATS_SERVERS: envsVars.NATS_SERVERS,
    //JWT_SECRET:envsVars.JWT_SECRET
    JWT_SECRET_RESET_PASSWORD: envsVars.JWT_SECRET_RESET_PASSWORD,
    JWT_SECRET_ACCESS: envsVars.JWT_SECRET_ACCESS,
    JWT_SECRET_REFRESH: envsVars.JWT_SECRET_REFRESH,
}
