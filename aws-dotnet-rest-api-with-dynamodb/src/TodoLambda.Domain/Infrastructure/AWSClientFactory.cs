using System;
using Amazon.Runtime;
using Microsoft.Extensions.Logging;
using TodoLambda.Domain.Infrastructure.Configs;

namespace TodoLambda.Domain.Infrastructure
{
  public interface IAwsClientFactory<out T>
  {
    T GetAwsClient();
  }

  public class AwsClientFactory<T> : IAwsClientFactory<T> where T : AmazonServiceClient, new()
  {
    private readonly IAwsBasicConfiguration _awsBasicConfiguration;
    private readonly ILogger<AwsClientFactory<T>> _logger;

    public AwsClientFactory(AwsBasicConfiguration awsBasicConfiguration, ILogger<AwsClientFactory<T>> logger)
    {
      _awsBasicConfiguration = awsBasicConfiguration;
      _logger = logger;
    }

    public T GetAwsClient()
    {
      return string.IsNullOrEmpty(_awsBasicConfiguration.AccessKey) ||
             string.IsNullOrEmpty(_awsBasicConfiguration.SecretKey)
        ? (T) Activator.CreateInstance(typeof(T))
        : (T) Activator.CreateInstance(typeof(T), _awsBasicConfiguration.GetAwsCredentials(),
          _awsBasicConfiguration.RegionEndpoint);
    }
  }
}
