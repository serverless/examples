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
  public class UpdateFunction
  {
    private readonly IServiceProvider _serviceProvider;

    public UpdateFunction() : this(Startup.BuildContainer())
    {
    }

    protected internal UpdateFunction(IServiceProvider serviceProvider)
    {
      _serviceProvider = serviceProvider;
    }

    [LambdaSerializer(typeof(JsonSerializer))]
    public async Task<Item> Handle(UpdateItemRequest request)
    {
      var mediator = _serviceProvider.GetService<IMediator>();
      return await mediator.Send(request);
    }
  }
}
