using DotNetServerless.Domain.Entity;
using MediatR;

namespace DotNetServerless.Domain.Requests
{
  public class CreateItemRequest : IRequest<Item>
  {
    public string Description { get; set; }
    public string Code { get; set; }
    public bool IsChecked { get; set; }

    public Item Map()
    {
      return new Item
      {
        Description = Description,
        Code = Code,
        IsChecked = IsChecked
      };
    }
  }
}
