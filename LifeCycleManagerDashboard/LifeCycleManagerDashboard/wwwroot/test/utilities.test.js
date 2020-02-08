const Utilities = require('../js/utilities');

describe('When using Utilities', function mainUtilitiesTestSuite() {
    describe('to parse a value to the type: ', function parsingToTypeTestSuite() {

        describe('boolean.', function parsingToBoolTestSuite() {
            it('parses false and true', function parseBooleanAsABoolean() {
                const parsedFalse = Utilities.GetTypeOfValue(false);
                expect(parsedFalse).toBe('boolean');
                const parsedTrue = Utilities.GetTypeOfValue(true);
                expect(parsedTrue).toBe('boolean');
            });
            it('parses "false" and "true"', function parseStringAsABoolean() {
                const parsedFalse = Utilities.GetTypeOfValue('false');
                expect(parsedFalse).toBe('boolean');
                const parsedTrue = Utilities.GetTypeOfValue('true');
                expect(parsedTrue).toBe('boolean');
            });
            it('parses "False" and "True"', function parseStringWithFirstLetterAsCapitalAsABoolean() {
                const parsedFalse = Utilities.GetTypeOfValue('False');
                expect(parsedFalse).toBe('boolean');
                const parsedTrue = Utilities.GetTypeOfValue('True');
                expect(parsedTrue).toBe('boolean');
            });
            it('parses "FalSe" and "TRuE"', function parseStringWithRandomCapitalLettersAsABoolean() {
                const parsedFalse = Utilities.GetTypeOfValue('FalSe');
                expect(parsedFalse).toBe('boolean');
                const parsedTrue = Utilities.GetTypeOfValue('TRuE');
                expect(parsedTrue).toBe('boolean');
            });
            it('But not "Balse" and "Brue"', function parseTheWrongLettersForRegexAsABoolean() {
                // It will be parsed as a string
                const parsedFalse = Utilities.GetTypeOfValue('Balse');
                expect(parsedFalse).not.toBe('boolean');
                const parsedTrue = Utilities.GetTypeOfValue('Brue');
                expect(parsedTrue).not.toBe('boolean');
            });
        });

        describe('float.', function parsingToBoolTestSuite() {
            it('parses 10.2', function parseFloatAsAFloatTestCase() {
                const parsedFloat = Utilities.GetTypeOfValue(10.2);
                expect(parsedFloat).toBe('float');
            });

            it('parses "10.2"', function parseStringAsAFloatTestCase() {
                const parsedFloat = Utilities.GetTypeOfValue('10.2');
                expect(parsedFloat).toBe('float');
            });
            it('does not parse 10', function parseNumberAsAFloatTestCase() {
                const parsedFloat = Utilities.GetTypeOfValue(10);
                expect(parsedFloat).not.toBe('float');
            });
        });

        describe('number.', function parsingToBoolTestSuite() {
            it('parses 10', function parseNumberAsANumberTestCase() {
                const parsedFloat = Utilities.GetTypeOfValue(10);
                expect(parsedFloat).toBe('number');
            });
            it('parses "10"', function parseStringAsANumberTestCase() {
                const parsedFloat = Utilities.GetTypeOfValue('10');
                expect(parsedFloat).toBe('number');
            });
            it('does not parse 10.2', function parseFloatAsANumberTestCase() {
                const parsedFloat = Utilities.GetTypeOfValue(10.2);
                expect(parsedFloat).not.toBe('number');
            });
        });

        describe('string.', function parsingToBoolTestSuite() {
            it('parses "This is a string"', function parseStringTestCase() {
                const parsedFloat = Utilities.GetTypeOfValue('This is a string');
                expect(parsedFloat).toBe('string');
            });
            it('parses unparseable objects', function parseObjectAsAStringTestCase() {
                const notAString =
                    {
                        prop: "Not a string"
                    };
                const parsedFloat = Utilities.GetTypeOfValue(notAString);
                expect(parsedFloat).toBe("string");
            });
        });
    })

    describe('to get the typed value', function getTypedValueTestSuite() {
        it('should return the boolean type', function booleanTypeTestCase() {
            const boolFalseResult = Utilities.GetTypedValue('false');
            expect(boolFalseResult).toBeFalsy();
            const boolTrueResult = Utilities.GetTypedValue('true');
            expect(boolTrueResult).toBe(true);
        });
        it('should return the float type', function floatTypeTestCase() {
            const floatResult = Utilities.GetTypedValue('10.5');
            expect(typeof floatResult).toBe('number');
            expect(parseFloat(floatResult)).not.toBe(NaN);
        });
        it('should return the number type', function numberTypeTestCase() {
            const floatResult = Utilities.GetTypedValue('10');
            expect(typeof floatResult).toBe('number');
            expect(parseInt(floatResult)).not.toBe(NaN);
        });

        it('should return the string type', function stringTypeTestCase() {
            const stringResult = Utilities.GetTypedValue('A string');
            expect(typeof stringResult).toBe('string');
        });
    })
});