using DotNetServerless.Domain.Entity;
using MediatR;

namespace DotNetServerless.Domain.Requests
{
  public class UpdateItemRequest : IRequest<Item>
  {
    public string Id { get; set; }
    public string Description { get; set; }
    public string Code { get; set; }
    public bool IsChecked { get; set; }

    public Item Map()
    {
      return new Item
      {
        Id = Id,
        Description = Description,
        Code = Code,
        IsChecked = IsChecked
      };
    }
  }
}
