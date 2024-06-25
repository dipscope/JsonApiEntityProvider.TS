# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.4.0] - 2024-06-25

### Added

- Option to define fetch interceptor.
- Option to specify custom path for to-many relationship.
- Support for saving non-root entities directly under their parent.

## [2.3.0] - 2024-06-12

### Added

- Option to specify custom path for to-one relationship.

## [2.2.1] - 2024-02-18

### Fixed

- TypeScript 5 decorators do not work.

## [2.2.0] - 2023-10-03

### Added

- Support for polymorphic types.

## [2.1.0] - 2023-08-20

### Added

- Support for declarative style.
- Relationship api.
- Default pagination visitor implementation.

## [2.0.0] - 2023-06-25

### Added

- Fluent api for declarative configuration with type manager.

### Migrating from previous version

- Update type manager declarative configurations.

## [1.1.0] - 2023-03-14

### Added

- Support for custom resource routes.

## [1.0.1] - 2022-08-14

### Fixed

- Fetch API issues in Node.js LTS versions.

## [1.0.0] - 2022-07-31

### Added

- Json api entity provider.
- Json api net filter expression visitor.
- Json api net metadata extractor.
- Json api net paginate expression visitor.
- Json api sort expression visitor.
