import * as _ from 'lodash';

function Debounce(timeMs: any) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        if (descriptor === undefined) {
            descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
        }

        let originalMethod = descriptor.value;
        /* tslint:disable */
        descriptor.value = _.debounce(function() {
            let args = Array.from(arguments);

            return originalMethod.apply(this, args);
        }, timeMs);
        /* tslint:enable */

        return descriptor;
    };
};

export { Debounce };
