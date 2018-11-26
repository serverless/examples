using System;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using DotNetServerless.Domain.Requests;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;

namespace DotNetServerless.Lambda.Functions
{
  public class GetItemFunction
  {
    private readonly IServiceProvider _serviceProvider;

    public GetItemFunction() : this(Startup
      .BuildContainer()
    .BuildServiceProvider())
    {
    }

    public GetItemFunction(IServiceProvider serviceProvider)
    {
      _serviceProvider = serviceProvider;
    }

    [LambdaSerializer(typeof(Amazon.Lambda.Serialization.Json.JsonSerializer))]
    public async Task<APIGatewayProxyResponse> Run(APIGatewayProxyRequest request)
    {
      var requestModel = new GetItemRequest {Id = new Guid(request.PathParameters["id"])}; 
      var mediator = _serviceProvider.GetService<IMediator>();

      var result = await mediator.Send(requestModel);
      return new APIGatewayProxyResponse { StatusCode =  201,  Body = JsonConvert.SerializeObject(result)};
    }
  }
}
