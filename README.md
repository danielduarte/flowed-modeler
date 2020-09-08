# Flowed Modeler

An modeling solution for [Flowed](https://danielduarte.github.io/flowed).

![Flowed Modeler](docs/screenshot.png)

Based on [Camunda Modeler](https://camunda.com/products/modeler/) and [bpmn.io](http://bpmn.io).

## Resources

* [Changelog](./CHANGELOG.md)
* [Download](https://camunda.com/download/modeler/) (see also [nightly builds](https://downloads.camunda.cloud/release/camunda-modeler/nightly/))
* [Give Feedback](https://forum.camunda.org/c/modeler)
* [Report a Bug](https://github.com/camunda/camunda-modeler/issues)
* [User Documentation](https://docs.camunda.org/manual/latest/modeler/camunda-modeler/)


## Building the Application

```sh
# checkout a tag
git checkout v1.1.0

# install dependencies
npm install

# execute all checks (lint, test and build)
npm run all

# build the application to ./dist
npm run build
```


### Development Setup

Spin up the application for development, all strings attached:

```
npm run dev
```


## License

MIT

Uses [bpmn-js](https://github.com/bpmn-io/bpmn-js), [dmn-js](https://github.com/bpmn-io/dmn-js), and [cmmn-js](https://github.com/bpmn-io/cmmn-js), licensed under the [bpmn.io license](http://bpmn.io/license).

Uses [camunda-modeler](https://github.com/camunda/camunda-modeler), licensed under the [MIT license](https://github.com/camunda/camunda-modeler/blob/develop/LICENSE).
