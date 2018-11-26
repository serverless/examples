using DotNetServerless.Application.Entities;
using MediatR;

namespace DotNetServerless.Application.Requests
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
