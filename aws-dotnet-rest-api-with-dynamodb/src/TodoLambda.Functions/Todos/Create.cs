using System.Threading.Tasks;
using Amazon.Lambda.Core;
using MediatR;
using TodoLambda.Domain.Entity;
using TodoLambda.Domain.Requests;

namespace TodoLambda.Functions.Todos
{
    public class CreateFunction
    {
        private readonly IMediator _mediator;

        public CreateFunction(IMediator mediator)
        {
            _mediator = mediator;
        }

        [LambdaSerializer(typeof(Amazon.Lambda.Serialization.Json.JsonSerializer))]
        public async Task<Item> Handle(CreateItemRequest request)
        {
            return await _mediator.Send(request);
        }
    }
}