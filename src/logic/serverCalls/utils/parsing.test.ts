import {removeCharacters} from "./parsing";


describe('removeCharacters', function () {
    test('nothing to remove', () => {
        expect(removeCharacters('works', ['e', 'f'])).toStrictEqual('works');
    });

    test('removes', () => {
        expect(removeCharacters('works', ['a', 'r', 's', 'x'])).toStrictEqual('wok');
    });
});
