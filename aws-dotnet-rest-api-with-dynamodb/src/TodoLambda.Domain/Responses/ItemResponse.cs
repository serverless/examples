using System;

namespace TodoLambda.Domain.Responses
{
    public class ItemResponse
    {
        public Guid Id { get; set; }
        public string Description { get; set; }
        public bool IsChecked { get; set; }
    }
}