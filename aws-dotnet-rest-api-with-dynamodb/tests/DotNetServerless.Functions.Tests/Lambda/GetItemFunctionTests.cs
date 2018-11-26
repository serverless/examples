using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using DotNetServerless.Domain.Entity;
using DotNetServerless.Domain.Infrastructure.Repositories;
using DotNetServerless.Domain.Requests;
using DotNetServerless.Functions.Lambda;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Moq;
using Newtonsoft.Json;
using Xunit;

namespace DotNetServerless.Functions.Tests.Lambda
{
  public class GetItemFunctionTests
  {
    public GetItemFunctionTests()
    {
      _mockRepository = new Mock<IItemRepository>();
      _mockRepository.Setup(_ => _.GetById<Item>(It.IsAny<string>(), It.IsAny<CancellationToken>())).ReturnsAsync(new List<Item>{ new Item{ Id = Guid.NewGuid()}});

      var serviceCollection = Startup.BuildContainer();

      serviceCollection.Replace(new ServiceDescriptor(typeof(IItemRepository), _ => _mockRepository.Object,
        ServiceLifetime.Transient));

      _sut = new GetItemFunction(serviceCollection.BuildServiceProvider());
    }

    private readonly GetItemFunction _sut;
    private readonly Mock<IItemRepository> _mockRepository;

    [Fact]
    public async Task run_should_trigger_mediator_handler_and_repository()
    {
      await _sut.Run(new APIGatewayProxyRequest{ Body = JsonConvert.SerializeObject(new GetItemRequest())});
      _mockRepository.Verify(_ => _.GetById<Item>(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Once);
    }
  }
}
