import 'dotenv/config'
import * as joi from 'joi';


interface EnvVars{
    //PORT: number;
    SENDGRID_API_KEY: string;
    SENDGRID_FROM_EMAIL: string;
    SENDGRID_FROM_NAME: string;
    //DATABASE_URL: string,
    NATS_SERVERS: string[];
}

const envsSchema = joi.object({
    //PORT: joi.number().required(),
    SENDGRID_API_KEY: joi.string().required(),
    SENDGRID_FROM_EMAIL: joi.string().required(),
    SENDGRID_FROM_NAME: joi.string().required(),
    //DATABASE_URL: joi.string().required(),
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
    //PORT: envsVars.PORT,
    SENDGRID_FROM_NAME: envsVars.SENDGRID_FROM_NAME,
    SENDGRID_API_KEY: envsVars.SENDGRID_API_KEY,
    SENDGRID_FROM_EMAIL: envsVars.SENDGRID_FROM_EMAIL,
    //DATABASE_URL: envsVars.DATABASE_URL,
    NATS_SERVERS: envsVars.NATS_SERVERS,
}
