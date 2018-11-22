using System;
using MediatR;
using TodoLambda.Domain.Entity;

namespace TodoLambda.Domain.Requests
{
  public class UpdateItemRequest : IRequest<Item>
  {
    public Guid Id { get; set; }
    public string Description { get; set; }
    public bool IsChecked { get; set; }

    public Item Map()
    {
      return new Item
      {
        Id = Id,
        Description = Description,
        IsChecked = IsChecked
      };
    }
  }
}
