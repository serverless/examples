using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using DotNetServerless.Application.Entities;
using DotNetServerless.Application.Infrastructure.Repositories;
using DotNetServerless.Lambda;
using DotNetServerless.Lambda.Functions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Moq;
using Xunit;

namespace DotNetServerless.Tests.Functions
{
  public class GetItemFunctionTests
  {
    public GetItemFunctionTests()
    {
      _mockRepository = new Mock<IItemRepository>();
      _mockRepository.Setup(_ => _.GetById<Item>(It.IsAny<string>(), It.IsAny<CancellationToken>())).ReturnsAsync(new List<Item>{ new Item{ Id = Guid.NewGuid().ToString()}});

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
      await _sut.Run(new APIGatewayProxyRequest{ PathParameters = new Dictionary<string, string>
        {
          { "id", Guid.NewGuid().ToString()}
        }});
      _mockRepository.Verify(_ => _.GetById<Item>(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Once);
    }
    
    [Theory]
    [InlineData(200)]
    public async Task run_should_return_200_when_find_the_record(int statusCode)
    {
      var result = await _sut.Run(new APIGatewayProxyRequest{ PathParameters = new Dictionary<string, string>
      {
        { "id", Guid.NewGuid().ToString()}
      }});
      
      Assert.Equal(result.StatusCode, statusCode);
    }
    
    [Theory]
    [InlineData(404)]
    public async Task run_should_return_404_when_NOT_find_the_record(int statusCode)
    {
      _mockRepository.Setup(_ => _.GetById<Item>(It.IsAny<string>(), It.IsAny<CancellationToken>()))
        .ReturnsAsync(new List<Item>());
      
      var result = await _sut.Run(new APIGatewayProxyRequest{ PathParameters = new Dictionary<string, string>
      {
        { "id", Guid.NewGuid().ToString()}
      }});
      
      Assert.Equal(result.StatusCode, statusCode);
    }
  }
}
