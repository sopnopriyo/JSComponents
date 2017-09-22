/**
 * Generate random int, including the minimum number, excluding the max number.
 * 
 * @param {Integer} min minimum number to randomly generate (inclusive) 
 * @param {Integer} max maximum number to randomly generate (excluding)
 * 
 * @return the randomly generated int
 */
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
 }

// module export
export default getRandomInt;