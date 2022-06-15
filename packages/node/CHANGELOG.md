# Changelog

## [0.2.0](https://github.com/TimoGlastra/aries-framework-javascript/compare/node-v0.1.0...node-v0.2.0) (2022-06-15)


### Features

* add multiple inbound transports ([#433](https://github.com/TimoGlastra/aries-framework-javascript/issues/433)) ([56cb9f2](https://github.com/TimoGlastra/aries-framework-javascript/commit/56cb9f2202deb83b3c133905f21651bfefcb63f7))
* break out indy wallet, better indy handling ([#396](https://github.com/TimoGlastra/aries-framework-javascript/issues/396)) ([9f1a4a7](https://github.com/TimoGlastra/aries-framework-javascript/commit/9f1a4a754a61573ce3fee78d52615363c7e25d58))
* **core:** add support for postgres wallet type ([#699](https://github.com/TimoGlastra/aries-framework-javascript/issues/699)) ([83ff0f3](https://github.com/TimoGlastra/aries-framework-javascript/commit/83ff0f36401cbf6e95c0a1ceb9fa921a82dc6830))
* **core:** connection-less issuance and verification ([#359](https://github.com/TimoGlastra/aries-framework-javascript/issues/359)) ([fb46ade](https://github.com/TimoGlastra/aries-framework-javascript/commit/fb46ade4bc2dd4f3b63d4194bb170d2f329562b7))
* **core:** support multiple indy ledgers ([#474](https://github.com/TimoGlastra/aries-framework-javascript/issues/474)) ([47149bc](https://github.com/TimoGlastra/aries-framework-javascript/commit/47149bc5742456f4f0b75e0944ce276972e645b8))
* indy revocation (prover & verifier) ([#592](https://github.com/TimoGlastra/aries-framework-javascript/issues/592)) ([fb19ff5](https://github.com/TimoGlastra/aries-framework-javascript/commit/fb19ff555b7c10c9409450dcd7d385b1eddf41ac))
* **node:** add http and ws inbound transport ([#392](https://github.com/TimoGlastra/aries-framework-javascript/issues/392)) ([34a6ff2](https://github.com/TimoGlastra/aries-framework-javascript/commit/34a6ff2699197b9d525422a0a405e241582a476c))
* **node:** add is-indy-installed command ([#510](https://github.com/TimoGlastra/aries-framework-javascript/issues/510)) ([e50b821](https://github.com/TimoGlastra/aries-framework-javascript/commit/e50b821343970d299a4cacdcba3a051893524ed6))


### Bug Fixes

* close session early if no return route ([#715](https://github.com/TimoGlastra/aries-framework-javascript/issues/715)) ([2e65408](https://github.com/TimoGlastra/aries-framework-javascript/commit/2e6540806f2d67bef16004f6e8398c5bf7a05bcf))
* **node:** allow to import node package without postgres ([#757](https://github.com/TimoGlastra/aries-framework-javascript/issues/757)) ([59e1058](https://github.com/TimoGlastra/aries-framework-javascript/commit/59e10589acee987fb46f9cbaa3583ba8dcd70b87))
* **node:** node v12 support for is-indy-installed ([#542](https://github.com/TimoGlastra/aries-framework-javascript/issues/542)) ([17e9157](https://github.com/TimoGlastra/aries-framework-javascript/commit/17e9157479d6bba90c2a94bce64697d7f65fac96))
* **node:** only send 500 if no headers sent yet ([#857](https://github.com/TimoGlastra/aries-framework-javascript/issues/857)) ([4be8f82](https://github.com/TimoGlastra/aries-framework-javascript/commit/4be8f82c214f99538eaa0fd0aac5a8f7a6e1dd6b))
