using System;
using System.Threading;
using System.Threading.Tasks;
using DotNetServerless.Domain.Entity;
using DotNetServerless.Domain.Infrastructure.Repositories;
using DotNetServerless.Domain.Requests;
using MediatR;

namespace DotNetServerless.Domain.Handlers
{
  public class CreateItemHandler : IRequestHandler<CreateItemRequest, Item>
  {
    private readonly IItemRepository _itemRepository;

    public CreateItemHandler(IItemRepository itemRepository)
    {
      _itemRepository = itemRepository;
    }

    public async Task<Item> Handle(CreateItemRequest request, CancellationToken cancellationToken)
    {
      var item = request.Map();
      item.Id = Guid.NewGuid().ToString();

      await _itemRepository.Save(item, cancellationToken);

      return item;
    }
  }
}
