import 'dotenv/config'
import * as joi from 'joi';


interface EnvVars{
    PORT: number;
    NODE_ENV:string,
    NATS_SERVERS: string[]
}

const envsSchema = joi.object({
    PORT: joi.number().required(),
    NODE_ENV: joi.string().required(),
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
    NODE_ENV: envsVars.NODE_ENV,
    NATS_SERVERS: envsVars.NATS_SERVERS
}