using System.Threading;
using System.Threading.Tasks;
using DotNetServerless.Domain.Entity;
using DotNetServerless.Domain.Infrastructure.Repositories;
using DotNetServerless.Domain.Requests;
using MediatR;

namespace DotNetServerless.Domain.Handlers
{
  public class UpdateItemHandler : IRequestHandler<UpdateItemRequest, Item>
  {
    private readonly IItemRepository _itemRepository;

    public UpdateItemHandler(IItemRepository itemRepository)
    {
      _itemRepository = itemRepository;
    }

    public async Task<Item> Handle(UpdateItemRequest request, CancellationToken cancellationToken)
    {
      var item = request.Map();
      await _itemRepository.Save(item, cancellationToken);
      return item;
    }
  }
}
