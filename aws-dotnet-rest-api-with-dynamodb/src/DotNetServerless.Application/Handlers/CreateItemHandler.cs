using System;
using System.Threading;
using System.Threading.Tasks;
using DotNetServerless.Application.Entities;
using DotNetServerless.Application.Infrastructure.Repositories;
using DotNetServerless.Application.Requests;
using MediatR;

namespace DotNetServerless.Application.Handlers
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
