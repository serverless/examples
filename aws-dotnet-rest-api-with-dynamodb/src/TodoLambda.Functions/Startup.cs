using System;
using System.IO;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TodoLambda.Domain.Infrastructure;
using TodoLambda.Domain.Infrastructure.Configs;
using TodoLambda.Domain.Infrastructure.Repositories;
using TodoLambda.Functions.Extensions;

namespace TodoLambda.Functions
{
  public class Startup
  {
    public static IServiceProvider BuildContainer()
    {
      var configuration = new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddEnvironmentVariables()
        .Build();

      return ConfigureServices(configuration);
    }


    private static IServiceProvider ConfigureServices(IConfigurationRoot configurationRoot)
    {
      var services = new ServiceCollection();

      services
        .AddTransient(typeof(IAwsClientFactory<>), typeof(AwsClientFactory<>))
        .AddTransient<IItemRepository, ItemDynamoRepository>()
        .BindAndConfigure(configurationRoot.GetSection("DYNAMODB_TABLE"), new DynamoDbConfiguration());

      return services.BuildServiceProvider();
    }
  }
}
