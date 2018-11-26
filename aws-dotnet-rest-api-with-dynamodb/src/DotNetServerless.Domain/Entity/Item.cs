using System;
using Amazon.DynamoDBv2.DataModel;

namespace DotNetServerless.Domain.Entity
{
  public class Item
  {
    [DynamoDBHashKey]
    public Guid Id { get; set; }
    [DynamoDBRangeKey]
    public string Code { get; set; }
    [DynamoDBProperty]
    public string Description { get; set; }
    [DynamoDBProperty]
    public bool IsChecked { get; set; }
  }
}
