using JsonApiDotNetCore.Resources.Annotations;

namespace JsonApiNet
{
    [Resource(PublicName = "mans")]
    public class Man : Human
    {
        [Attr]
        public bool HasBeard { get; set; }
    }
}
