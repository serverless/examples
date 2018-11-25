using System;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using DotNetServerless.Domain.Entity;
using DotNetServerless.Domain.Requests;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using JsonSerializer = Amazon.Lambda.Serialization.Json.JsonSerializer;

namespace DotNetServerless.Functions.Lambda
{
  public class GetItemFunction
  {
    private readonly IServiceProvider _serviceProvider;

    public GetItemFunction() : this(Startup.BuildContainer())
    {
    }

    public GetItemFunction(IServiceProvider serviceProvider)
    {
      _serviceProvider = serviceProvider;
    }

    [LambdaSerializer(typeof(JsonSerializer))]
    public async Task<APIGatewayProxyResponse> Run(APIGatewayProxyRequest request)
    {
      var requestModel = JsonConvert.DeserializeObject<GetItemRequest>(request.Body);
      var mediator = _serviceProvider.GetService<IMediator>();

      var result = await mediator.Send(requestModel);
      return new APIGatewayProxyResponse { StatusCode =  201,  Body = JsonConvert.SerializeObject(result)};
    }
  }
}
