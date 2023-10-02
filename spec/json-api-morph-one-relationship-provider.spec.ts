import { EntitySet } from '@dipscope/entity-store';
import { generateRandomString, Human, Man, SpecEntityStore, Woman } from './entity-store.spec';

function generateRandomBool(): boolean
{
    return Math.round(Math.random()) === 1;
}

async function addHuman(humanSet: EntitySet<Human>, name?: string, sex?: 'Man'|'Woman') 
{
    sex ??= generateRandomBool() ? 'Man' : 'Woman';
    name ??= generateRandomString();

    const human = sex === 'Man' ? new Man(name, generateRandomBool()) : new Woman(name, generateRandomString());
    const remoteHuman = await humanSet.add(human);

    expect(remoteHuman).toBe(human);

    return remoteHuman;
}

async function setupRelationshipTest() 
{
    // Get Entity Store Objects.
    const specEntityStore = new SpecEntityStore();
    const humanSet = specEntityStore.humanSet;
    const jsonApiEntityProvider = specEntityStore.jsonApiEntityProvider;

    // Create two humans.
    const human = await addHuman(humanSet);
    const spouse = await addHuman(humanSet);

    // Create 3 initial Messages.
    const humanSpouse = jsonApiEntityProvider.createJsonApiToOneRelationship(humanSet, human, u => u.spouse);

    return { specEntityStore, spouse, humanSet, jsonApiEntityProvider, human, humanSpouse };
}

describe('Json api morph to many relationship provider', () => 
{
    it('should fetch existing entity', async () =>
    {
        const { humanSet, spouse, humanSpouse, human } = await setupRelationshipTest();

        expect(human.spouse).toBeUndefined();

        // We have some continued setup, we need to assign a company to the human.
        human.spouse = spouse;

        const initialHuman = await humanSet.update(human);

        expect(initialHuman.spouse).toBeDefined();

        // ! Function Under Test !
        // Let's check that the message was linked correctly.
        const data = await humanSpouse.find();

        expect(data).toEqual(spouse);
    });
    
    it('should update existing entities', async () =>
    {
        const { humanSpouse, spouse, human } = await setupRelationshipTest();
        expect(human.spouse).toBeUndefined();

        // ! Function Under Test !
        await humanSpouse.update(spouse);

        // Let's check that the message was linked correctly.
        const finalData = await humanSpouse.find();

        expect(finalData?.id).toBe(spouse.id);
    });

    it('should remove existing entities', async () =>
    {
        const { humanSpouse, human, spouse, humanSet } = await setupRelationshipTest();

        // We have some continued setup, we need to assign a spouse to the human.
        human.spouse = spouse;

        const initialHuman = await humanSet.update(human);

        expect(initialHuman.spouse).toBeDefined();

        // ! Function Under Test !
        await humanSpouse.remove();

        // Let's check that the message was unlinked correctly.
        const finalData = await humanSpouse.find();

        expect(finalData).toBeNull();
    });

    // ! Include Clauses Not Yet Implemented !
    // it('should include relationships', async () =>
    // {
    //     const { humanSet, spouse, humanSpouse, human } = await setupRelationshipTest();
    // 
    //     expect(human.spouse).toBeUndefined();
    //
    //     // We have some continued setup, we need to assign a spouse to the human.
    //     human.spouse = spouse;
    //
    //     const initialHuman = await humanSet.update(human);
    //
    //     expect(initialHuman.spouse).toBeDefined();
    //
    //     // ! Function Under Test !
    //     // Let's check that the message was linked correctly.
    //     const data = await humanSpouse.include(x => x.humans).findOne();
    //
    //     expect(data?.id).toEqual(spouse.id);
    //     expect(data?.humans.at(0)?.id).toEqual(human.id);
    // });

    // it('should include a collection of relationships', async () =>
    // {
    //     const { humanSet, spouse, humanSpouse, human } = await setupRelationshipTest();
    //
    //     expect(human.spouse).toBeUndefined();
    //
    //     // We have some continued setup, we need to assign a spouse to the human.
    //     human.spouse = spouse;
    //
    //     const initialHuman = await humanSet.update(human);
    //
    //     expect(initialHuman.spouse).toBeDefined();
    //
    //     // ! Function Under Test !
    //     // Let's check that the message was linked correctly.
    //     const data = await humanSpouse.includeCollection(x => x.humans).findOne();
    //
    //     expect(data?.id).toEqual(spouse.id);
    //     expect(data?.humans.at(0)?.id).toEqual(human.id);
    // });
});
