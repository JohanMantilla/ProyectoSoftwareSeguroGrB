import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class RpcCustomExceptionFilter implements ExceptionFilter{
  catch(exception: RpcException, host: ArgumentsHost){
    
    const context = host.switchToHttp();
    const response = context.getResponse();

    const rpcError = exception.getError();

    if (rpcError.toString().includes('Empty response')) {
      return response.status(500).json({
        status: 500,
        message: rpcError.toString().substring(0,rpcError.toString().indexOf('(')-1)
      })
    }

    if (typeof rpcError === 'object' && 'status' in rpcError && 'message' in rpcError) {
      const status = isNaN(+rpcError.status)? 400 : +rpcError.status;
      return response.status(status).json(rpcError)
    }

    response.status(401).json({
      status: 401,
      message: rpcError
    });

  }
}
