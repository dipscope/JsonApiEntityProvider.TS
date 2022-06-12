using JsonApiDotNetCore.Resources;
using JsonApiDotNetCore.Resources.Annotations;

namespace JsonApiNet
{
    [Resource(PublicName = "userStatuses")]
    public class UserStatus : Identifiable<int>
    {
        [Attr]
        public string Name { get; set; }

        [HasMany]
        public IList<User> Users { get; set; }
    }
}
