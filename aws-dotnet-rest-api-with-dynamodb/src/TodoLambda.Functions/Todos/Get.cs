using System;
using System.Threading.Tasks;
using Amazon.Lambda.Core;
using MediatR;
using TodoLambda.Domain.Entity;
using TodoLambda.Domain.Requests;

namespace TodoLambda.Functions.Todos
{
    public class GetFunction
    {
        private readonly IMediator _mediator;

        public GetFunction(IMediator mediator)
        {
            _mediator = mediator;
        }

        [LambdaSerializer(typeof(Amazon.Lambda.Serialization.Json.JsonSerializer))]
        public async Task<Item> Handle(Guid id)
        {
            var request = new GetItemRequest {Id = id};
            return await _mediator.Send(request);
        }
    }
}