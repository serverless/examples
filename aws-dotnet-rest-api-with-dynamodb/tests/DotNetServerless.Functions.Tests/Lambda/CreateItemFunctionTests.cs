using System.Threading;
using System.Threading.Tasks;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DocumentModel;
using DotNetServerless.Domain.Entity;
using DotNetServerless.Domain.Infrastructure;
using DotNetServerless.Domain.Infrastructure.Configs;
using DotNetServerless.Domain.Infrastructure.Repositories;
using DotNetServerless.Domain.Requests;
using DotNetServerless.Functions.Lambda;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Xunit;

namespace DotNetServerless.Functions.Tests.Lambda
{
  public class CreateItemFunctionTests
  {
    public CreateItemFunctionTests()
    {
      _mockRepository = new Mock<IItemRepository>();
      _mockRepository.Setup(_ => _.Save(It.IsAny<Item>(), It.IsAny<CancellationToken>())).ReturnsAsync(new Document());

      var services = new ServiceCollection();

      services
        .AddMediatR()
        .AddTransient<IAwsClientFactory<AmazonDynamoDBClient>>(_ =>
          new AwsClientFactory<AmazonDynamoDBClient>(new AwsBasicConfiguration
            {AccessKey = "Test", SecretKey = "Test"}))
        .AddTransient(_ => new DynamoDbConfiguration())
        .AddTransient(_ => _mockRepository.Object);

      _sut = new CreateItemFunction(services.BuildServiceProvider());
    }

    private readonly CreateItemFunction _sut;
    private readonly Mock<IItemRepository> _mockRepository;

    [Fact]
    public async Task run_should_trigger_mediator_handler_and_repository()
    {
      await _sut.Run(new CreateItemRequest());
      _mockRepository.Verify(_ => _.Save(It.IsAny<Item>(), It.IsAny<CancellationToken>()), Times.Once);
    }
  }
}
