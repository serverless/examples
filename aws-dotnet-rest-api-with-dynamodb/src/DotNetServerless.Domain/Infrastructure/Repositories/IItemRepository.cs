using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using DotNetServerless.Domain.Entity;

namespace DotNetServerless.Domain.Infrastructure.Repositories
{
  public interface IItemRepository
  {
    Task<IEnumerable<T>> GetById<T>(string id, CancellationToken cancellationToken);

    Task Save(Item item, CancellationToken cancellationToken);
  }
}
