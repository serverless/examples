using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DocumentModel;
using Amazon.DynamoDBv2.Model;
using MediatR;
using Newtonsoft.Json;
using TodoLambda.Domain.Entity;
using TodoLambda.Domain.Infrastructure;
using GetItemRequest = TodoLambda.Domain.Requests.GetItemRequest;

namespace TodoLambda.Domain.Handlers
{
    
    public class GetItemHandler : IRequestHandler<GetItemRequest, Item>
    {
        private readonly Table _table;

        public GetItemHandler(DynamoDbConfiguration configuration,
            IAwsClientFactory<AmazonDynamoDBClient> clientFactory)
        {
            var dynamoClient = clientFactory.GetAwsClient();
            _table = Table.LoadTable(dynamoClient, configuration.TableName);
        }


        public async Task<Item> Handle(GetItemRequest request, CancellationToken cancellationToken)
        {
            var attributeValues = new List<AttributeValue>
            {
                new AttributeValue
                {
                    N = request.Id.ToString()
                }
            };

            var scanFilter = new ScanFilter();
            scanFilter.AddCondition("Id", ScanOperator.Equal, attributeValues);

            var search = _table.Scan(scanFilter);

            Item result = null;

            while (!search.IsDone)
            {
                var documents = await search.GetNextSetAsync(cancellationToken);

                foreach (var document in documents)
                {
                    var json = document.ToJson();
                    result = JsonConvert.DeserializeObject<Item>(json);
                }
            }

            return result;
        }
    }
}