using System.Threading;
using System.Threading.Tasks;
using Amazon;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DocumentModel;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using TodoLambda.Domain.Entity;
using TodoLambda.Domain.Infrastructure;
using TodoLambda.Domain.Infrastructure.Configs;
using TodoLambda.Domain.Infrastructure.Repositories;
using TodoLambda.Domain.Requests;
using TodoLambda.Functions.Todos;
using Xunit;

namespace TodoLambda.Functions.Tests
{
  public class UpdateFunctionTests
  {
    private readonly UpdateFunction _sut;
    private readonly Mock<IItemRepository> _mockRepository;

    public UpdateFunctionTests()
    {
      _mockRepository = new Mock<IItemRepository>();
      _mockRepository.Setup(_ => _.Save(It.IsAny<Item>(), It.IsAny<CancellationToken>())).ReturnsAsync(new Document());

      var services = new ServiceCollection();
      
      services
        .AddMediatR()
        .AddTransient<IAwsClientFactory<AmazonDynamoDBClient>>(_ => new AwsClientFactory<AmazonDynamoDBClient>(new AwsBasicConfiguration{ AccessKey = "Test", SecretKey = "Test"}))
        .AddTransient(_ => new DynamoDbConfiguration())
        .AddTransient(_ => _mockRepository.Object);

      _sut = new UpdateFunction(services.BuildServiceProvider());
    }

    [Fact]
    public async Task run_should_trigger_mediator_handler_and_repository()
    {
      await _sut.Run(new UpdateItemRequest());
      _mockRepository.Verify(_ => _.Save(It.IsAny<Item>(), It.IsAny<CancellationToken>()), Times.Once);
    }
  }
}
