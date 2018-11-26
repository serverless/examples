using System.Threading;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using DotNetServerless.Application.Entities;
using DotNetServerless.Application.Infrastructure.Repositories;
using DotNetServerless.Application.Requests;
using DotNetServerless.Lambda;
using DotNetServerless.Lambda.Functions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Moq;
using Newtonsoft.Json;
using Xunit;

namespace DotNetServerless.Tests.Functions
{
  public class CreateItemFunctionTests
  {
    public CreateItemFunctionTests()
    {
      _mockRepository = new Mock<IItemRepository>();
      _mockRepository.Setup(_ => _.Save(It.IsAny<Item>(), It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);

      var serviceCollection = Startup.BuildContainer();

      serviceCollection.Replace(new ServiceDescriptor(typeof(IItemRepository), _ => _mockRepository.Object,
        ServiceLifetime.Transient));

      _sut = new CreateItemFunction(serviceCollection.BuildServiceProvider());
    }

    private readonly CreateItemFunction _sut;
    private readonly Mock<IItemRepository> _mockRepository;

    [Fact]
    public async Task run_should_trigger_mediator_handler_and_repository()
    {
      await _sut.Run(new APIGatewayProxyRequest {Body = JsonConvert.SerializeObject(new CreateItemRequest())});
      _mockRepository.Verify(_ => _.Save(It.IsAny<Item>(), It.IsAny<CancellationToken>()), Times.Once);
    }
    
    [Theory]
    [InlineData(201)]
    public async Task run_should_return_201_created(int statusCode)
    {
      var result = await _sut.Run(new APIGatewayProxyRequest {Body = JsonConvert.SerializeObject(new CreateItemRequest())});
      Assert.Equal(result.StatusCode, statusCode);
    }
  }
}
