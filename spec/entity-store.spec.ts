import { EntityCollection, EntitySet, EntityStore } from '@dipscope/entity-store';
import { Inject, Property, Type, TypeConfiguration, TypeManager, TypeMetadata } from '@dipscope/type-manager';
import { JsonApiEntityProvider, JsonApiNetFilterExpressionVisitor, JsonApiNetMetadataExtractor, JsonApiNetPaginateExpressionVisitor, JsonApiResource, JsonApiResourceMetadata } from '../src';

@Type()
export class JsonApiEntity
{
    @Property(Number) public id?: number;
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

    public constructor(@Inject('text') text: string, @Inject('user') user: User)
    {
        super();

        this.text = text;
        this.user = user;

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

@Type({
    injectable: true
})
export class SpecEntityStore extends EntityStore
{
    public readonly userStatusSet: EntitySet<UserStatus>;
    public readonly companySet: EntitySet<Company>;
    public readonly messageSet: EntitySet<Message>;
    public readonly userSet: EntitySet<User>;

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
