export function arrayAggregate(num, arr) {
    const newArray = [];
    const length = arr.length;
    let sum = 0;
    for (let i = 0; i < length; ++i) {
        sum += arr[i];
        if ((i + 1) % num === 0) {
            newArray.push(sum);
            sum = 0;
        }
    }
    const rest = length % num;
    if (rest !== 0) {
        newArray.push(sum);
    }
    return newArray;
}

export default {
    arrayAggregate,
};
