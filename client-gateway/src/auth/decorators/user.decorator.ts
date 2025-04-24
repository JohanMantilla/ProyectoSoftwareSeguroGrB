import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";




export const User = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        if (!request.user) {
            throw new UnauthorizedException('User not found in request')
        }
        return data ? request.user[data]:request.user;
    }
)