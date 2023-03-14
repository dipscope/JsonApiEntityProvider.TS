# JsonApiEntityProvider.TS

![GitHub](https://img.shields.io/github/license/dipscope/JsonApiEntityProvider.TS) ![NPM](https://img.shields.io/npm/v/@dipscope/json-api-entity-provider) ![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)

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

`JsonApi` entity provider aims to cover [JSON:API](https://jsonapi.org) specification. It supports the latest version (v1.0) and allows you easily connect to any backend API which follows described conventions. Besides it provides you extension points for different filtering and pagination strategies which might be used by a server.

## Installation

`JsonApiEntityProvider.TS` is available from NPM, both for browser (e.g. using webpack) and NodeJS:

```
npm i @dipscope/json-api-entity-provider
```

_This package is a plugin for `EntityStore.TS` package. Please [read documentation](https://github.com/dipscope/EntityStore.TS) after installation._

## Configuration

First step is to create a provider and pass options you want to apply.

```typescript
import { JsonApiEntityProvider, JsonApiEntityProviderOptions } from '@dipscope/json-api-entity-provider';
import { JsonApiNetFilterExpressionVisitor, JsonApiNetPaginateExpressionVisitor } from '@dipscope/json-api-entity-provider';
import { AppEntityStore } from './app';

// Create entity provider.
const jsonApiEntityProvider = new JsonApiEntityProvider({
    baseUrl: 'http://localhost:20001', // Url to you backend endpoint.
    jsonApiRequestInterceptor: (request: Request) => request, // You might intercept requests by adding headers. 
    jsonApiFilterExpressionVisitor: new JsonApiNetFilterExpressionVisitor(), // You might override filtering strategy used by a server.
    jsonApiPaginateExpressionVisitor: new JsonApiNetPaginateExpressionVisitor(), // You might override pagination strategy used by a server.
    ... // Other options to override.
});

// Create entity store.
const appEntityStore = new AppEntityStore(jsonApiEntityProvider);
```

Second step is to define resource configuration for your entities as required by [JSON:API](https://jsonapi.org) specification.

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

After that you have to follow `EntityStore.TS` [documentation](https://github.com/dipscope/EntityStore.TS). Supported methods which you can use through `EntitySet` is dependent from backend implementation of [JSON:API](https://jsonapi.org) specification.

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
