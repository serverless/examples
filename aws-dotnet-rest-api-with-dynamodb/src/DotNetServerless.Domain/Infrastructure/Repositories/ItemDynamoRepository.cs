using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DocumentModel;
using Amazon.DynamoDBv2.Model;
using DotNetServerless.Domain.Entity;
using DotNetServerless.Domain.Infrastructure.Configs;
using Newtonsoft.Json;

namespace DotNetServerless.Domain.Infrastructure.Repositories
{
  public class ItemDynamoRepository : IItemRepository
  {
    private readonly Table _table;

    public ItemDynamoRepository(DynamoDbConfiguration configuration,
      IAwsClientFactory<AmazonDynamoDBClient> clientFactory)
    {
      _table = Table.LoadTable(clientFactory.GetAwsClient(), configuration.TableName);
    }

    public async Task<Document> Save(Item item, CancellationToken cancellationToken)
    {
      var doc = Document.FromJson(JsonConvert.SerializeObject(item));
      return await _table.PutItemAsync(doc, cancellationToken);
    }

    public async Task<T> GetById<T>(string id, CancellationToken cancellationToken)
    {
      var attributeValues = new List<AttributeValue>
      {
        new AttributeValue
        {
          N = id
        }
      };

      var scanFilter = new ScanFilter();
      scanFilter.AddCondition("Id", ScanOperator.Equal, attributeValues);

      var search = _table.Scan(scanFilter);

      var result = default(T);

      while (!search.IsDone)
      {
        var documents = await search.GetNextSetAsync(cancellationToken);

        foreach (var document in documents)
        {
          var json = document.ToJson();
          result = JsonConvert.DeserializeObject<T>(json);
        }
      }

      return result;
    }
  }
}
