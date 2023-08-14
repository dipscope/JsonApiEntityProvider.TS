import { EntitySet } from '@dipscope/entity-store';
import { generateRandomString, Message, SpecEntityStore, User } from './entity-store.spec';
import { JsonApiToManyRelationship } from '../src';

async function addUser(userSet: EntitySet<User>, name?: string) {
    name ??= generateRandomString();
    const user = new User(name, 1);
    const remoteUser = await userSet.add(user);
    expect(remoteUser).toBe(user);
    return remoteUser;
}
async function setupRelationshipTest() {
    // Get Entity Store Objects
    const specEntityStore = new SpecEntityStore();
    const userSet = specEntityStore.userSet;
    const messageSet = specEntityStore.messageSet;
    const jsonApiEntityProvider = specEntityStore.jsonApiEntityProvider;
    // Create a User
    const user = await addUser(userSet);
    // Create 3 initial Messages
    const userMessages = jsonApiEntityProvider.createJsonApiToManyRelationship(userSet, user, u => u.messages);
    const setupCount = 3;
    const messages = [...Array(setupCount).keys()].map(() => createMessage(user));
    const addedMessages = await messageSet.bulkAdd(messages);
    expect(addedMessages.length).toBe(3);
    expect(addedMessages.at(0)).toBe(messages[0]);
    expect(addedMessages.at(1)).toBe(messages[1]);
    expect(addedMessages.at(2)).toBe(messages[2]);
    return { specEntityStore, userSet, messageSet, jsonApiEntityProvider, user, userMessages, addedMessages, setupCount }
}

function createMessage(user: User, text?: string) {
    text ??= generateRandomString();
    return new Message(text, user);
}

async function getCurrentMessageCount(relationship: JsonApiToManyRelationship<User, Message>) {
    const elements = await relationship.findAll();
    return elements.length;
}

describe('Json api to many relationship provider', () => {
    it('should fetch existing entities', async () => {
        const { userSet, messageSet, userMessages, addedMessages, setupCount } = await setupRelationshipTest();
        // This is a pre-check for validating that setup was ran correctly
        const initialCount = await getCurrentMessageCount(userMessages);
        expect(initialCount).toBe(setupCount);

        // Create a new message, which isn't attached to user.
        // To do this, we'll need to make a different user
        const oddUser = await addUser(userSet);
        const message = createMessage(oddUser);
        await messageSet.add(message);

        // ! Function Under Test ! !
        // Let's check that the message was linked correctly
        const finalData = await userMessages.findAll();
        expect(finalData.length).toBe(initialCount);
        // Let's also check that our queried data is correct
        for (let i = 0; i < setupCount; i++) {
            expect(finalData.at(i)).toBe(addedMessages.at(i));
        }
    });
    it('should add new entities', async () => {
        const { userSet, messageSet, userMessages, setupCount } = await setupRelationshipTest();
        // This is a pre-check for validating that setup was ran correctly
        const initialCount = await getCurrentMessageCount(userMessages);
        expect(initialCount).toBe(setupCount);

        // Create a new message, which isn't attached to user.
        // To do this, we'll need to make a different user
        const oddUser = await addUser(userSet);
        const message = createMessage(oddUser);
        const addedMessage = await messageSet.add(message);

        // This is a intermittent check for validating that message wasn't linked to user prematurely
        const intermittentCount = await getCurrentMessageCount(userMessages);
        expect(intermittentCount).toBe(initialCount);

        // ! Function Under Test ! !
        await userMessages.add(addedMessage);

        // Let's check that the message was linked correctly
        const finalData = await userMessages.findAll();
        expect(finalData.length).toBe(initialCount + 1);

    });

    it('should update existing entities', async () => {
        const { userSet, messageSet, userMessages, setupCount } = await setupRelationshipTest();
        // This is a pre-check for validating that setup was ran correctly
        const initialCount = await getCurrentMessageCount(userMessages);
        expect(initialCount).toBe(setupCount);

        // Create a new message, which isn't attached to user.
        // To do this, we'll need to make a different user
        const oddUser = await addUser(userSet);
        const message = createMessage(oddUser);
        const addedMessage = await messageSet.add(message);

        // This is a intermittent check for validating that message wasn't linked to user prematurely
        const intermittentCount = await getCurrentMessageCount(userMessages);
        expect(intermittentCount).toBe(initialCount);

        // ! Function Under Test ! !
        await userMessages.update(addedMessage);

        // Let's check that the message was linked correctly
        const finalData = await userMessages.findAll();
        expect(finalData.length).toBe(1);
    });

    it('should remove existing entities', async () => {
        const { userMessages, addedMessages, setupCount } = await setupRelationshipTest();
        // This is a pre-check for validating that setup was ran correctly
        const initialCount = await getCurrentMessageCount(userMessages);
        expect(initialCount).toBe(setupCount);
        const addedMessage = addedMessages.at(0);
        expect(addedMessage).toBeDefined(); // ! Required for code assumptions

        // ! Function Under Test ! !
        if (addedMessage) {
            await userMessages.remove(addedMessage);
        }

        // Let's check that the message was unlinked correctly
        const finalData = await userMessages.findAll();
        expect(finalData.length).toBe(initialCount - 1);
    });

    it('should bulk add new entities', async () => {
        const { userSet, messageSet, userMessages, setupCount } = await setupRelationshipTest();
        // This is a pre-check for validating that setup was ran correctly
        const initialCount = await getCurrentMessageCount(userMessages);
        expect(initialCount).toBe(setupCount);

        // Create a new message, which isn't attached to user.
        // To do this, we'll need to make a different user
        const oddUser = await addUser(userSet);
        const messages = [...Array(setupCount).keys()].map(() => createMessage(oddUser));
        const addedMessages = await messageSet.bulkAdd(messages);

        // This is a intermittent check for validating that message wasn't linked to user prematurely
        const intermittentCount = await getCurrentMessageCount(userMessages);
        expect(intermittentCount).toBe(initialCount);

        // ! Function Under Test ! !
        await userMessages.bulkAdd(addedMessages);

        // Let's check that the message was linked correctly
        const finalData = await userMessages.findAll();
        expect(finalData.length).toBe(initialCount + setupCount);
    });

    it('should bulk update existing entities', async () => {
        const { userSet, messageSet, userMessages, setupCount } = await setupRelationshipTest();
        // This is a pre-check for validating that setup was ran correctly
        const initialCount = await getCurrentMessageCount(userMessages);
        expect(initialCount).toBe(setupCount);

        // Create a new message, which isn't attached to user.
        // To do this, we'll need to make a different user
        const oddUser = await addUser(userSet);
        const messages = [...Array(setupCount - 1).keys()].map(() => createMessage(oddUser));
        const addedMessages = await messageSet.bulkAdd(messages);

        // This is a intermittent check for validating that message wasn't linked to user prematurely
        const intermittentCount = await getCurrentMessageCount(userMessages);
        expect(intermittentCount).toBe(initialCount);

        // ! Function Under Test ! !
        await userMessages.bulkUpdate(addedMessages);

        // Let's check that the message was linked correctly
        const finalData = await userMessages.findAll();
        expect(finalData.length).toBe(setupCount - 1);
    });

    it('should bulk remove existing entities', async () => {
        const { userMessages, addedMessages, setupCount } = await setupRelationshipTest();
        // This is a pre-check for validating that setup was ran correctly
        const initialCount = await getCurrentMessageCount(userMessages);
        expect(initialCount).toBe(setupCount);
        const toRemoveMessages = [...Array(setupCount - 1).keys()].map(i => addedMessages.at(i)).filter(x => x ? true : false);
        expect(toRemoveMessages.length).toBeGreaterThan(0); // ! Required for code assumptions

        // ! Function Under Test ! !
        await userMessages.bulkRemove(toRemoveMessages as Message[]);

        // Let's check that the message was unlinked correctly
        const finalData = await userMessages.findAll();
        expect(finalData.length).toBe(1);
    });

    it('should sort existing entities in ascending order', async () => {
        const { user, messageSet, userMessages, setupCount } = await setupRelationshipTest();
        // This is a pre-check for validating that setup was ran correctly
        const initialCount = await getCurrentMessageCount(userMessages);
        expect(initialCount).toBe(setupCount);

        // Our random strings will start with an ISO string.
        const messageA = createMessage(user, "00");
        const addedMessageA = await messageSet.add(messageA);
        const messageZ = createMessage(user, "ZULU");
        const addedMessageZ = await messageSet.add(messageZ);

        // ! Function Under Test ! !
        // Let's check that the message was linked correctly
        const finalData = await userMessages.sortByAsc(x => x.text).findAll();
        expect(finalData.length).toBe(initialCount + 2);
        expect(finalData.first()?.id).toBe(addedMessageA.id);
        expect(finalData.last()?.id).toBe(addedMessageZ.id);
    });

    it('should sort existing entities in descending order', async () => {
        const { user, messageSet, userMessages, setupCount } = await setupRelationshipTest();
        // This is a pre-check for validating that setup was ran correctly
        const initialCount = await getCurrentMessageCount(userMessages);
        expect(initialCount).toBe(setupCount);

        // Our random strings will start with an ISO string.
        const messageA = createMessage(user, "00");
        const addedMessageA = await messageSet.add(messageA);
        const messageZ = createMessage(user, "ZULU");
        const addedMessageZ = await messageSet.add(messageZ);

        // ! Function Under Test ! !
        // Let's check that the message was linked correctly
        const finalData = await userMessages.sortByDesc(x => x.text).findAll();
        expect(finalData.length).toBe(initialCount + 2);

        expect(finalData.first()?.id).toBe(addedMessageZ.id);
        expect(finalData.last()?.id).toBe(addedMessageA.id);
    });

    it('should include relationships', async () => {
        const { user, userMessages, setupCount } = await setupRelationshipTest();
        // This is a pre-check for validating that setup was ran correctly
        const initialCount = await getCurrentMessageCount(userMessages);
        expect(initialCount).toBe(setupCount);

        // ! Function Under Test ! !
        // Let's check that the message was linked correctly
        const finalData = await userMessages.include(x => x.user).findAll();
        expect(finalData.length).toBe(initialCount);

        // Let's also check that our queried data is correct
        for (let i = 0; i < setupCount; i++) {
            expect(finalData.at(i)?.user).toBe(user);
        }
    });

    it('should paginate existing entities', async () => {
        const { user, messageSet, userMessages, setupCount } = await setupRelationshipTest();
        // This is a pre-check for validating that setup was ran correctly
        const initialCount = await getCurrentMessageCount(userMessages);
        expect(initialCount).toBe(setupCount);

        // Create a lot of messages 
        const messages = [...Array(20).keys()].map(() => createMessage(user));
        await messageSet.bulkAdd(messages);

        // ! Function Under Test ! !
        // Let's check that the message was linked correctly
        const page1Data = await userMessages.paginate(x => x.pageSize(1, 10)).findAll();
        const page2Data = await userMessages.paginate(x => x.pageSize(2, 10)).findAll();
        const page3Data = await userMessages.paginate(x => x.pageSize(3, 10)).findAll();

        expect(page1Data.length).toBe(10);
        expect(page2Data.length).toBe(10);
        expect(page3Data.length).toBe(setupCount);
    });
});
