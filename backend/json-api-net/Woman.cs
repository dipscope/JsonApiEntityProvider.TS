using JsonApiDotNetCore.Resources.Annotations;

namespace JsonApiNet
{
    [Resource(PublicName = "womans")]
    public class Woman : Human
    {
        [Attr]
        public string? MaidenName { get; set; }
    }
}
