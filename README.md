# JsonApiEntityProvider.TS

![GitHub](https://img.shields.io/github/license/dipscope/JsonApiEntityProvider.TS) ![NPM](https://img.shields.io/npm/v/@dipscope/in-memory-entity-provider) ![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)

`JsonApiEntityProvider.TS` is an implementation of `EntityProvider` for `EntityStore.TS` package. You can find detailed information on the [project page](https://github.com/dipscope/EntityStore.TS).

## Give a star :star:

If you like or are using this project please give it a star. Thanks!

## Table of contents

* [What issues it solves?](#what-issues-it-solves)
* [Installation](#installation)
* [Configuration](#configuration)
* [Versioning](#versioning)
* [Contributing](#contributing)
* [Authors](#authors)
* [Notes](#notes)
* [License](#license)

## What issues it solves?

`JsonApi` entity provider is implementation of [JSON:API](https://jsonapi.org) specification. It allows you easily connect to any backend API which follows described conventions.

## Installation

`JsonApiEntityProvider.TS` is available from NPM, both for browser (e.g. using webpack) and NodeJS:

```
npm i @dipscope/in-memory-entity-provider
```

_This package is a plugin for `EntityStore.TS` package. Please [read documentation](https://github.com/dipscope/EntityStore.TS) after installation._

## Configuration

This provider require configuration as some parts of specification are agnostic about the filter and pagination strategies supported by a server.

```typescript
import { JsonApiEntityProvider, JsonApiEntityProviderOptions } from '@dipscope/json-api-entity-provider';
import { AppEntityStore } from './app';

// Create entity provider.
const jsonApiEntityProvider = new JsonApiEntityProvider({
    baseUrl: ..., // Url to you backend endpoint.
    jsonApiRequestInterceptor: ..., // You might intercept requests by adding headers. 
    jsonApiFilterExpressionVisitor: ..., // You might override filtering strategy used by a server.
    jsonApiPaginateExpressionVisitor: ..., // You might override pagination strategy used by a server.
}); 

// Create entity store.
const appEntityStore = new AppEntityStore(jsonApiEntityProvider);
```

Besides as [JSON:API](https://jsonapi.org) specification require usage of resource type associated with each entity you have to specify one.

```typescript
import { Type, Property } from '@dipscope/type-manager';
import { EntityCollection } from '@dipscope/entity-store';
import { JsonApiResourceType } from '@dipscope/json-api-entity-provider';
import { Company, Message } from './app/entities';

@Type()
@JsonApiResource({
    type: 'users'
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

Supported methods which you can use through `EntitySet` is dependent from backend implementation of [JSON:API](https://jsonapi.org) specification. We defined only configuration part in examples above but there might be more information required like creation of custom filter expression visitor. Currently it is not clear which parts we have to describe. Feel free to open an issue if you require more information.

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
