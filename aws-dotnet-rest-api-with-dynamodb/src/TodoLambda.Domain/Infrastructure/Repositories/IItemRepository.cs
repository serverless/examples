using System.Collections.Generic;
using System.Threading.Tasks;
using TodoLambda.Domain.Entity;

namespace TodoLambda.Domain.Infrastructure.Repositories
{
  public interface IItemRepository
  {
    Task Save(Item item);

    Task<IEnumerable<Item>> GetById(string id);
  }
}
