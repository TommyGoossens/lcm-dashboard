if (!("Utilities" in window)) {
    Utilities = {};
    (function main(context) {
        /**
         * Returns the type of the value
         * @param val to be checked
         * @returns {string} representation of the type
         */
        context.GetTypeOfValue = function GetTypeOfValue(val) {
            if (val !== null) {

                const regexTrue = /[Tt][Rr][Uu][Ee]*$/g;
                const regexFalse = /[Ff][Aa][Ll][Ss][Ee]*$/g;
                if (regexTrue.test(val) || regexFalse.test(val) || typeof val === 'boolean') {
                    return 'boolean';
                }
                if (!isNaN(Number(val)) && val % 1 !== 0) {
                    return 'float';
                }
                if ((!isNaN(Number(val)) && val % 1 === 0) || typeof val === 'number') {
                    return 'number';
                }
            }
            // Empty fields or unparsed values will result in a string
            return 'string';
        };

        /**
         * Casts the string value to the actual type
         * @param val value as string
         * @returns {Utilities.GetTypedValue.props|*|boolean|number} the value as the actual type
         */
        context.GetTypedValue = function GetTypedValue(val) {
            switch (context.GetTypeOfValue(val)) {
                case 'boolean':
                    return (val === 'true');
                case 'float':
                    return parseFloat(val);
                case 'number':
                    return parseInt(val, 10);
                default:
                    return val;
            }
        };

        /**
         * Display a loading screen while executing the command
         */
        context.DisplayLoadingScreen = function DisplayLoadingScreen() {
            const loadingSpinner = document.getElementById('loading-spinner-overlay');
            if (loadingSpinner) {
                loadingSpinner.style.display = "block";
            }

        };

        /**
         * Hides the loading screen when the request is finished
         */
        context.HideLoadingScreen = function HideLoadingScreen() {
            const loadingSpinner = document.getElementById('loading-spinner-overlay');
            if (loadingSpinner) {
                loadingSpinner.style.display = "none";
            }
        };
    })(Utilities)
}

module.exports = Utilities;