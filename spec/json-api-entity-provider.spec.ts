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
        const user = new User('Dmitry', 1);
        const addedUser = await userSet.add(user);

        expect(addedUser).not.toBeNull();
        expect(addedUser).toBe(user);
        expect(addedUser.id).toBeDefined();
        expect(addedUser.name).toBe('Dmitry');
        expect(addedUser.position).toBe(1);
    });

    // it('should update existing entities', async () =>
    // {
    //     const specEntityStore = new SpecEntityStore();
    //     const userSet = specEntityStore.userSet;
    //     const addedUser = await userSet.where((u, fe) => fe.eq(u.name, 'Dmitry')).findOne();

    //     expect(addedUser).not.toBeNull();

    //     addedUser!.name = 'Alex';

    //     const updatedUser = await userSet.update(addedUser);
    //     const foundUser = await userSet.where((u, fe) => fe.eq(u.name, 'Alex')).findOne();

    //     expect(updatedUser).not.toBeNull();
    //     expect(foundUser).not.toBeNull();
    // });

    // it('should save new entities', async () =>
    // {
    //     const specEntityStore = new SpecEntityStore();
    //     const userSet = specEntityStore.userSet;
    //     const user = new User('Dmitry');
    //     const addedUser = await userSet.save(user);
    //     const foundAddedUser = await userSet.where((u, fe) => fe.eq(u.name, 'Dmitry')).findOne();

    //     expect(addedUser).not.toBeNull();
    //     expect(foundAddedUser).not.toBeNull();

    //     user.name = 'Alex';

    //     const updatedUser = await userSet.save(user);
    //     const foundUpdatedUser = await userSet.where((u, fe) => fe.eq(u.name, 'Alex')).findOne();

    //     expect(updatedUser).not.toBeNull();
    //     expect(foundUpdatedUser).not.toBeNull();
    // });

    // it('should remove existing entities', async () =>
    // {
    //     const specEntityStore = new SpecEntityStore();
    //     const userSet = specEntityStore.userSet;
    //     const user = new User('Dmitry');
    //     const addedUser = await userSet.add(user);

    //     expect(addedUser).not.toBeNull();

    //     const removedUser = await userSet.remove(user);
    //     const foundUser = await userSet.where((u, fe) => fe.eq(u.name, 'Dmitry')).findOne();

    //     expect(removedUser).not.toBeNull();
    //     expect(foundUser).toBeNull();
    // });

    // it('should bulk add new entities', async () =>
    // {
    //     const specEntityStore = new SpecEntityStore();
    //     const userSet = specEntityStore.userSet;
    //     const userX = new User('Dmitry');
    //     const userY = new User('Alex');
    //     const addedUsers = await userSet.bulkAdd([userX, userY]);
    //     const foundUsers = await userSet.where((u, fe) => fe.in(u.name, ['Dmitry', 'Alex'])).findAll();

    //     expect(addedUsers.length).toBe(2);
    //     expect(foundUsers.length).toBe(2);
    // });

    // it('should bulk update existing entities', async () =>
    // {
    //     const specEntityStore = new SpecEntityStore();
    //     const userSet = specEntityStore.userSet;
    //     const userX = new User('Dmitry');
    //     const userY = new User('Alex');
    //     const addedUsers = await userSet.bulkAdd([userX, userY]);

    //     expect(addedUsers.length).toBe(2);

    //     userX.name = 'Victor';
    //     userY.name = 'Roman';

    //     const updatedUsers = await userSet.bulkUpdate([userX, userY]);
    //     const foundUsers = await userSet.where((u, fe) => fe.in(u.name, ['Victor', 'Roman'])).findAll();

    //     expect(updatedUsers.length).toBe(2);
    //     expect(foundUsers.length).toBe(2);
    // });

    // it('should bulk save new entities', async () =>
    // {
    //     const specEntityStore = new SpecEntityStore();
    //     const userSet = specEntityStore.userSet;
    //     const userX = new User('Dmitry');
    //     const userY = new User('Alex');
    //     const addedUsers = await userSet.bulkSave([userX, userY]);
    //     const foundAddedUsers = await userSet.where((u, fe) => fe.in(u.name, ['Dmitry', 'Alex'])).findAll();

    //     expect(addedUsers.length).toBe(2);
    //     expect(foundAddedUsers.length).toBe(2);

    //     userX.name = 'Victor';
    //     userY.name = 'Roman';

    //     const updatedUsers = await userSet.bulkUpdate([userX, userY]);
    //     const foundUpdatedUsers = await userSet.where((u, fe) => fe.in(u.name, ['Victor', 'Roman'])).findAll();

    //     expect(updatedUsers.length).toBe(2);
    //     expect(foundUpdatedUsers.length).toBe(2);
    // });

    // it('should batch update existing entities', async () =>
    // {
    //     const specEntityStore = new SpecEntityStore();
    //     const userSet = specEntityStore.userSet;
    //     const userX = new User('Dmitry');
    //     const userY = new User('Alex');
    //     const addedUsers = await userSet.bulkAdd([userX, userY]);

    //     expect(addedUsers.length).toBe(2);

    //     await userSet.where((u, fe) => fe.in(u.name, ['Dmitry', 'Alex'])).update({ name: 'Victor' });

    //     const updatedUsers = await userSet.where((u, fe) => fe.eq(u.name, 'Victor')).findAll();

    //     expect(updatedUsers.length).toBe(2);
    // });

    // it('should bulk remove existing entities', async () =>
    // {
    //     const specEntityStore = new SpecEntityStore();
    //     const userSet = specEntityStore.userSet;
    //     const userX = new User('Dmitry');
    //     const userY = new User('Alex');
    //     const addedUsers = await userSet.bulkAdd([userX, userY]);

    //     expect(addedUsers.length).toBe(2);

    //     const removedUsers = await userSet.bulkRemove([userX, userY]);
    //     const foundUsers = await userSet.where((u, fe) => fe.in(u.name, ['Dmitry', 'Alex'])).findAll();

    //     expect(removedUsers.length).toBe(2);
    //     expect(foundUsers.length).toBe(0);
    // });

    // it('should batch remove existing entities', async () =>
    // {
    //     const specEntityStore = new SpecEntityStore();
    //     const userSet = specEntityStore.userSet;
    //     const userX = new User('Dmitry');
    //     const userY = new User('Alex');
    //     const addedUsers = await userSet.bulkAdd([userX, userY]);

    //     expect(addedUsers.length).toBe(2);

    //     await userSet.where((u, fe) => fe.in(u.name, ['Dmitry', 'Alex'])).remove();

    //     const foundUsers = await userSet.where((u, fe) => fe.in(u.name, ['Dmitry', 'Alex'])).findAll();

    //     expect(foundUsers.length).toBe(0);
    // });

    // it('should sort existing entities in ascending order', async () =>
    // {
    //     const specEntityStore = new SpecEntityStore();
    //     const userSet = specEntityStore.userSet;
    //     const userX = new User('Dmitry');
    //     const userY = new User('Alex');
    //     const addedUsers = await userSet.bulkAdd([userX, userY]);

    //     expect(addedUsers.length).toBe(2);

    //     const sortedUsers = await userSet.sortByAsc(e => e.name).findAll();

    //     expect(sortedUsers.at(0)?.name).toBe('Alex');
    //     expect(sortedUsers.at(1)?.name).toBe('Dmitry');
    // });

    // it('should sort existing entities in descending order', async () =>
    // {
    //     const specEntityStore = new SpecEntityStore();
    //     const userSet = specEntityStore.userSet;
    //     const userX = new User('Dmitry');
    //     const userY = new User('Alex');
    //     const addedUsers = await userSet.bulkAdd([userX, userY]);

    //     expect(addedUsers.length).toBe(2);

    //     const sortedUsers = await userSet.sortByDesc(e => e.name).findAll();

    //     expect(sortedUsers.at(0)?.name).toBe('Dmitry');
    //     expect(sortedUsers.at(1)?.name).toBe('Alex');
    // });

    // it('should filter existing entities', async () =>
    // {
    //     const specEntityStore = new SpecEntityStore();
    //     const userSet = specEntityStore.userSet;
    //     const userX = new User('Dmitry');
    //     const userY = new User('Alex');
    //     const userZ = new User('Victor');
    //     const addedUsers = await userSet.bulkAdd([userX, userY, userZ]);

    //     expect(addedUsers.length).toBe(3);

    //     const filteredUsers = await userSet.where((u, fe) => fe.eq(u.name, 'Alex')).findAll();

    //     expect(filteredUsers.length).toBe(1);
    //     expect(filteredUsers.first()).toBe(userY);
    // });
});
