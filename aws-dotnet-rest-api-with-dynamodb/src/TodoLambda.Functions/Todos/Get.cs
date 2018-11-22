using System;
using System.Threading.Tasks;
using Amazon.Lambda.Core;
using Amazon.Lambda.Serialization.Json;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using TodoLambda.Domain.Entity;
using TodoLambda.Domain.Requests;

namespace TodoLambda.Functions.Todos
{
  public class GetFunction
  {
    private readonly IServiceProvider _serviceProvider;

    public GetFunction() : this(Startup.BuildContainer())
    {
    }

    protected internal GetFunction(IServiceProvider serviceProvider)
    {
      _serviceProvider = serviceProvider;
    }

    [LambdaSerializer(typeof(JsonSerializer))]
    public async Task<Item> Handle(Guid id)
    {
      var request = new GetItemRequest {Id = id};
      var mediator = _serviceProvider.GetService<IMediator>();

      return await mediator.Send(request);
    }
  }
}
