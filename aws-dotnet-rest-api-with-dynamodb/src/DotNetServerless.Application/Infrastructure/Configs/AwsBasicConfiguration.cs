using System;
using System.Linq;
using Amazon;
using Amazon.Runtime;
using Newtonsoft.Json;

namespace DotNetServerless.Application.Infrastructure.Configs
{
  public interface IAwsBasicConfiguration
  {
    string SecretKey { get; }
    string AccessKey { get; }
    RegionEndpoint RegionEndpoint { get; }

    BasicAWSCredentials GetAwsCredentials();
  }

  public class AwsBasicConfiguration : IAwsBasicConfiguration
  {
    private string Region { get; } = string.Empty;
    public string SecretKey { get; set; }
    public string AccessKey { get; set; }

    public BasicAWSCredentials GetAwsCredentials()
    {
      if (string.IsNullOrEmpty(AccessKey) || string.IsNullOrEmpty(SecretKey)) return null;

      return new BasicAWSCredentials(AccessKey, SecretKey);
    }

    [JsonIgnore]
    public RegionEndpoint RegionEndpoint
    {
      get
      {
        return RegionEndpoint.EnumerableAllRegions.FirstOrDefault(x =>
          x.SystemName.Equals(Region, StringComparison.InvariantCultureIgnoreCase));
      }
    }
  }
}
