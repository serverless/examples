using Amazon.DynamoDBv2.DataModel;

namespace DotNetServerless.Application.Entities
{
  public class Item
  {
    [DynamoDBHashKey]
    public string Id { get; set; }
    [DynamoDBRangeKey]
    public string Code { get; set; }
    [DynamoDBProperty]
    public string Description { get; set; }
    [DynamoDBProperty]
    public bool IsChecked { get; set; }
  }
}
