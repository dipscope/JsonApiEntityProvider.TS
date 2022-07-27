import { EntityCollection, EntitySet, EntityStore } from '@dipscope/entity-store';
import { Inject, Property, Type } from '@dipscope/type-manager';
import { JsonApiEntityProvider, JsonApiNetFilterExpressionVisitor, JsonApiNetMetadataExtractor, JsonApiNetPaginateExpressionVisitor, JsonApiResource } from '../src';

@Type()
class JsonApiEntity
{
    @Property(Number) public id?: number;
}

@Type()
@JsonApiResource({
    type: 'userStatuses'
})
class UserStatus extends JsonApiEntity
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
class Company extends JsonApiEntity
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
class Message extends JsonApiEntity
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
class User extends JsonApiEntity
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
class SpecEntityStore extends EntityStore
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
}

function generateRandomString(): string
{
    const isoString = new Date().toISOString();
    const randomNumber = Math.floor(Math.random() * 99999999999999);

    return `${isoString}${randomNumber}`;
}

describe('Json api entity provider', () =>
{
    it('should add new entities', async () =>
    {
        const specEntityStore = new SpecEntityStore();
        const userSet = specEntityStore.userSet;
        const name = generateRandomString();
        const user = new User(name, 1);
        const addedUser = await userSet.add(user);

        expect(addedUser).toBe(user);
        expect(addedUser.id).toBeDefined();
        expect(addedUser.name).toBe(name);
        expect(addedUser.position).toBe(1);
    });

    it('should update existing entities', async () =>
    {
        const specEntityStore = new SpecEntityStore();
        const userSet = specEntityStore.userSet;
        const name = generateRandomString();
        const user = new User(name, 1);
        const addedUser = await userSet.add(user);

        expect(addedUser).toBe(user);

        user.name = `${name}Updated`;

        const updatedUser = await userSet.update(user);

        expect(updatedUser).toBe(user);

        const foundUser = await userSet.filter((u, fe) => fe.eq(u.name, `${name}Updated`)).findOne();

        expect(foundUser).not.toBeNull();
    });

    it('should save new entities', async () =>
    {
        const specEntityStore = new SpecEntityStore();
        const userSet = specEntityStore.userSet;
        const name = generateRandomString();
        const user = new User(name, 2);
        const addedUser = await userSet.save(user);

        expect(addedUser).toBe(user);

        const foundAddedUser = await userSet.filter((u, fe) => fe.eq(u.name, name)).findOne();

        expect(foundAddedUser).not.toBeNull();

        user.name = `${name}Updated`;

        const updatedUser = await userSet.save(user);

        expect(updatedUser).toBe(user);

        const foundUpdatedUser = await userSet.filter((u, fe) => fe.eq(u.name, `${name}Updated`)).findOne();

        expect(foundUpdatedUser).not.toBeNull();
    });

    it('should remove existing entities', async () =>
    {
        const specEntityStore = new SpecEntityStore();
        const userSet = specEntityStore.userSet;
        const name = generateRandomString();
        const user = new User(name, 1);
        const addedUser = await userSet.add(user);

        expect(addedUser).toBe(user);

        const foundAddedUser = await userSet.filter((u, fe) => fe.eq(u.name, name)).findOne();

        expect(foundAddedUser).not.toBeNull();

        const removedUser = await userSet.remove(user);

        expect(removedUser).toBe(user);

        const foundUser = await userSet.filter((u, fe) => fe.eq(u.name, name)).findOne();

        expect(foundUser).toBeNull();
    });

    it('should bulk add new entities', async () =>
    {
        const specEntityStore = new SpecEntityStore();
        const userSet = specEntityStore.userSet;
        const nameX = generateRandomString();
        const nameY = generateRandomString();
        const userX = new User(nameX, 1);
        const userY = new User(nameY, 2);
        const addedUsers = await userSet.bulkAdd([userX, userY]);
        const foundUsers = await userSet.filter((u, fe) => fe.in(u.name, [nameX, nameY])).findAll();

        expect(addedUsers.length).toBe(2);
        expect(addedUsers.at(0)).toBe(userX);
        expect(addedUsers.at(1)).toBe(userY);
        expect(foundUsers.length).toBe(2);
    });

    it('should bulk update existing entities', async () =>
    {
        const specEntityStore = new SpecEntityStore();
        const userSet = specEntityStore.userSet;
        const nameX = generateRandomString();
        const nameY = generateRandomString();
        const userX = new User(nameX, 1);
        const userY = new User(nameY, 2);
        const addedUsers = await userSet.bulkAdd([userX, userY]);

        expect(addedUsers.length).toBe(2);
        expect(addedUsers.at(0)).toBe(userX);
        expect(addedUsers.at(1)).toBe(userY);

        userX.name = `${nameX}Updated`;
        userY.name = `${nameY}Updated`;

        const updatedUsers = await userSet.bulkUpdate([userX, userY]);

        expect(updatedUsers.length).toBe(2);
        expect(updatedUsers.at(0)).toBe(userX);
        expect(updatedUsers.at(1)).toBe(userY);

        const foundUsers = await userSet.filter((u, fe) => fe.in(u.name, [`${nameX}Updated`, `${nameY}Updated`])).findAll();

        expect(foundUsers.length).toBe(2);
    });

    it('should bulk save new entities', async () =>
    {
        const specEntityStore = new SpecEntityStore();
        const userSet = specEntityStore.userSet;
        const nameX = generateRandomString();
        const nameY = generateRandomString();
        const userX = new User(nameX, 1);
        const userY = new User(nameY, 2);
        const addedUsers = await userSet.bulkSave([userX, userY]);

        expect(addedUsers.length).toBe(2);
        expect(addedUsers.at(0)).toBe(userX);
        expect(addedUsers.at(1)).toBe(userY);

        const foundAddedUsers = await userSet.filter((u, fe) => fe.in(u.name, [nameX, nameY])).findAll();

        expect(foundAddedUsers.length).toBe(2);

        userX.name = `${nameX}Updated`;
        userY.name = `${nameY}Updated`;

        const updatedUsers = await userSet.bulkSave([userX, userY]);

        expect(updatedUsers.length).toBe(2);
        expect(updatedUsers.at(0)).toBe(userX);
        expect(updatedUsers.at(1)).toBe(userY);

        const foundUsers = await userSet.filter((u, fe) => fe.in(u.name, [`${nameX}Updated`, `${nameY}Updated`])).findAll();

        expect(foundUsers.length).toBe(2);
    });

    it('should bulk remove existing entities', async () =>
    {
        const specEntityStore = new SpecEntityStore();
        const userSet = specEntityStore.userSet;
        const nameX = generateRandomString();
        const nameY = generateRandomString();
        const userX = new User(nameX, 1);
        const userY = new User(nameY, 2);
        const addedUsers = await userSet.bulkAdd([userX, userY]);

        expect(addedUsers.length).toBe(2);
        expect(addedUsers.at(0)).toBe(userX);
        expect(addedUsers.at(1)).toBe(userY);

        const removedUsers = await userSet.bulkRemove([userX, userY]);

        expect(removedUsers.length).toBe(2);
        expect(removedUsers.at(0)).toBe(userX);
        expect(removedUsers.at(1)).toBe(userY);

        const foundUsers = await userSet.filter((u, fe) => fe.in(u.name, [nameX, nameY])).findAll();

        expect(foundUsers.length).toBe(0);
    });

    it('should sort existing entities in ascending order', async () =>
    {
        const specEntityStore = new SpecEntityStore();
        const userSet = specEntityStore.userSet;
        const nameX = generateRandomString();
        const nameY = generateRandomString();
        const userX = new User(nameX, 1);
        const userY = new User(nameY, 2);
        const addedUsers = await userSet.bulkAdd([userX, userY]);

        expect(addedUsers.length).toBe(2);
        expect(addedUsers.at(0)).toBe(userX);
        expect(addedUsers.at(1)).toBe(userY);

        const sortedUsers = await userSet.filter((u, fe) => fe.in(u.name, [nameX, nameY])).sortByAsc(e => e.position).findAll();

        expect(sortedUsers.at(0)?.name).toBe(nameX);
        expect(sortedUsers.at(1)?.name).toBe(nameY);
    });

    it('should sort existing entities in descending order', async () =>
    {
        const specEntityStore = new SpecEntityStore();
        const userSet = specEntityStore.userSet;
        const nameX = generateRandomString();
        const nameY = generateRandomString();
        const userX = new User(nameX, 1);
        const userY = new User(nameY, 2);
        const addedUsers = await userSet.bulkAdd([userX, userY]);

        expect(addedUsers.length).toBe(2);
        expect(addedUsers.at(0)).toBe(userX);
        expect(addedUsers.at(1)).toBe(userY);

        const sortedUsers = await userSet.filter((u, fe) => fe.in(u.name, [nameX, nameY])).sortByDesc(e => e.position).findAll();

        expect(sortedUsers.at(0)?.name).toBe(nameY);
        expect(sortedUsers.at(1)?.name).toBe(nameX);
    });

    it('should include to one relationship', async () =>
    {
        const specEntityStore = new SpecEntityStore();
        const userStatusSet = specEntityStore.userStatusSet;
        const userSet = specEntityStore.userSet;
        const name = generateRandomString();
        const userStatus = new UserStatus(name);
        const addedUserStatus = await userStatusSet.add(userStatus);

        expect(addedUserStatus).toBe(userStatus);

        const user = new User(name, 1);

        user.userStatus = addedUserStatus;

        const addedUser = await userSet.add(user);

        expect(addedUser.userStatus).toBe(addedUserStatus);

        const foundUser = await userSet.filter((u, fe) => fe.eq(u.userStatus.name, name)).include(u => u.userStatus).findOne();

        expect(foundUser?.userStatus).toBeDefined();
        expect(foundUser?.userStatus?.name).toBe(name);
    });

    it('should include to many relationship', async () =>
    {
        const specEntityStore = new SpecEntityStore();
        const userSet = specEntityStore.userSet;
        const messageSet = specEntityStore.messageSet;
        const name = generateRandomString();
        const user = new User(name, 1);
        const addedUser = await userSet.add(user);

        expect(addedUser).toBe(user);

        const messageX = new Message(name, addedUser);
        const messageY = new Message(name, addedUser);

        const addedMessages = await messageSet.bulkAdd([messageX, messageY]);

        expect(addedMessages.length).toBe(2);
        expect(addedMessages.at(0)).toBe(messageX);
        expect(addedMessages.at(1)).toBe(messageY);

        const foundUser = await userSet.filter((u, fe) => fe.eq(u.name, name)).includeCollection(u => u.messages).findOne();

        expect(foundUser?.messages).toBeDefined();
        expect(foundUser?.messages.length).toBe(2);
    });
});
