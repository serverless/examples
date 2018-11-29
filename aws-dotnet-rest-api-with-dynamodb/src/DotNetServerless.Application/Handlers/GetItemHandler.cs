using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using DotNetServerless.Application.Entities;
using DotNetServerless.Application.Infrastructure.Repositories;
using DotNetServerless.Application.Requests;
using MediatR;

namespace DotNetServerless.Application.Handlers
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
      return result.FirstOrDefault();
    }
  }
}
