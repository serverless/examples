using System;
using DotNetServerless.Domain.Entity;
using MediatR;

namespace DotNetServerless.Domain.Requests
{
  public class UpdateItemRequest : IRequest<Item>
  {
    public Guid Id { get; set; }
    public string Code { get; set; }
    public string Description { get; set; }
    public bool IsChecked { get; set; }

    public Item Map()
    {
      return new Item
      {
        Id = Id,
        Code = Code,
        Description = Description,
        IsChecked = IsChecked
      };
    }
  }
}
