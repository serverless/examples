using System.IO;
using DotNetServerless.Domain.Infrastructure;
using DotNetServerless.Domain.Infrastructure.Configs;
using DotNetServerless.Domain.Infrastructure.Repositories;
using DotNetServerless.Functions.Extensions;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DotNetServerless.Functions
{
  public class Startup
  {
    public static IServiceCollection BuildContainer()
    {
      var configuration = new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddEnvironmentVariables()
        .Build();

      return ConfigureServices(configuration);
    }


    private static IServiceCollection ConfigureServices(IConfigurationRoot configurationRoot)
    {
      var services = new ServiceCollection();

      services
        .AddMediatR()
        .AddTransient(typeof(IAwsClientFactory<>), typeof(AwsClientFactory<>))
        .AddTransient<IItemRepository, ItemDynamoRepository>()
        .BindAndConfigure(configurationRoot.GetSection("DynamoDbConfiguration"), new DynamoDbConfiguration())
        .BindAndConfigure(configurationRoot.GetSection("AwsBasicConfiguration"), new AwsBasicConfiguration());

      return services;
    }
  }
}
