import { CanActivate, ExecutionContext, ForbiddenException, Inject, UnauthorizedException } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Request } from "express";
import { firstValueFrom } from "rxjs";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { NATS_SERVICE } from "src/config/services.config";



export class AuthGuard implements CanActivate {

    constructor(
        @Inject(NATS_SERVICE) private readonly client: ClientProxy,
        private reflector:Reflector
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const validRoles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler())
        const request = context.switchToHttp().getRequest();

        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException('Token not found');
        }
        try {
            const {user}=await firstValueFrom(
                this.client.send('auth.verify.access.token',token)
            )

            request['user'] = user
            request['token'] = token;

            if (validRoles && validRoles.length > 0 ) {
                const hasRole = ()=> validRoles.some((role)=> user.roles?.includes(role))
                if (!user.roles  || !hasRole()) {
                    throw new ForbiddenException('Insufficient permissions');
                }
            }
            return true;
        } catch(error) {
            if (error instanceof ForbiddenException) {
                throw error;
            }
            throw new UnauthorizedException();
        }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }

}