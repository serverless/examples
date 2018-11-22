using System;
using MediatR;
using TodoLambda.Domain.Entity;

namespace TodoLambda.Domain.Requests
{
  public class GetItemRequest : IRequest<Item>
  {
    public Guid Id { get; set; }
  }
}
