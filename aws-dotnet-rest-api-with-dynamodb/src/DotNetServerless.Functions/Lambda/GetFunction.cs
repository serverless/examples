using System;
using System.Threading.Tasks;
using Amazon.Lambda.Core;
using Amazon.Lambda.Serialization.Json;
using DotNetServerless.Domain.Entity;
using DotNetServerless.Domain.Requests;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace DotNetServerless.Functions.Lambda
{
  public class GetFunction
  {
    private readonly IServiceProvider _serviceProvider;

    public GetFunction() : this(Startup.BuildContainer())
    {
    }

    public GetFunction(IServiceProvider serviceProvider)
    {
      _serviceProvider = serviceProvider;
    }

    [LambdaSerializer(typeof(JsonSerializer))]
    public async Task<Item> Run(Guid id)
    {
      var request = new GetItemRequest {Id = id};
      var mediator = _serviceProvider.GetService<IMediator>();

      return await mediator.Send(request);
    }
  }
}
