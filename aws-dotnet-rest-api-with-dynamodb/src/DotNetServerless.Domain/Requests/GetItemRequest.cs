using System;
using DotNetServerless.Domain.Entity;
using MediatR;

namespace DotNetServerless.Domain.Requests
{
  public class GetItemRequest : IRequest<Item>
  {
    public Guid Id { get; set; }
  }
}
