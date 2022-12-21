// This module handles data model

const dict_orden = ["r", "i", "a", "s", "e", "c"];
const category1 = ["s", "a", "i"];
const category2 = ["e", "r", "c"];

function letters_array(number_array) {
  var len = number_array.length;
  var indices = new Array(len);
  for (var i = 0; i < len; ++i) indices[i] = i;
  indices.sort(function (a, b) {
    return number_array[a] < number_array[b]
      ? -1
      : number_array[a] > number_array[b]
        ? 1
        : 0;
  });
  return indices.map((i) => dict_orden[i]).reverse();
}

function same_triada(char_array) {
  var cat1 = category1.slice();
  var cat2 = category2.slice();
  var first_three = char_array.slice(0, 3);

  if (
    first_three.sort().toString() == cat1.sort().toString() ||
    first_three.sort().toString() == cat2.sort().toString()
  ) {
    return true;
  } else {
    return false;
  }
}

function get_category(char_array) {
  var list = char_array.slice(0, 3);
  var count = 0;

  for (const element of list) {
    if (category1.includes(element)) {
      count += 1;
    }
  }

  if (count == 2) {
    return category1;
  } else {
    return category2;
  }
}

function get_element_outside_category(char_array) {
  var category = get_category(char_array);
  var first_three = char_array.slice(0, 3);

  for (const element of first_three) {
    if (!category.includes(element)) {
      return element;
    }
  }
}

function exchange_elements(a, b, char_array) {
  var index_a = char_array.indexOf(a);
  var index_b = char_array.indexOf(b);
  var list = char_array.slice();

  list[index_a] = b;
  list[index_b] = a;

  return list;
}

const insert = (arr, index, newItem) => [
  ...arr.slice(0, index),
  newItem,
  ...arr.slice(index)
]


function get_right_order(input_array) {
    var char_array = letters_array(input_array)
    var first_three = char_array.slice(0, 3);
    var last_three = char_array.slice(1).slice(-3);
    var a = get_element_outside_category(first_three);
    var initial_position_a = char_array.indexOf(a);
    var b = get_element_outside_category(last_three);
    var initial_position_b = char_array.indexOf(b);

    var result = char_array.slice()
    var result0 = result.splice(initial_position_a, 1)
    var result1 = insert(result, 2, a);
    var result2 = result1.splice(initial_position_b, 1)
    var result3 = insert(result1, 2, b);

    var result4 = result3.slice(0, 3)
    var result5 = result3.slice(1).slice(-3)

    
    var charOfMaxValue = char_array[0]

    var result6 = result5.concat(result4)

    // console.log(input_array)
    // console.log(dict_orden)
    
    // console.log(char_array)
    // console.log(charOfMaxValue)
    // console.log(result3)
    // console.log(result4)
    // console.log(result5)
    // console.log(result6)
    

    if (result4.includes(charOfMaxValue)){
        return result3
    } else {
        return result6
    }
}

function levenshtein(s1, s2) {
  var l1 = s1.length;
  var l2 = s2.length;
  var d = [];
  var c = 0;
  var a = 0;

  if (l1 == 0) return l2;

  if (l2 == 0) return l1;

  var d = new Buffer.alloc((l1 + 1) * (l2 + 1));
  a = l1 + 1;

  for (var i = 0; i <= l1; d[i] = i++);
  for (var j = 0; j <= l2; d[j * a] = j++);

  for (var i = 1; i <= l1; i++) {
    for (var j = 1; j <= l2; j++) {
      if (s1[i - 1] == s2[j - 1]) c = 0;
      else c = 1;
      var r = d[j * a + i - 1] + 1;
      var s = d[(j - 1) * a + i] + 1;
      var t = d[(j - 1) * a + i - 1] + c;

      d[j * a + i] = Math.min(Math.min(r, s), t);
    }
  }
  var result = d[l2 * a + l1]

  var rho = 0.1
  var exp = 1;
  for (var i = 0; i < 6; i++) {
    if (s1[i] == s2[i]) {
      result -= rho ** exp;
    }
    exp += 1;
  }

  return result + 1;
}
exports.levenshtein = levenshtein;

function getValidResult(input_array) {
  var list = letters_array(input_array);
  if (same_triada(list)) {
    return list;
  } else {
    return get_right_order(input_array).join("").toUpperCase();
  }
}

exports.getValidResult = getValidResult;

function minWordArray(word, array) {
  let min = array[0];
  for (const candidateWord of array) {
    if (levenshtein(word, candidateWord) < levenshtein(word, min)) {
      min = candidateWord;
    }
  }
  return min;
}

exports.minWordArray = minWordArray;

exports.minWordsArray = (word, array) => {
  const firstWord = minWordArray(word, array);
  array.splice(array.indexOf(firstWord), 1);
  const secondWord = minWordArray(word, array);
  array.splice(array.indexOf(secondWord), 1);
  const thirdWord = minWordArray(word, array);
  return [firstWord, secondWord, thirdWord];
}
