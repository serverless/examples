namespace TodoLambda.Domain.Infrastructure.Configs
{
  public interface IDynamoDbConfiguration
  {
    string TableName { get; set; }
  }

  public class DynamoDbConfiguration : IDynamoDbConfiguration
  {
    public string TableName { get; set; }
  }
}
