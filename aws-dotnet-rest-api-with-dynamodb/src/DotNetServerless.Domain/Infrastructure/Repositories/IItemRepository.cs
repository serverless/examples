using System.Threading;
using System.Threading.Tasks;
using Amazon.DynamoDBv2.DocumentModel;
using DotNetServerless.Domain.Entity;

namespace DotNetServerless.Domain.Infrastructure.Repositories
{
  public interface IItemRepository
  {
    Task<T> GetById<T>(string id, CancellationToken cancellationToken);

    Task<Document> Save(Item item, CancellationToken cancellationToken);
  }
}
