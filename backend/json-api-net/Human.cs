using JsonApiDotNetCore.Resources;
using JsonApiDotNetCore.Resources.Annotations;

namespace JsonApiNet
{
    [Resource(PublicName = "humans")]
    public class Human : Identifiable<int>
    {
        [Attr]
        public string Name { get; set; } = null!;

        [HasOne]
        public Man? Father { get; set; }
        public int? FatherId { get; set; }

        [HasOne]
        public Woman? Mother { get; set; }
        public int? MotherId { get; set; }

        [HasMany]
        public ISet<Human> Children { get; set; } = new HashSet<Human>();
    }
}
