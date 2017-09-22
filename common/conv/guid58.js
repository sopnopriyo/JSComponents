/**
 * Generates a base58 GUID, on the client side
 * 
 * This is based off code that is under MIT licensing
 * 
 * https://github.com/cryptocoinjs/base-x/blob/master/index.js
 */

// The random int module
import getRandomInt from "~/components/JSComponents/common/math/getRandomInt.js"

// Reuse "constants" i suppose
let ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
let ALPHABET_MAP = {}
let BASE = ALPHABET.length
let LEADER = ALPHABET.charAt(0)

// pre-compute lookup table
for (let z = 0; z < ALPHABET.length; z++) {
	let x = ALPHABET.charAt(z)

  if (ALPHABET_MAP[x] !== undefined) throw new TypeError(x + ' is ambiguous')
  ALPHABET_MAP[x] = z
}

// Encoding an array of bytes to base58
function encode58(source) {
	if (source.length === 0) return ''

	var digits = [0]
	for (var i = 0; i < source.length; ++i) {
	  for (var j = 0, carry = source[i]; j < digits.length; ++j) {
		 carry += digits[j] << 8
		 digits[j] = carry % BASE
		 carry = (carry / BASE) | 0
	  }

	  while (carry > 0) {
		 digits.push(carry % BASE)
		 carry = (carry / BASE) | 0
	  }
	}

	var string = ''

	// deal with leading zeros
	for (var k = 0; source[k] === 0 && k < source.length - 1; ++k) string += ALPHABET[0]
	// convert digits to a string
	for (var q = digits.length - 1; q >= 0; --q) string += ALPHABET[digits[q]]

	return string
}

// Generate a GUID array (16 * 8 bits)
function generateGuidArray() {
	let ret = [];
	for(let i=0; i<16; ++i) {
		ret[i] = getRandomInt(0,255);
	}
	return ret;
}

// Actual GUID base 58 function
function guid58() {
	var guidArr = generateGuidArray();
	return encode58(guidArr);
}

// module export
export default guid58;