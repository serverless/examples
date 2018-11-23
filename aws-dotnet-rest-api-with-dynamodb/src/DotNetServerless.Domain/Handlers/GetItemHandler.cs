using System.Threading;
using System.Threading.Tasks;
using DotNetServerless.Domain.Entity;
using DotNetServerless.Domain.Infrastructure.Repositories;
using DotNetServerless.Domain.Requests;
using MediatR;

namespace DotNetServerless.Domain.Handlers
{
  public class GetItemHandler : IRequestHandler<GetItemRequest, Item>
  {
    private readonly IItemRepository _itemRepository;

    public GetItemHandler(IItemRepository itemRepository)
    {
      _itemRepository = itemRepository;
    }


    public async Task<Item> Handle(GetItemRequest request, CancellationToken cancellationToken)
    {
      var result = await _itemRepository.GetById<Item>(request.Id.ToString(), cancellationToken);
      return result;
    }
  }
}
