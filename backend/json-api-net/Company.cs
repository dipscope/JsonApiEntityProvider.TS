using JsonApiDotNetCore.Resources;
using JsonApiDotNetCore.Resources.Annotations;

namespace JsonApiNet
{
    [Resource(PublicName = "companies")]
    public class Company : Identifiable<int>
    {
        [Attr]
        public string Name { get; set; }

        [HasMany]
        public IList<User> Users { get; set; }
    }
}
