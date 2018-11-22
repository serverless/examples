using System;
using System.Threading;
using System.Threading.Tasks;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DocumentModel;
using MediatR;
using Newtonsoft.Json;
using TodoLambda.Domain.Entity;
using TodoLambda.Domain.Infrastructure;
using TodoLambda.Domain.Infrastructure.Configs;
using TodoLambda.Domain.Requests;

namespace TodoLambda.Domain.Handlers
{
  public class CreateItemHandler : IRequestHandler<CreateItemRequest, Item>
  {
    private readonly Table _table;

    public CreateItemHandler(DynamoDbConfiguration configuration,
      IAwsClientFactory<AmazonDynamoDBClient> clientFactory)
    {
      var dynamoClient = clientFactory.GetAwsClient();
      _table = Table.LoadTable(dynamoClient, configuration.TableName);
    }

    public async Task<Item> Handle(CreateItemRequest request, CancellationToken cancellationToken)
    {
      var item = request.Map();
      item.Id = Guid.NewGuid();

      var doc = Document.FromJson(JsonConvert.SerializeObject(item));
      await _table.PutItemAsync(doc, cancellationToken);

      return item;
    }
  }
}
