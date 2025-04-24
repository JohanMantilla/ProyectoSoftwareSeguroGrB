import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { Reflector } from "@nestjs/core";
import { firstValueFrom } from "rxjs";
import { NATS_SERVICE } from "src/config/services.config";


@Injectable()
export class RefreshTokenGuard implements CanActivate {
    constructor(
        @Inject(NATS_SERVICE) private readonly client: ClientProxy,
        private reflector:Reflector
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const validRoles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler())
        const request = context.switchToHttp().getRequest();
        const refreshToken = request.cookies['refreshToken'];
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not found');
        }
        try {

            const {user}=await firstValueFrom(
                this.client.send('auth.verify.refresh.token',refreshToken)
            )
            
            request['user'] = user
            if (validRoles && validRoles.length > 0 ) {
                const hasRole = ()=> validRoles.some((role)=> user.roles?.includes(role))
                if (!user.roles  || !hasRole()) {
                    throw new ForbiddenException('Insufficient permissions');
                }
            }
            
            return true;
        } catch(error) {
            if (error instanceof RpcException) {
                throw error
            }
            throw new UnauthorizedException('Invalid refresh token');
            
        }
    }

}