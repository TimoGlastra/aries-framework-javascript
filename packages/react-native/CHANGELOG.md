# Changelog

## [0.2.0](https://github.com/TimoGlastra/aries-framework-javascript/compare/react-native-v0.1.0...react-native-v0.2.0) (2022-06-15)


### ⚠ BREAKING CHANGES

* indy-sdk-react-native has been updated to 0.2.0. The new version now depends on libindy version 1.16 and requires you to update the binaries in your react-native application. See the [indy-sdk-react-native](https://github.com/hyperledger/indy-sdk-react-native) repository for instructions on how to get the latest binaries for both iOS and Android.

### Features

* add generic did resolver ([#554](https://github.com/TimoGlastra/aries-framework-javascript/issues/554)) ([8e03f35](https://github.com/TimoGlastra/aries-framework-javascript/commit/8e03f35f8e1cd02dac4df02d1f80f2c5a921dfef))
* add update assistant for storage migrations ([#690](https://github.com/TimoGlastra/aries-framework-javascript/issues/690)) ([c9bff93](https://github.com/TimoGlastra/aries-framework-javascript/commit/c9bff93cfac43c4ae2cbcad1f96c1a74cde39602))
* **core:** d_m invitation parameter and invitation image ([#456](https://github.com/TimoGlastra/aries-framework-javascript/issues/456)) ([f92c322](https://github.com/TimoGlastra/aries-framework-javascript/commit/f92c322b97be4a4867a82c3a35159d6068951f0b))
* **core:** ledger module registerPublicDid implementation ([#398](https://github.com/TimoGlastra/aries-framework-javascript/issues/398)) ([5f2d512](https://github.com/TimoGlastra/aries-framework-javascript/commit/5f2d5126baed2ff58268c38755c2dbe75a654947))
* delete credential from wallet ([#691](https://github.com/TimoGlastra/aries-framework-javascript/issues/691)) ([abec3a2](https://github.com/TimoGlastra/aries-framework-javascript/commit/abec3a2c95815d1c54b22a6370222f024eefb060))
* indy revocation (prover & verifier) ([#592](https://github.com/TimoGlastra/aries-framework-javascript/issues/592)) ([fb19ff5](https://github.com/TimoGlastra/aries-framework-javascript/commit/fb19ff555b7c10c9409450dcd7d385b1eddf41ac))
* ledger connections happen on agent init in background ([#580](https://github.com/TimoGlastra/aries-framework-javascript/issues/580)) ([61695ce](https://github.com/TimoGlastra/aries-framework-javascript/commit/61695ce7737ffef363b60e341ae5b0e67e0e2c90))
* support wallet key rotation ([#672](https://github.com/TimoGlastra/aries-framework-javascript/issues/672)) ([5cd1598](https://github.com/TimoGlastra/aries-framework-javascript/commit/5cd1598b496a832c82f35a363fabe8f408abd439))


### Bug Fixes

* alter mediation recipient websocket transport priority ([#434](https://github.com/TimoGlastra/aries-framework-javascript/issues/434)) ([52c7897](https://github.com/TimoGlastra/aries-framework-javascript/commit/52c789724c731340daa8528b7d7b4b7fdcb40032))
* **core:** using query-string to parse URLs ([#457](https://github.com/TimoGlastra/aries-framework-javascript/issues/457)) ([78e5057](https://github.com/TimoGlastra/aries-framework-javascript/commit/78e505750557f296cc72ef19c0edd8db8e1eaa7d))
* monorepo release issues ([#386](https://github.com/TimoGlastra/aries-framework-javascript/issues/386)) ([89a628f](https://github.com/TimoGlastra/aries-framework-javascript/commit/89a628f7c3ea9e5730d2ba5720819ac6283ee404))


### Miscellaneous Chores

* update indy-sdk-react-native version to 0.2.0 ([#754](https://github.com/TimoGlastra/aries-framework-javascript/issues/754)) ([4146778](https://github.com/TimoGlastra/aries-framework-javascript/commit/414677828be7f6c08fa02905d60d6555dc4dd438))
