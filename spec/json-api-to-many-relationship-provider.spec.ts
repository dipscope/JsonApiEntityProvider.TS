import { generateRandomString, Message, SpecEntityStore, User } from './entity-store.spec';

describe('Json api to many relationship provider', () =>
{
    it('should add new entities', async () =>
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

        const jsonApiEntityProvider = specEntityStore.jsonApiEntityProvider;
        const jsonApiToManyRelationship = jsonApiEntityProvider.createJsonApiToManyRelationship(userSet, user, u => u.messages);
        const addedMessage = await jsonApiToManyRelationship.add(messageX);

        expect(addedMessage).toBe(messageX);
    });

    it('should update existing entities', async () =>
    {
        // TODO: ...
    });

    it('should remove existing entities', async () =>
    {
        // TODO: ...
    });

    it('should bulk add new entities', async () =>
    {
        // TODO: ...
    });

    it('should bulk update existing entities', async () =>
    {
        // TODO: ...
    });

    it('should bulk remove existing entities', async () =>
    {
        // TODO: ...
    });

    it('should sort existing entities in ascending order', async () =>
    {
        // TODO: ...
    });

    it('should sort existing entities in descending order', async () =>
    {
        // TODO: ...
    });

    it('should include relationships', async () =>
    {
        // TODO: ...
    });

    it('should paginate existing entities', async () =>
    {
        // TODO: ...
    });
});
