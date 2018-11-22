using System.Collections.Generic;
using System.Threading.Tasks;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using TodoLambda.Domain.Entity;
using TodoLambda.Domain.Infrastructure.Configs;

namespace TodoLambda.Domain.Infrastructure.Repositories
{
  public class ItemDynamoRepository : IItemRepository
  {
    private readonly DynamoDbConfiguration _configuration;
    private readonly AmazonDynamoDBClient _dynamoDbClient;

    public ItemDynamoRepository(DynamoDbConfiguration configuration,
      IAwsClientFactory<AmazonDynamoDBClient> clientFactory)
    {
      _configuration = configuration;
      _dynamoDbClient = clientFactory.GetAwsClient();
    }

    internal ItemDynamoRepository(DynamoDbConfiguration configuration, AmazonDynamoDBClient dynamoDbClient)
    {
      _configuration = configuration;
      _dynamoDbClient = dynamoDbClient;
    }

    public async Task Save(Item item)
    {
      using (var context = new DynamoDBContext(_dynamoDbClient))
      {
        var config = GetDynamoDbOperationConfig();
        await context.SaveAsync(item, config);
      }
    }

    public async Task<IEnumerable<Item>> GetById(string id)
    {
      var reviewList = new List<Item>();

      using (var context = new DynamoDBContext(_dynamoDbClient))
      {
        var config = GetDynamoDbOperationConfig();
        var scanCondition = new ScanCondition(nameof(Item.Id), ScanOperator.Equal, id);
        var search = context.ScanAsync<Item>(new[] {scanCondition}, config);

        while (!search.IsDone)
        {
          var entities = await search.GetNextSetAsync();
          reviewList.AddRange(entities);
        }
      }

      return reviewList;
    }

    private DynamoDBOperationConfig GetDynamoDbOperationConfig()
    {
      return new DynamoDBOperationConfig
      {
        OverrideTableName = _configuration.TableName,
        SkipVersionCheck = true
      };
    }
  }
}
