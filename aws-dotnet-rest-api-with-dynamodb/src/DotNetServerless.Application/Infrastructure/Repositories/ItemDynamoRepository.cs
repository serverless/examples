using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using DotNetServerless.Application.Entities;
using DotNetServerless.Application.Infrastructure.Configs;

namespace DotNetServerless.Application.Infrastructure.Repositories
{
  public class ItemDynamoRepository : IItemRepository
  {
    private readonly AmazonDynamoDBClient _client;
    private readonly DynamoDBOperationConfig _configuration;

    public ItemDynamoRepository(DynamoDbConfiguration configuration,
      IAwsClientFactory<AmazonDynamoDBClient> clientFactory)
    {
      _client = clientFactory.GetAwsClient();
      _configuration = new DynamoDBOperationConfig
      {
        OverrideTableName = configuration.TableName,
        SkipVersionCheck = true
      };
    }

    public async Task Save(Item item, CancellationToken cancellationToken)
    {
      using (var context = new DynamoDBContext(_client))
      {
        await context.SaveAsync(item, _configuration, cancellationToken);
      }
    }

    public async Task<IEnumerable<T>> GetById<T>(string id, CancellationToken cancellationToken)
    {
      var resultList = new List<T>();
      using (var context = new DynamoDBContext(_client))
      {

        var scanCondition = new ScanCondition(nameof(Item.Id), ScanOperator.Equal, id);
        var search = context.ScanAsync<T>(new[] { scanCondition }, _configuration);

        while (!search.IsDone)
        {
          var entities = await search.GetNextSetAsync(cancellationToken);
          resultList.AddRange(entities);
        }
      }

      return resultList;
    }
  }
}
