using System.Threading;
using System.Threading.Tasks;
using DotNetServerless.Application.Entities;
using DotNetServerless.Application.Infrastructure.Repositories;
using DotNetServerless.Application.Requests;
using MediatR;

namespace DotNetServerless.Application.Handlers
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
