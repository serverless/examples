using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using DotNetServerless.Application.Entities;

namespace DotNetServerless.Application.Infrastructure.Repositories
{
  public interface IItemRepository
  {
    Task<IEnumerable<T>> GetById<T>(string id, CancellationToken cancellationToken);

    Task Save(Item item, CancellationToken cancellationToken);
  }
}
