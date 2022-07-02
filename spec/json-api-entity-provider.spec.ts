import { EntityCollection, EntitySet, EntityStore } from '@dipscope/entity-store';
import { Inject, Property, Type } from '@dipscope/type-manager';

import { JsonApiEntityProvider, JsonApiNetFilterExpressionVisitor, JsonApiResource, PageBasedPaginateExpressionVisitor } from '../src';

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
    @Property(EntityCollection, [() => User]) public users: EntityCollection<User>;

    public constructor(@Inject('text') text: string)
    {
        super();

        this.text = text;
        this.users = new EntityCollection<User>();

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
            jsonApiPaginateExpressionVisitor: new PageBasedPaginateExpressionVisitor()
        }));

        this.userStatusSet = this.createEntitySet(UserStatus);
        this.companySet = this.createEntitySet(Company);
        this.messageSet = this.createEntitySet(Message);
        this.userSet = this.createEntitySet(User);

        return;
    }
}

describe('Json api entity provider', () =>
{
    it('should add new entities', async () =>
    {
        const specEntityStore = new SpecEntityStore();
        const userSet = specEntityStore.userSet;
        const user = new User('Leo', 1);
        const addedUser = await userSet.add(user);

        expect(addedUser).toBe(user);
        expect(addedUser.id).toBeDefined();
        expect(addedUser.name).toBe('Leo');
        expect(addedUser.position).toBe(1);
    });

    it('should update existing entities', async () =>
    {
        const specEntityStore = new SpecEntityStore();
        const userSet = specEntityStore.userSet;
        const user = new User('Kira', 1);
        const addedUser = await userSet.add(user);

        expect(addedUser).toBe(user);

        user.name = 'KiraUpdated';

        const updatedUser = await userSet.update(user);

        expect(updatedUser).toBe(user);

        const foundUser = await userSet.where((u, fe) => fe.eq(u.name, 'KiraUpdated')).findOne();

        expect(foundUser).not.toBeNull();
    });

    it('should save new entities', async () =>
    {
        const specEntityStore = new SpecEntityStore();
        const userSet = specEntityStore.userSet;
        const user = new User('Greg', 2);
        const addedUser = await userSet.save(user);

        expect(addedUser).toBe(user);

        const foundAddedUser = await userSet.where((u, fe) => fe.eq(u.name, 'Greg')).findOne();

        expect(foundAddedUser).not.toBeNull();

        user.name = 'GregUpdated';

        const updatedUser = await userSet.save(user);

        expect(updatedUser).toBe(user);

        const foundUpdatedUser = await userSet.where((u, fe) => fe.eq(u.name, 'GregUpdated')).findOne();

        expect(foundUpdatedUser).not.toBeNull();
    });

    it('should remove existing entities', async () =>
    {
        const specEntityStore = new SpecEntityStore();
        const userSet = specEntityStore.userSet;
        const user = new User('Barry', 1);
        const addedUser = await userSet.add(user);

        expect(addedUser).toBe(user);

        const foundAddedUser = await userSet.where((u, fe) => fe.eq(u.name, 'Barry')).findOne();

        expect(foundAddedUser).not.toBeNull();

        const removedUser = await userSet.remove(user);

        expect(removedUser).toBe(user);

        const foundUser = await userSet.where((u, fe) => fe.eq(u.name, 'Barry')).findOne();

        expect(foundUser).toBeNull();
    });

    it('should bulk add new entities', async () =>
    {
        const specEntityStore = new SpecEntityStore();
        const userSet = specEntityStore.userSet;
        const userX = new User('Neo', 1);
        const userY = new User('John', 2);
        const addedUsers = await userSet.bulkAdd([userX, userY]);
        const foundUsers = await userSet.where((u, fe) => fe.in(u.name, ['Neo', 'John'])).findAll();

        expect(addedUsers.length).toBe(2);
        expect(addedUsers.at(0)).toBe(userX);
        expect(addedUsers.at(1)).toBe(userY);
        expect(foundUsers.length).toBe(2);
    });

    it('should bulk update existing entities', async () =>
    {
        const specEntityStore = new SpecEntityStore();
        const userSet = specEntityStore.userSet;
        const userX = new User('Xena', 1);
        const userY = new User('Vio', 2);
        const addedUsers = await userSet.bulkAdd([userX, userY]);

        expect(addedUsers.length).toBe(2);
        expect(addedUsers.at(0)).toBe(userX);
        expect(addedUsers.at(1)).toBe(userY);

        userX.name = 'XenaUpdated';
        userY.name = 'VioUpdated';

        const updatedUsers = await userSet.bulkUpdate([userX, userY]);

        expect(updatedUsers.length).toBe(2);
        expect(updatedUsers.at(0)).toBe(userX);
        expect(updatedUsers.at(1)).toBe(userY);

        const foundUsers = await userSet.where((u, fe) => fe.in(u.name, ['XenaUpdated', 'VioUpdated'])).findAll();

        expect(foundUsers.length).toBe(2);
    });

    it('should bulk save new entities', async () =>
    {
        const specEntityStore = new SpecEntityStore();
        const userSet = specEntityStore.userSet;
        const userX = new User('Lena', 1);
        const userY = new User('Sveta', 2);
        const addedUsers = await userSet.bulkSave([userX, userY]);

        expect(addedUsers.length).toBe(2);
        expect(addedUsers.at(0)).toBe(userX);
        expect(addedUsers.at(1)).toBe(userY);

        const foundAddedUsers = await userSet.where((u, fe) => fe.in(u.name, ['Lena', 'Sveta'])).findAll();

        expect(foundAddedUsers.length).toBe(2);

        userX.name = 'LenaUpdated';
        userY.name = 'SvetaUpdated';

        const updatedUsers = await userSet.bulkSave([userX, userY]);

        expect(updatedUsers.length).toBe(2);
        expect(updatedUsers.at(0)).toBe(userX);
        expect(updatedUsers.at(1)).toBe(userY);

        const foundUsers = await userSet.where((u, fe) => fe.in(u.name, ['LenaUpdated', 'SvetaUpdated'])).findAll();

        expect(foundUsers.length).toBe(2);
    });

    it('should bulk remove existing entities', async () =>
    {
        const specEntityStore = new SpecEntityStore();
        const userSet = specEntityStore.userSet;
        const userX = new User('Geo', 1);
        const userY = new User('Zeo', 2);
        const addedUsers = await userSet.bulkAdd([userX, userY]);

        expect(addedUsers.length).toBe(2);
        expect(addedUsers.at(0)).toBe(userX);
        expect(addedUsers.at(1)).toBe(userY);

        const removedUsers = await userSet.bulkRemove([userX, userY]);

        expect(removedUsers.length).toBe(2);
        expect(removedUsers.at(0)).toBe(userX);
        expect(removedUsers.at(1)).toBe(userY);

        const foundUsers = await userSet.where((u, fe) => fe.in(u.name, ['Geo', 'Zeo'])).findAll();

        expect(foundUsers.length).toBe(0);
    });

    it('should sort existing entities in ascending order', async () =>
    {
        const specEntityStore = new SpecEntityStore();
        const userSet = specEntityStore.userSet;
        const userX = new User('Mao', 1);
        const userY = new User('Dao', 2);
        const addedUsers = await userSet.bulkAdd([userX, userY]);

        expect(addedUsers.length).toBe(2);
        expect(addedUsers.at(0)).toBe(userX);
        expect(addedUsers.at(1)).toBe(userY);

        const sortedUsers = await userSet.where((u, fe) => fe.in(u.name, ['Mao', 'Dao'])).sortByAsc(e => e.name).findAll();

        expect(sortedUsers.at(0)?.name).toBe('Dao');
        expect(sortedUsers.at(1)?.name).toBe('Mao');
    });

    it('should sort existing entities in descending order', async () =>
    {
        const specEntityStore = new SpecEntityStore();
        const userSet = specEntityStore.userSet;
        const userX = new User('Wao', 1);
        const userY = new User('Uao', 2);
        const addedUsers = await userSet.bulkAdd([userX, userY]);

        expect(addedUsers.length).toBe(2);
        expect(addedUsers.at(0)).toBe(userX);
        expect(addedUsers.at(1)).toBe(userY);

        const sortedUsers = await userSet.where((u, fe) => fe.in(u.name, ['Wao', 'Uao'])).sortByDesc(e => e.name).findAll();

        expect(sortedUsers.at(0)?.name).toBe('Wao');
        expect(sortedUsers.at(1)?.name).toBe('Uao');
    });
});
