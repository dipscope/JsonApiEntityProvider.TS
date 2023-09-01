import { EntityCollection, EntitySet, EntityStore } from '@dipscope/entity-store';
import { Inject, Property, Type, TypeConfiguration, TypeManager, TypeMetadata } from '@dipscope/type-manager';
import { JsonApiEntityProvider, JsonApiNetFilterExpressionVisitor, JsonApiNetMetadataExtractor, JsonApiNetPaginateExpressionVisitor, JsonApiResource, JsonApiResourceMetadata } from '../src';

@Type()
export class JsonApiEntity
{
    @Property(Number) public id?: number;
    @Property(String) public type?: string;
}

@Type()
@JsonApiResource({
    type: 'userStatuses'
})
export class UserStatus extends JsonApiEntity
{
    @Property(String) public name: string;
    @Property(EntityCollection, [() => User]) public users: EntityCollection<User>;

    public constructor(@Inject('name') name: string)
    {
        super();

        this.type = 'userStatuses';
        this.name = name;
        this.users = new EntityCollection<User>();

        return;
    }
}

@Type()
@JsonApiResource({
    type: 'companies'
})
export class Company extends JsonApiEntity
{
    @Property(String) public name: string;
    @Property(EntityCollection, [() => User]) public users: EntityCollection<User>;

    public constructor(@Inject('name') name: string)
    {
        super();

        this.type = 'companies';
        this.name = name;
        this.users = new EntityCollection<User>();

        return;
    }
}

@Type()
@JsonApiResource({
    type: 'messages'
})
export class Message extends JsonApiEntity
{
    @Property(String) public text: string;
    @Property(() => User) public user: User;

    // Let's make it so that messages are replyable.
    // let a reply be defined as a message which has a 'parent'.
    // This will make testing more robust, as messages will posses a toOne and a toMany relationship.
    @Property(() => Message) public parent?: Message;
    @Property(EntityCollection, [() => Message]) public messages: EntityCollection<Message>;

    public constructor(@Inject('text') text: string, @Inject('user') user: User, @Inject('parent') parent?: Message)
    {
        super();

        this.type = 'messages';
        this.text = text;
        this.user = user;
        this.parent = parent;
        this.messages = new EntityCollection<Message>();

        return;
    }
}

export class User extends JsonApiEntity
{
    public name: string;
    public position: number;
    public userStatus?: UserStatus;
    public company?: Company;
    public messages: EntityCollection<Message>;

    public constructor(name: string, position: number)
    {
        super();

        this.type = 'users';
        this.name = name;
        this.position = position;
        this.messages = new EntityCollection<Message>();

        return;
    }
}

export class UserConfiguration implements TypeConfiguration<User>
{
    public configure(typeMetadata: TypeMetadata<User>): void 
    {
        typeMetadata.configureTypeExtensionMetadata(JsonApiResourceMetadata)
            .hasType('users');

        typeMetadata.configurePropertyMetadata('name')
            .hasTypeArgument(String);

        typeMetadata.configurePropertyMetadata('position')
            .hasTypeArgument(Number);
    
        typeMetadata.configurePropertyMetadata('userStatus')
            .hasTypeArgument(UserStatus);

        typeMetadata.configurePropertyMetadata('company')
            .hasTypeArgument(Company);

        typeMetadata.configurePropertyMetadata('messages')
            .hasTypeArgument(EntityCollection)
            .hasGenericArguments([Message]);

        typeMetadata.configureInjectMetadata(0)
            .hasKey('name');
    
        typeMetadata.configureInjectMetadata(1)
            .hasKey('position');

        return;
    }
}

TypeManager.applyTypeConfiguration(User, new UserConfiguration());

@Type()
@JsonApiResource({
    type: 'humans'
})
export class Human extends JsonApiEntity
{
    @Property(String) public name;
    @Property(() => Man) public father?: Man;
    @Property(() => Woman) public mother?: Woman;
    @Property(EntityCollection, [() => Human]) public children: EntityCollection<Human>;

    public constructor(name: string)
    {
        super();

        this.type = 'humans';
        this.name = name;
        this.children = new EntityCollection<Human>();

        return;
    }
}

@Type()
@JsonApiResource({
    type: 'mans'
})
export class Man extends Human
{
    @Property(Boolean) public hasBeard: boolean;
    @Property(() => Woman) public wife?: Woman;

    public constructor(name: string, hasBeard: boolean)
    {
        super(name);

        this.type = 'mans';
        this.hasBeard = hasBeard;

        return;
    }
}

@Type()
@JsonApiResource({
    type: 'womans'
})
export class Woman extends Human
{
    @Property(String) public maidenName: string;
    @Property(() => Man) public husband?: Man;

    public constructor(name: string, maidenName: string)
    {
        super(name);

        this.type = 'womans';
        this.maidenName = maidenName;

        return;
    }
}

@Type({
    injectable: true
})
export class SpecEntityStore extends EntityStore
{
    public readonly userStatusSet: EntitySet<UserStatus>;
    public readonly companySet: EntitySet<Company>;
    public readonly messageSet: EntitySet<Message>;
    public readonly userSet: EntitySet<User>;
    public readonly humanSet: EntitySet<Human>;
    public readonly manSet: EntitySet<Man>;
    public readonly womanSet: EntitySet<Woman>;

    public constructor()
    {
        super(new JsonApiEntityProvider({
            baseUrl: 'http://localhost:20001',
            jsonApiFilterExpressionVisitor: new JsonApiNetFilterExpressionVisitor(),
            jsonApiPaginateExpressionVisitor: new JsonApiNetPaginateExpressionVisitor(),
            jsonApiMetadataExtractor: new JsonApiNetMetadataExtractor(),
            allowToManyRelationshipReplacement: true
        }));

        this.userStatusSet = this.createEntitySet(UserStatus);
        this.companySet = this.createEntitySet(Company);
        this.messageSet = this.createEntitySet(Message);
        this.userSet = this.createEntitySet(User);
        this.humanSet = this.createEntitySet(Human);
        this.manSet = this.createEntitySet(Man);
        this.womanSet = this.createEntitySet(Woman);

        return;
    }

    public get jsonApiEntityProvider(): JsonApiEntityProvider
    {
        return this.entityProvider as JsonApiEntityProvider;
    }
}

export function generateRandomString(): string
{
    const isoString = new Date().toISOString();
    const randomNumber = Math.floor(Math.random() * 99999999999999);

    return `${isoString}${randomNumber}`;
}
