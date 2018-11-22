using MediatR;
using TodoLambda.Domain.Entity;

namespace TodoLambda.Domain.Requests
{
  public class CreateItemRequest : IRequest<Item>
  {
    public string Description { get; set; }
    public bool IsChecked { get; set; }

    public Item Map()
    {
      return new Item
      {
        Description = Description,
        IsChecked = IsChecked
      };
    }
  }
}
