import { generateRandomString, Man, Message, SpecEntityStore, User, UserStatus, Woman } from './entity-store.spec';

describe('Json api entity provider', () =>
{
    it('should allow for fetch interceptors', async () =>
    {
        const specEntityStore = new SpecEntityStore('error');
        const userSet = specEntityStore.userSet;
        const name = generateRandomString();
        const user = new User(name, 1);
        
        await expectAsync(userSet.add(user)).toBeRejectedWithError('Fetch Request Intercepted');
    });

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

    it('should paginate existing entities', async () =>
    {
        const specEntityStore = new SpecEntityStore();
        const userSet = specEntityStore.userSet;
        const nameX = generateRandomString();
        const nameY = generateRandomString();
        const nameZ = generateRandomString();
        const userX = new User(nameX, 1);
        const userY = new User(nameY, 2);
        const userZ = new User(nameZ, 3);
        const addedUsers = await userSet.bulkAdd([userX, userY, userZ]);

        expect(addedUsers.length).toBe(3);

        const paginatedUsers = await userSet.filter((u, fe) => fe.in(u.name, [nameX, nameY, nameZ])).paginate(p => p.size(2)).findAll();

        expect(paginatedUsers.totalLength).toBe(3);
        expect(paginatedUsers.length).toBe(2);
        expect(paginatedUsers.hasNextPage()).toBeTrue();
        expect(paginatedUsers.hasPrevPage()).toBeFalse();

        const nextPaginatedUsers = await paginatedUsers.nextPage();

        expect(nextPaginatedUsers.totalLength).toBe(3);
        expect(nextPaginatedUsers.length).toBe(1);
        expect(nextPaginatedUsers.hasNextPage()).toBeFalse();
        expect(nextPaginatedUsers.hasPrevPage()).toBeTrue();
    });

    it('should add and query polymorphic entities', async () =>
    {
        const specEntityStore = new SpecEntityStore();
        const womanSet = specEntityStore.womanSet;
        const manSet = specEntityStore.manSet;
        const nameX = generateRandomString();
        const nameY = generateRandomString();
        const manX = new Man(nameX, true);
        const manY = new Man(nameY, false);
        const womanX = new Woman(nameX, 'test');
        const womanY = new Woman(nameY, 'test');
        const addedMans = await manSet.bulkAdd([manX, manY]);
        const addedWomans = await womanSet.bulkAdd([womanX, womanY]);

        expect(addedMans.length).toBe(2);
        expect(addedWomans.length).toBe(2);

        const paginatedMans = await manSet.filter((u, fe) => fe.in(u.name, [nameX, nameY])).paginate(p => p.size(2)).findAll();

        expect(paginatedMans.totalLength).toBe(2);
        expect(paginatedMans.length).toBe(2);
        expect(paginatedMans.hasNextPage()).toBeFalse();
        expect(paginatedMans.hasPrevPage()).toBeFalse();

        const paginatedWomans = await womanSet.filter((u, fe) => fe.in(u.name, [nameX, nameY])).paginate(p => p.size(2)).findAll();

        expect(paginatedWomans.totalLength).toBe(2);
        expect(paginatedWomans.length).toBe(2);
        expect(paginatedWomans.hasNextPage()).toBeFalse();
        expect(paginatedWomans.hasPrevPage()).toBeFalse();

        const nameZ = generateRandomString();
        const manZ = new Man(nameZ, true);

        manZ.father = manX;
        manZ.mother = womanX;
        manZ.children.push(womanY, manY);

        const addedMan = await manSet.add(manZ);
        const queriedMan = await manSet.filter((u, fe) => fe.eq(u.name, nameZ)).includeCollection(u => u.children).findOneOrFail();

        expect(addedMan).toBe(manZ);
        expect(addedMan.id).toBeDefined();
        expect(addedMan.name).toBe(nameZ);
        expect(queriedMan.children.filter(c => c.type === womanY.type).length).toBe(1);
        expect(queriedMan.children.filter(c => c.type === manY.type).length).toBe(1);
    });
});
