import { EntityCollection, EntitySet, EntityStore } from '@dipscope/entity-store';
import { Inject, Property, Type } from '@dipscope/type-manager';
import { JsonApiEntityProvider, JsonApiNetFilterExpressionVisitor, JsonApiNetMetadataExtractor, JsonApiNetPaginateExpressionVisitor, JsonApiResource } from '../src';

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

@Type()
@JsonApiResource({
    type: 'users'
})
export class User extends JsonApiEntity
{
    @Property(String) public name: string;
    @Property(Number) public position: number;
    @Property(UserStatus) public userStatus?: UserStatus;
    @Property(Company) public company?: Company;
    @Property(EntityCollection, [Message]) public messages: EntityCollection<Message>;

    public constructor(@Inject('name') name: string, @Inject('position') position: number)
    {
        super();

        this.name = name;
        this.position = position;
        this.messages = new EntityCollection<Message>();

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
