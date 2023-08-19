# JsonApiEntityProvider.TS

![GitHub](https://img.shields.io/github/license/dipscope/JsonApiEntityProvider.TS) ![NPM](https://img.shields.io/npm/v/@dipscope/json-api-entity-provider) ![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)

`JsonApiEntityProvider.TS` is an implementation of `EntityProvider` for `EntityStore.TS` package. You can find detailed information on the [project page](https://github.com/dipscope/EntityStore.TS).

## Give a star :star:

If you like or are using this project please give it a star. Thanks!

## Table of contents

* [What issues it solves?](#what-issues-it-solves)
* [Installation](#installation)
* [Configuration](#configuration)
* [Relationship operations](#relationship-operations)
    * [To-One relationship provider](#to-one-relationship-provider)
    * [To-Many relationship provider](#to-many-relationship-provider)
* [Versioning](#versioning)
* [Contributing](#contributing)
* [Authors](#authors)
* [Notes](#notes)
* [License](#license)

## What issues it solves?

`JsonApi` entity provider aims to cover [JSON:API](https://jsonapi.org) specification. It supports the latest stable version (v1.1) and allows you easily connect to any backend API which follows described conventions. Besides it provides you extension points for different filtering and pagination strategies which might be used by a server.

## Installation

`JsonApiEntityProvider.TS` is available from NPM, both for browser (e.g. using webpack) and NodeJS:

```
npm i @dipscope/json-api-entity-provider
```

_This package is a plugin for `EntityStore.TS` package. Please [read documentation](https://github.com/dipscope/EntityStore.TS) after installation. Besides you have to [read documentation](https://github.com/dipscope/TypeManager.TS) for `TypeManager.TS` to know all available options to configure your entity types._

## Configuration

First step is to create a provider and pass options you want to apply.

```typescript
import { JsonApiEntityProvider, JsonApiEntityProviderOptions } from '@dipscope/json-api-entity-provider';
import { JsonApiNetFilterExpressionVisitor, JsonApiNetPaginateExpressionVisitor } from '@dipscope/json-api-entity-provider';
import { AppEntityStore } from './app';

// Create entity provider.
const jsonApiEntityProvider = new JsonApiEntityProvider({
    baseUrl: 'http://localhost:20001', // Url to you backend endpoint.

    // Next options are optional...

    jsonApiRequestInterceptor: (request: Request) => request, // You might intercept requests by adding headers. 
    jsonApiResponseInterceptor: (response: Response) => response, // You might intercept response by logging errors. 
    jsonApiFilterExpressionVisitor: new JsonApiNetFilterExpressionVisitor(), // You might override filtering strategy used by a server.
    jsonApiPaginateExpressionVisitor: new JsonApiNetPaginateExpressionVisitor(), // You might override pagination strategy used by a server.

    // Other options to override...
});

// Create entity store.
const appEntityStore = new AppEntityStore(jsonApiEntityProvider);
```

As [JSON:API](https://jsonapi.org) specification is agnostic about filtering and pagination strategies, you might need to select one of existing visitors or implement your own by extending base classes.

Second step is to define resource configuration for your entities as required by [JSON:API](https://jsonapi.org) specification. For the full list of available options [check documentation](https://github.com/dipscope/TypeManager.TS) for `TypeManager.TS`.

```typescript
import { Type, Property } from '@dipscope/type-manager';
import { EntityCollection } from '@dipscope/entity-store';
import { JsonApiResource } from '@dipscope/json-api-entity-provider';
import { Company, Message } from './app/entities';

@Type()
@JsonApiResource({
    type: 'user' // Specify resource type.
    route: 'users' // Custom route for the resource. If not specified, the value of `type` will be used.
})
export class User
{
    @Property(String) public id?: string;
    @Property(String) public name: string;
    @Property(String) public email: string;
    @Property(Company) public company: Company;
    @Property(EntityCollection, [Message]) public messages: EntityCollection<Message>;

    // Omitted for brevity ...
}
```

The same configuration can be rewritten using declarative style.

```typescript
import { TypeManager, TypeMetadata, TypeConfiguration } from '@dipscope/type-manager';
import { EntityCollection } from '@dipscope/entity-store';
import { JsonApiResourceMetadata } from '@dipscope/json-api-entity-provider';
import { Company, Message } from './app/entities';

export class User
{
    public id?: string;
    public name: string;
    public email: string;
    public company: Company;
    public messages: EntityCollection<Message>;

    // Omitted for brevity ...
}

export class UserConfiguration implements TypeConfiguration<User>
{
    public configure(typeMetadata: TypeMetadata<User>): void 
    {
        typeMetadata.configureTypeExtensionMetadata(JsonApiResourceMetadata)
            .hasType('user')
            .hasRoute('users');

        typeMetadata.configurePropertyMetadata('id')
            .hasTypeArgument(String);

        typeMetadata.configurePropertyMetadata('name')
            .hasTypeArgument(String);

        typeMetadata.configurePropertyMetadata('email')
            .hasTypeArgument(String);

        typeMetadata.configurePropertyMetadata('company')
            .hasTypeArgument(Company);

        typeMetadata.configurePropertyMetadata('messages')
            .hasTypeArgument(EntityCollection)
            .hasGenericArguments([Message]);

        return;
    }
}

TypeManager.applyTypeConfiguration(User, new UserConfiguration());
```

After that you have to follow `EntityStore.TS` [documentation](https://github.com/dipscope/EntityStore.TS). Supported methods which you can use through `EntitySet` is dependent from backend implementation of [JSON:API](https://jsonapi.org) specification.

## Relationship operations

The `JsonApiEntityProvider` supplies functionality for simplifying relationship operations.

NOTE: each of these operations assume that all entities are already stored.

Thus, operations to Update/Add models will have to performed after adding the related model to the entity set.

```typescript
const specEntityStore = new SpecEntityStore();
const userSet = specEntityStore.userSet;
const messageSet = specEntityStore.messageSet;
const companySet = specEntityStore.companySet;
const jsonApiEntityProvider = specEntityStore.jsonApiEntityProvider;

// Populate entity set.
const user = await userSet.add(user);
const company = await companySet.add(new Company());
const company2 = await companySet.add(new Company());
const newMessage = await messageSet.add(new Message());
const newMessages = await messageSet.bulkAdd([new Message(), new Message()]);

// Now perform relationship operations...
```

### To-One relationship provider

The To-One relationship provider enables operations on to-one relationships. To-One relationship provider currently only provides support for the following features:

1. Fetching related data.
2. Updating related data by pointing relationship to a different model.
3. Removing related data.

```typescript
const userCompany = jsonApiEntityProvider.createJsonApiToOneRelationship(userSet, user, u => u.company);

// Fetching To-One relationship data.
const company = await userCompany.find();

// Updating To-One relationship data.
await userCompany.update(otherCompany);

// Removing To-One relationship data.
await userCompany.remove();
```

### To-Many relationship provider

The To-Many relationship provider enables operations on to-many relationships. To-Many relationship provider currently only provides support for the following features:

1. Fetching related data.
2. Fetching related data with include and sort clauses.
3. Fetching related data with pagination.
4. Adding an element to the related data.
5. Updating related data by pointing relationship to a different model.
6. Removing an element from the related data.

```typescript
const userMessages = jsonApiEntityProvider.createJsonApiToManyRelationship(userSet, user, u => u.messages);

// Fetching To-Many relationship data.
const messages = await userMessages.findAll();

// Fetching related data with include clauses.
const messagesWithUser = await userMessages.include(x => x.user).findAll();
const messagesWithReplies = await userMessages.includeCollection(x => x.messages).findOne();

// Fetching related data with sort clauses.
const messagesAsc = await userMessages.sortByAsc(x => x.text).findAll();
const messagesDesc = await userMessages.sortByDesc(x => x.text).findAll();

// Fetching related data with pagination clauses.
const firstPageData = await userMessages.paginate(x => x.pageSize(1, 10)).findAll();
const secondPageData = await userMessages.paginate(x => x.pageSize(2, 10)).findAll();
const lastPageData = await userMessages.paginate(x => x.pageSize(4, 10)).findAll();

// Adding element(s) to the related data.
await userMessages.add(newMessage);
await userMessages.bulkAdd(newMessages);

// Updating To-Many relationship data.
await userMessages.update(addedMessage);
await userMessages.bulkUpdate(addedMessages);

// Removing To-Many relationship data.
await userMessages.remove(addedMessage);
await userMessages.bulkRemove(toRemoveMessages);
```

## Versioning

We use [SemVer](http://semver.org) for versioning. For the versions available, see the versions section on [NPM project page](https://www.npmjs.com/package/@dipscope/json-api-entity-provider).

See information about breaking changes, release notes and migration steps between versions in [CHANGELOG.md](https://github.com/dipscope/JsonApiEntityProvider.TS/blob/main/CHANGELOG.md) file.

## Contributing

Please read [CONTRIBUTING.md](https://github.com/dipscope/JsonApiEntityProvider.TS/blob/main/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

* **Dmitry Pimonov** - *Initial work* - [dpimonov](https://github.com/dpimonov)

See also the list of [contributors](https://github.com/dipscope/JsonApiEntityProvider.TS/contributors) who participated in this project.

## Notes

Thanks for checking this package.

Feel free to create an issue if you find any mistakes in documentation or have any improvements in mind.

We wish you good luck and happy coding!

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE.md](https://github.com/dipscope/JsonApiEntityProvider.TS/blob/main/LICENSE.md) file for details.
