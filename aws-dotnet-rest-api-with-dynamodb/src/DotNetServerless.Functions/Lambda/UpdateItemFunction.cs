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
  public class UpdateItemFunction
  {
    private readonly IServiceProvider _serviceProvider;

    public UpdateItemFunction() : this(Startup.BuildContainer())
    {
    }

    public UpdateItemFunction(IServiceProvider serviceProvider)
    {
      _serviceProvider = serviceProvider;
    }

    [LambdaSerializer(typeof(JsonSerializer))]
    public async Task<Item> Run(UpdateItemRequest request)
    {
      var mediator = _serviceProvider.GetService<IMediator>();
      return await mediator.Send(request);
    }
  }
}
