using System.IO;
using DotNetServerless.Application.Infrastructure;
using DotNetServerless.Application.Infrastructure.Configs;
using DotNetServerless.Application.Infrastructure.Repositories;
using DotNetServerless.Lambda.Extensions;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DotNetServerless.Lambda
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
